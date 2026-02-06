import { useEffect, useState, useCallback, useRef } from 'react';

interface Question {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface Team {
  id: string;
  name: string;
  score: number;
}

interface GameState {
  teams: Team[];
  questions: Question[];
  currentQuestionIndex: number;
  phase: 'lobby' | 'question' | 'scoring' | 'leaderboard' | 'finished';
  timerVisible: boolean;
  timerRunning: boolean;
}

type WSMessage =
  | { type: 'state'; data: GameState }
  | { type: 'addTeam'; name: string }
  | { type: 'removeTeam'; teamId: string }
  | { type: 'updateScore'; teamId: string; delta: number }
  | { type: 'nextQuestion' }
  | { type: 'previousQuestion' }
  | { type: 'setPhase'; phase: GameState['phase'] }
  | { type: 'setTimerVisible'; visible: boolean }
  | { type: 'setTimerRunning'; running: boolean };

export function useWebSocket() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        if (message.type === 'state') {
          setGameState(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      // Attempt to reconnect after 2 seconds
      setTimeout(() => connect(), 2000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: Omit<WSMessage, 'type' | 'data'> & { type: string }) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const addTeam = useCallback((name: string) => {
    sendMessage({ type: 'addTeam', name });
  }, [sendMessage]);

  const removeTeam = useCallback((teamId: string) => {
    sendMessage({ type: 'removeTeam', teamId });
  }, [sendMessage]);

  const updateScore = useCallback((teamId: string, delta: number) => {
    console.log('[Client] updateScore called with teamId:', teamId, 'delta:', delta);
    sendMessage({ type: 'updateScore', teamId, delta });
  }, [sendMessage]);

  const nextQuestion = useCallback(() => {
    sendMessage({ type: 'nextQuestion' });
  }, [sendMessage]);

  const previousQuestion = useCallback(() => {
    sendMessage({ type: 'previousQuestion' });
  }, [sendMessage]);

  const setPhase = useCallback((phase: GameState['phase']) => {
    sendMessage({ type: 'setPhase', phase });
  }, [sendMessage]);

  const setTimerVisible = useCallback((visible: boolean) => {
    sendMessage({ type: 'setTimerVisible', visible });
  }, [sendMessage]);

  const setTimerRunning = useCallback((running: boolean) => {
    sendMessage({ type: 'setTimerRunning', running });
  }, [sendMessage]);

  return {
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
  };
}

export type { GameState, Team, Question };
