import type { ServerWebSocket } from 'bun';
import type { GameState, Team, Question, WSMessage } from './types';

export class GameStateManager {
  private state: GameState;
  private clients: Set<ServerWebSocket<unknown>> = new Set();

  constructor(questions: Question[]) {
    this.state = {
      teams: [],
      questions,
      currentQuestionIndex: 0,
      phase: 'lobby',
      timerVisible: false,
      timerRunning: false,
    };
  }

  addClient(ws: ServerWebSocket<unknown>): void {
    this.clients.add(ws);
    this.sendState(ws);
  }

  removeClient(ws: ServerWebSocket<unknown>): void {
    this.clients.delete(ws);
  }

  handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'addTeam':
        this.addTeam(message.name);
        break;
      case 'removeTeam':
        this.removeTeam(message.teamId);
        break;
      case 'updateScore':
        this.updateScore(message.teamId, message.delta);
        break;
      case 'nextQuestion':
        this.nextQuestion();
        break;
      case 'previousQuestion':
        this.previousQuestion();
        break;
      case 'setPhase':
        this.setPhase(message.phase);
        break;
      case 'setTimerVisible':
        this.setTimerVisible(message.visible);
        break;
      case 'setTimerRunning':
        this.setTimerRunning(message.running);
        break;
    }
  }

  private addTeam(name: string): void {
    const team: Team = {
      id: crypto.randomUUID(),
      name,
      score: 0,
    };
    this.state.teams.push(team);
    this.broadcastState();
  }

  private removeTeam(teamId: string): void {
    this.state.teams = this.state.teams.filter(t => t.id !== teamId);
    this.broadcastState();
  }

  private updateScore(teamId: string, delta: number): void {
    console.log('[Server] updateScore called with teamId:', teamId, 'delta:', delta);
    console.log('[Server] Current teams:', this.state.teams.map(t => ({ id: t.id, name: t.name, score: t.score })));
    const team = this.state.teams.find(t => t.id === teamId);
    if (team) {
      console.log('[Server] Found team:', team.name, 'updating score from', team.score, 'to', team.score + delta);
      team.score += delta;
      this.broadcastState();
    } else {
      console.log('[Server] ERROR: Team not found for id:', teamId);
    }
  }

  private nextQuestion(): void {
    if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
      this.state.currentQuestionIndex++;
      this.broadcastState();
    } else if (this.state.currentQuestionIndex === this.state.questions.length - 1) {
      this.state.phase = 'finished';
      this.broadcastState();
    }
  }

  private previousQuestion(): void {
    if (this.state.currentQuestionIndex > 0) {
      this.state.currentQuestionIndex--;
      this.broadcastState();
    }
  }

  private setPhase(phase: GameState['phase']): void {
    this.state.phase = phase;
    this.broadcastState();
  }

  private setTimerVisible(visible: boolean): void {
    this.state.timerVisible = visible;
    this.broadcastState();
  }

  private setTimerRunning(running: boolean): void {
    this.state.timerRunning = running;
    this.broadcastState();
  }

  private sendState(ws: ServerWebSocket<unknown>): void {
    const message: WSMessage = {
      type: 'state',
      data: this.state,
    };
    ws.send(JSON.stringify(message));
  }

  private broadcastState(): void {
    const message: WSMessage = {
      type: 'state',
      data: this.state,
    };
    const messageStr = JSON.stringify(message);

    this.clients.forEach(client => {
      try {
        client.send(messageStr);
      } catch (error) {
        console.error('Error sending to client:', error);
        this.clients.delete(client);
      }
    });
  }

  getState(): GameState {
    return this.state;
  }
}
