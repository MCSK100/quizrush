# QuizRush — Think Fast. Play Smarter.
Real-time solo + multiplayer quiz battles. React + TS + Vite + Tailwind + Zustand + Framer Motion.
## Run
npm install
npm run dev
## Env — Gemini AI (optional, app runs in Demo Mode without it)
1. Go to https://aistudio.google.com/apikey and create a free API key.
2. `cp .env.example .env` and set `VITE_GEMINI_API_KEY=<your key>`.
3. Restart `npm run dev`. Solo + multiplayer setups will now generate live
   questions via `gemini-2.0-flash` (validated, with seeded fallback).
   For production, proxy through your server and keep the key in `GEMINI_API_KEY` there.
## Demo Mode
Without backend config: seeded questions, simulated bots, countdowns, live leaderboard movement all work locally.
## Scripts
- npm run dev / build / preview
