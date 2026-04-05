# Thicc Tracker 😭🍑

A workout planning and tracking app built with React, TypeScript, and Vite.

The app focuses on a calm, guided training flow:

- create workout plans with AI assistance
- run active sessions with set/rest guidance
- log completed sessions and streaks
- review progress in a dashboard with activity and muscle-load views

## Tech Stack

- React 19
- TypeScript
- Vite
- Zustand (persisted local state)
- React Router
- Tailwind CSS
- Lucide icons
- Google GenAI SDK (for plan parsing)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Create a `.env` file in the project root:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

Without this key, AI plan parsing is disabled and will throw an error.

### 3. Run the app

```bash
npm run dev
```

Open the local URL shown in your terminal (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` starts the development server
- `npm run build` runs TypeScript build + Vite production build
- `npm run preview` previews the production build locally
- `npm run lint` runs ESLint

## Project Structure

- `src/pages` app screens (Home, Dashboard, workout flow)
- `src/components/layout` shared layout components (navbar, backdrop, containers)
- `src/store/useWorkoutStore.ts` main app state and workout flow actions
- `src/services/ai.ts` AI workout plan parsing
- `src/services/historySync.ts` backend sync stub for completed sessions
- `src/utils/scheduler.ts` streak and activity helpers
- `src/types/workout.ts` workout domain types

## How Data Works

- app state is persisted in local storage using Zustand
- plans, active progress, and workout history survive page refreshes
- completed sessions are recorded in history and used for streak/dashboard metrics
- backend sync for completed workouts is currently a no-op stub in `historySync.ts`

## Notes

- this project currently assumes a client-side first workflow
- if you want server sync, implement `sendCompletedWorkoutToBackend` in `src/services/historySync.ts`

## License

See the `LICENSE` file in the repository root.
