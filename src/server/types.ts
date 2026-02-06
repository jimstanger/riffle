export interface Question {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface GameState {
  teams: Team[];
  questions: Question[];
  currentQuestionIndex: number;
  phase: 'lobby' | 'question' | 'scoring' | 'leaderboard' | 'finished';
  timerVisible: boolean;
  timerRunning: boolean;
}

export type WSMessage =
  | { type: 'state'; data: GameState }
  | { type: 'addTeam'; name: string }
  | { type: 'removeTeam'; teamId: string }
  | { type: 'updateScore'; teamId: string; delta: number }
  | { type: 'nextQuestion' }
  | { type: 'previousQuestion' }
  | { type: 'setPhase'; phase: GameState['phase'] }
  | { type: 'setTimerVisible'; visible: boolean }
  | { type: 'setTimerRunning'; running: boolean };
