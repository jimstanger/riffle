import { serve, file } from 'bun';
import type { ServerWebSocket } from 'bun';
import { join } from 'path';
import { TriviaLoader } from './triviaLoader';
import { GameStateManager } from './gameState';
import type { WSMessage } from './types';

// Initialize trivia loader and game state
const triviaLoader = new TriviaLoader();
const triviaDir = join(import.meta.dir, '../../trivia');
const questions = await triviaLoader.loadQuestions(triviaDir);

if (questions.length === 0) {
  console.error('No trivia questions loaded! Check the trivia directory.');
  process.exit(1);
}

const gameState = new GameStateManager(questions);

// Create HTTP and WebSocket server
const server = serve({
  port: 3000,
  async fetch(req, server) {
    const url = new URL(req.url);

    // Handle WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response('WebSocket upgrade failed', { status: 400 });
      }
      return undefined;
    }

    // API endpoint to get current state
    if (url.pathname === '/api/state') {
      return new Response(JSON.stringify(gameState.getState()), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Serve static files from dist folder
    const distPath = join(import.meta.dir, '../../dist');
    let filePath = join(distPath, url.pathname);

    // If requesting root or directory, serve index.html
    if (url.pathname === '/' || url.pathname.endsWith('/')) {
      filePath = join(distPath, 'index.html');
    }

    // For client-side routing (React Router), serve index.html for unknown paths
    try {
      const staticFile = file(filePath);
      if (await staticFile.exists()) {
        return new Response(staticFile);
      }
      // Fallback to index.html for client-side routing
      return new Response(file(join(distPath, 'index.html')));
    } catch {
      return new Response(file(join(distPath, 'index.html')));
    }
  },
  websocket: {
    open(ws: ServerWebSocket<unknown>) {
      console.log('WebSocket client connected');
      gameState.addClient(ws);
    },
    message(ws: ServerWebSocket<unknown>, message: string | Buffer) {
      try {
        const data: WSMessage = JSON.parse(message.toString());
        gameState.handleMessage(data);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    },
    close(ws: ServerWebSocket<unknown>) {
      console.log('WebSocket client disconnected');
      gameState.removeClient(ws);
    },
  },
});

console.log(`🎮 Tavern Trivia server running on http://localhost:${server.port}`);
console.log(`📺 Display: http://localhost:${server.port}/display`);
console.log(`🎯 Host: http://localhost:${server.port}/host`);
