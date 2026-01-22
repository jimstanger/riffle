document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    
    const startContainer = document.getElementById('start-container');
    const questionContainer = document.getElementById('question-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const scoreContainer = document.getElementById('score-container');

    const questionText = document.getElementById('question-text');
    const roundText = document.getElementById('round-text');
    const answersContainer = document.getElementById('answers-container');
    const feedbackText = document.getElementById('feedback-text');
    const scoreEl = document.getElementById('score');
    const finalScoreEl = document.getElementById('final-score');

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // Parser for the CSV data
    function parseCSV(csvData) {
        const lines = csvData.trim().split(/\r?\n/);
        const headers = lines[0].split(',').map(h => h.trim());
        const questions = [];

        for (let i = 1; i < lines.length; i++) {
            // This regex handles quoted fields containing commas.
            const data = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];

            if (data.length >= headers.length) {
                const question = {
                    round: data[0].trim(),
                    question: data[1].trim().replace(/^"|"$/g, '').replace(/""/g, '"'), // remove outer quotes and fix inner quotes
                    correct: data[2].trim(),
                    incorrects: {
                        incorrect1: data[3].trim(),
                        incorrect2: data[4].trim(),
                        incorrect3: data[5].trim()
                    }
                };
                questions.push(question);
            }
        }
        return questions;
    }

    const fetchQuestions = async () => {
        try {
            const res = await fetch('/data/nosc_trivia.csv');
            const csvData = await res.text();
            questions = parseCSV(csvData);
        } catch (error) {
            console.error('Error fetching or parsing trivia data:', error);
            questionText.textContent = 'Failed to load questions. Please try refreshing the page.';
        }
    };

    const startGame = () => {
        startContainer.classList.add('hidden');
        scoreContainer.classList.add('hidden');
        questionContainer.classList.remove('hidden');
        currentQuestionIndex = 0;
        score = 0;
        updateScore();
        showQuestion();
    };

    const showQuestion = () => {
        feedbackContainer.classList.add('hidden');
        questionContainer.classList.remove('hidden');

        if (currentQuestionIndex >= questions.length) {
            endGame();
            return;
        }

        const question = questions[currentQuestionIndex];
        roundText.textContent = `Round ${question.round}`;
        questionText.textContent = question.question;
        answersContainer.innerHTML = '';

        const answers = [question.correct, ...Object.values(question.incorrects)];
        shuffleArray(answers);
        
        answers.forEach((answer, index) => {
            const button = document.createElement('button');
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            button.textContent = `${letter}. ${answer}`;
            button.dataset.answer = answer; // Store the raw answer
            button.classList.add('answer-btn');
            button.addEventListener('click', (event) => handleAnswer(answer, question.correct, event.target));
            answersContainer.appendChild(button);
        });
    };
    
    const handleAnswer = (selectedAnswer, correctAnswer, clickedButton) => {
        const buttons = answersContainer.querySelectorAll('.answer-btn');
        let correctButton;

        buttons.forEach(button => {
            button.disabled = true;
            // Use dataset to find the correct button
            if (button.dataset.answer === correctAnswer) {
                correctButton = button;
            }
        });

        if (selectedAnswer === correctAnswer) {
            score++;
            feedbackText.textContent = "Correct!";
            clickedButton.classList.add('correct');
        } else {
            feedbackText.textContent = `Sorry, the correct answer was: ${correctAnswer}`;
            clickedButton.classList.add('incorrect');
            correctButton.classList.add('correct');
        }
        
        updateScore();
        questionContainer.classList.add('hidden');
        feedbackContainer.classList.remove('hidden');
    };
    
    const nextQuestion = () => {
        currentQuestionIndex++;
        showQuestion();
    };

    const endGame = () => {
        questionContainer.classList.add('hidden');
        feedbackContainer.classList.add('hidden');
        scoreContainer.classList.remove('hidden');
        finalScoreEl.textContent = score;
    };

    const updateScore = () => {
        scoreEl.textContent = score;
    };

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    startBtn.addEventListener('click', startGame);
    playAgainBtn.addEventListener('click', startGame);
    nextQuestionBtn.addEventListener('click', nextQuestion);

    fetchQuestions();
});
