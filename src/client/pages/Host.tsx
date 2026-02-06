import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

function Host() {
  const {
    gameState,
    connected,
    addTeam,
    removeTeam,
    updateScore,
    nextQuestion,
    previousQuestion,
    setPhase,
    setTimerVisible,
    setTimerRunning,
  } = useWebSocket();

  const [teamName, setTeamName] = useState('');

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      addTeam(teamName.trim());
      setTeamName('');
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Connecting to server...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading game state...</div>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 px-24 py-16">
      <div className="container-960">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">🎯 Host Control Panel</h1>
          <div className="text-lg opacity-90">
            Question {gameState.currentQuestionIndex + 1} of {gameState.questions.length} •
            Phase: <span className="font-semibold capitalize">{gameState.phase}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Teams */}
          <div className="space-y-6">
            {/* Add Team */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Add Team</h2>
              <form onSubmit={handleAddTeam} className="flex gap-2">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Team List */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Teams ({gameState.teams.length})
              </h2>
              {gameState.teams.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No teams yet. Add teams to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {gameState.teams.map((team, index) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2 bg-gray-50 border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-gray-500">
                          #{index + 1}
                        </div>
                        <div className="font-semibold text-lg">{team.name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-blue-600">
                          {team.score}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateScore(team.id, 1)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 font-bold"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => updateScore(team.id, -1)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 font-bold"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => removeTeam(team.id)}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Question & Controls */}
          <div className="space-y-6">
            {/* Question Controls */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Question Navigation
              </h2>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={previousQuestion}
                  disabled={gameState.currentQuestionIndex === 0}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={
                    gameState.currentQuestionIndex >= gameState.questions.length - 1
                  }
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition"
                >
                  Next →
                </button>
              </div>
              <div className="text-sm text-gray-600 text-center">
                {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
              </div>
            </div>

            {/* Game Phase */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Game Phase
              </h2>
              <div className="flex flex-wrap gap-2">
                {(['lobby', 'question', 'scoring', 'leaderboard', 'finished'] as const).map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setPhase(phase)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      gameState.phase === phase
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {phase.charAt(0).toUpperCase() + phase.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Controls */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Timer Controls
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Timer Visibility:</span>
                  <button
                    onClick={() => setTimerVisible(!gameState.timerVisible)}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      gameState.timerVisible
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {gameState.timerVisible ? '👁️ Visible' : '🚫 Hidden'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Timer Status:</span>
                  <button
                    onClick={() => setTimerRunning(!gameState.timerRunning)}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      gameState.timerRunning
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {gameState.timerRunning ? '⏸️ Stop' : '▶️ Start'}
                  </button>
                </div>
              </div>
            </div>

            {/* Current Question Preview */}
            {currentQuestion && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Current Question
                </h2>
                <div className="text-sm text-blue-600 mb-2">
                  {currentQuestion.category} • {currentQuestion.difficulty}
                </div>
                <div
                  className="text-lg font-semibold mb-4 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />
                <div className="space-y-2">
                  <div className="text-sm font-bold text-green-700 bg-green-50 p-2 rounded">
                    ✓ {currentQuestion.correct_answer}
                  </div>
                  {currentQuestion.incorrect_answers.map((answer, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      {answer}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Display Link */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-2">Display Screen URL:</div>
          <a
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-mono text-blue-600 hover:text-blue-800"
          >
            {window.location.origin}/display
          </a>
        </div>
      </div>
    </div>
  );
}

export default Host;
