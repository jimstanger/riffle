import { useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import Timer from '../components/Timer';

function Display() {
  const { gameState, connected } = useWebSocket();

  // Combine correct and incorrect answers and shuffle - memoized by question index only
  // Must call all hooks before any conditional returns
  // Only depends on currentQuestionIndex so answers don't re-shuffle when phase changes
  const allAnswers = useMemo(() => {
    if (!gameState?.questions) return [];
    const question = gameState.questions[gameState.currentQuestionIndex];
    if (!question) return [];
    return [
      question.correct_answer,
      ...question.incorrect_answers,
    ].sort(() => Math.random() - 0.5);
  }, [gameState?.currentQuestionIndex]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-4xl">Connecting...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-4xl">Loading...</div>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-purple-pink-gradient min-h-screen px-24 py-20">
      <div className="container-960">
        {/* Top Stats Bar */}
        {gameState.phase !== 'lobby' && gameState.phase !== 'leaderboard' && gameState.phase !== 'finished' && (
          <div className="flex items-center justify-center gap-10 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-white font-bold text-xl flex items-center gap-2">
              <span className="text-2xl">🏆</span> Score: {sortedTeams[0]?.score || 0}
            </div>
            {gameState.timerVisible && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-white font-bold text-xl flex items-center gap-2">
                <span className="text-2xl">⏱️</span> <Timer isActive={gameState.timerRunning} duration={30} />
              </div>
            )}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-white font-bold text-xl">
              Question {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
            </div>
          </div>
        )}

        {/* Lobby Welcome */}
        {gameState.phase === 'lobby' && (
          <div className="text-center py-20">
            <div className="text-8xl mb-8 animate-bounce">🎉</div>
            <h1 className="text-9xl font-black text-white mb-6 italic" style={{ fontFamily: 'Impact, sans-serif' }}>
              PUB TRIVIA!
            </h1>
            <p className="text-3xl text-white mb-12 font-semibold">
              Test your knowledge and have a blast!
            </p>
            <button className="bg-yellow-400 text-gray-900 px-12 py-5 rounded-full text-2xl font-black hover:bg-yellow-300 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto">
              <span className="text-3xl">✨</span> Choose Your Teams!
            </button>
            <div className="flex justify-center gap-3 mt-12">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-white/40 rounded-full"></div>
              ))}
            </div>
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && gameState.phase !== 'finished' && gameState.phase !== 'lobby' && gameState.phase !== 'leaderboard' && (
          <div>
            <div className="bg-white rounded-3xl p-10 mb-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-5xl">⚡</span>
                <div
                  className="text-6xl font-bold text-gray-800 leading-tight"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {allAnswers.map((answer, index) => {
                const isCorrect = answer === currentQuestion.correct_answer;
                const showCorrect = gameState.phase === 'scoring' && isCorrect;

                return (
                  <button
                    key={index}
                    className={`rounded-3xl p-8 text-left transition-all duration-300 ${
                      showCorrect
                        ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-xl'
                        : 'text-white'
                    }`}
                  >
                    <div className="flex items-start gap-8">
                      <div className={`text-5xl font-black ${showCorrect ? 'text-white' : 'text-white'}`}>
                        {String.fromCharCode(65 + index)}.
                      </div>
                      <div
                        className={`text-3xl font-bold ${showCorrect ? 'text-white' : 'text-white'}`}
                        dangerouslySetInnerHTML={{ __html: answer }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 mb-4">
              <div
                className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Leaderboard Phase */}
        {gameState.phase === 'leaderboard' && (
          <div>
            <div className="text-center mb-12">
              <div className="text-8xl mb-4">🏆</div>
              <h1 className="text-7xl font-black text-white mb-4 italic" style={{ fontFamily: 'Impact, sans-serif' }}>
                LEADERBOARD
              </h1>
              <p className="text-3xl text-white font-semibold">
                Current Standings
              </p>
            </div>
            {sortedTeams.length > 0 ? (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-wrap justify-center">
                  {sortedTeams.map((team, index) => (
                    <div key={team.id} className="team-card border-2 py-12 px-6 text-center">
                      <div className="team-place mb-6">
                        #{index + 1}
                      </div>
                      <div className="team-name mb-8">
                        {team.name}
                      </div>
                      <div className="team-score">
                        {team.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 shadow-2xl text-center">
                <p className="text-3xl text-white font-semibold">
                  No teams yet. Add teams from the Host screen to get started!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Game Finished */}
        {gameState.phase === 'finished' && (
          <div>
            <div className="text-center py-16">
              <div className="text-9xl mb-8 animate-bounce">🏆</div>
              <h1 className="text-8xl font-black text-white mb-6 italic">
                GAME OVER!
              </h1>
              <p className="text-4xl text-white font-bold mb-12">Final Scores Below</p>
            </div>
            {sortedTeams.length > 0 && (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-wrap justify-center">
                  {sortedTeams.map((team, index) => (
                    <div key={team.id} className="team-card border-2 py-12 px-6 text-center">
                      <div className="team-place mb-6">
                        #{index + 1}
                      </div>
                      <div className="team-name mb-8">
                        {team.name}
                      </div>
                      <div className="team-score">
                        {team.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Display;
