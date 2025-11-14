# KusinAI Architecture Overview

This document summarizes the overall system, major modules, and data flow to help the team quickly understand what each part does. It complements README_DEPLOY.md and README_MOBILE.md.

## System Overview
- Frontend: React + Vite + Tailwind (Capacitor for Android build) in `KusinAI/`
- Backend: Node.js + Express + MongoDB (Mongoose) in `kusinai-server/`
- Infra: Dockerfile for server, environment via `.env` files, mobile build tooling under `android/`

## Project Layout
- `KusinAI/`: Web/mobile client
  - `src/App.jsx`: Route definitions and layout wiring
  - `src/main.jsx`: React bootstrap
  - `src/Config.js`: Client config/constants (API base URL, flags)
  - `src/components/`: Reusable UI (layout, guards, scanner, chat, toasts)
  - `src/context/`: Global state providers (auth, toasts)
  - `src/pages/`: Route pages (auth, admin, recipes, etc.)
  - `src/utils/auth.js`: Small auth helpers
  - `public/assets/`: Static assets (logos, backgrounds)
  - `android/`: Capacitor Android project for native packaging
- `kusinai-server/`: API server and scripts
  - `server.js`: Express entrypoint (middleware, routes, server start)
  - `models/`: Mongoose schemas (`User`, `Recipe`)
  - `routes/`: Route modules (`auth`, `user`, `recipeRoutes`, `nutritionRoutes`, `scanner`, `chat`, `admin`, `feedback`, `testEmail`)
  - `scripts/`: Maintenance/migration scripts
  - `seed.js`: Dev seeding for baseline data
  - `Dockerfile`: Container build for the API

## Data Flow
1. Client calls API (e.g., login, search recipes, nutrition lookup)
2. Server authenticates/authorizes (JWT/session) and routes to handlers
3. Handlers delegate to models/services and return JSON responses
4. Client renders pages/components and updates contexts/state accordingly

## Auth Flow (High Level)
- Login/Register via `routes/auth.js` → JWT issued (stored by frontend)
- Route guards (`PrivateRoute`, `ProtectedRoute`) control page access
- Server-side route middleware validates JWT and role for protected endpoints

## Recipes + Nutrition
- Recipes are stored via `models/Recipe.js` and managed in `routes/recipeRoutes.js`
- Nutrition analysis endpoints live in `routes/nutritionRoutes.js`
- Ingredient scanning sent from `IngredientScanner` to server `routes/scanner.js`

## Conventions
- Keep route handlers thin; prefer services/utilities for heavy logic
- Put persistence shapes/validation in Mongoose models
- Use contexts for cross-cutting client state (auth, toasts)
- Avoid secrets in frontend config; use environment vars in backend

## Local Development
Backend:
- `cd kusinai-server`
- `npm install`
- Configure `.env` (Mongo URI, JWT secret, etc.)
- `npm start` (or `npm run dev` if available)

Frontend:
- `cd KusinAI`
- `npm install`
- `npm run dev` (Vite dev server)

## Notes
- For detailed deployment/mobile guidance see `README_DEPLOY.md` and `README_MOBILE.md`
- Scripts in `kusinai-server/scripts` are for maintenance/migrations; run carefully.
