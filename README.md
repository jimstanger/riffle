# Riffle Trivia Game

Riffle is a teams-based pub trivia game application with a dual-screen architecture designed for live trivia events at venues like bars or pubs. The participants answer the trivia questions on a paper form and submit them to assistants roaming the venue, the app allows for host control and progression display to the public.

In riparian ecology, a riffle is a shallow, fast-flowing section of a stream or river characterized by turbulent water moving over a rocky or gravelly bottom.

Architecture
The application uses a client-server architecture with real-time communication:

Backend (Bun):

Server built with Bun runtime (src/server/index.ts) bun v1.3.8.
WebSocket server for real-time bidirectional communication
HTTP server serving the React frontend and API endpoints
Runs on port 3000
Frontend (React + Vite):

Built with React 19 and React Router
Styled with Tailwind CSS 4
Two main routes:
/host - Private control panel for the trivia host
/display - Public screen for participants to view
How It Works
Game Flow:

Lobby Phase - Teams register and prepare
Question Phase - Display shows the current trivia question with shuffled multiple-choice answers
Scoring Phase - Reveals the correct answer and host updates team scores
Leaderboard Phase - Shows current team standings
Finished Phase - Final results when all questions are complete
Dual-Screen Setup:

Host Screen (src/client/pages/Host.tsx) - Private interface where the host can:

Add/remove teams
Adjust team scores (+1/-1 points)
Navigate between questions
Control game phases
Toggle and control a countdown timer
Preview current question with answers highlighted
Display Screen (src/client/pages/Display.tsx) - Public projection that shows:

Current question with shuffled answer options (A, B, C, D)
Timer (when visible)
Top team score
Question progress
Leaderboard rankings
Animated lobby and finish screens
Real-Time Sync:

Uses WebSocket connections (src/client/hooks/useWebSocket.ts)
All clients receive instant updates when the host makes changes
State managed centrally on the server (src/server/gameState.ts)
Tech Stack
Runtime: Bun
Frontend: React 19, React Router 7
Styling: Tailwind CSS 4
Build: Vite
Language: TypeScript
Real-time: WebSockets
Usage

## Development

bun run dev:server  # Start backend with hot reload
bun run dev:client  # Start Vite dev server

## Production

bun run build       # Build frontend
bun run start       # Start production server

To install dependencies:

```bash
bun install
```
