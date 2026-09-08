# QuizRush — Think Fast. Play Smarter.
Real-time solo + multiplayer quiz battles. React + TS + Vite + Tailwind + Zustand + Framer Motion.
## Run (frontend)
npm install
npm run dev
## AI questions via backend (Gemini lives on the server, never in the browser)
1. Get a free key at https://aistudio.google.com/apikey.
2. `cp server/.env.example server/.env` and set `GEMINI_API_KEY`.
3. Run it: `npm start --prefix server` (health: http://localhost:8787/api/health).
4. `cp .env.example .env`, set `VITE_AI_ENDPOINT=http://localhost:8787`, restart `npm run dev`.
5. Solo + rooms now load Gemini questions per your setup (category/count/difficulty),
   validated server-side, with seeded fallback if AI fails.
Deploy: push this repo to Render using `render.yaml` (sets `GEMINI_API_KEY` in
Render dashboard), then point the frontend `VITE_AI_ENDPOINT` at the Render URL.
## Demo Mode
Without backend config: seeded question bank and local practice rooms on this device.
## Multiplayer (live, via backend)
The server (`server/index.js`) hosts WebSocket rooms at `/socket`: create/join by
code, live lobby, server-synced countdown/questions/timer, authoritative scoring,
live leaderboard and results. Set `VITE_AI_ENDPOINT` and the app plays live across
devices; without it, rooms fall back to local practice.
## Scripts
- npm run dev / build / preview
