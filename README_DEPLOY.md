KusinAI - Deployment Notes

This project contains two parts:

- kusinai-server/ (Express + Mongoose backend)
- KusiNAI/ (React + Vite frontend)

Quick deployment checklist

1. Environment
   - Create `.env` files from the provided `.env.example` files in each folder and fill values.
   - Backend `.env` should include `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `GOOGLE_VISION_API_KEY`, and SMTP credentials if you use email features.
   - Frontend `.env` should include `VITE_API_URL` pointing to the backend URL.

2. Build frontend
   - From the `KusinAI` folder run:
     npm install
     npm run build
   - This outputs a `dist/` folder with static assets.

3. Backend
   - From the `kusinai-server` folder run:
     npm install
     # ensure .env is populated
     npm start
   - The server now serves backend API at the configured PORT and will serve the frontend `dist/` when `NODE_ENV=production`.

4. Production considerations
   - Use a process manager (PM2, systemd, or similar) to keep the server running.
   - Use HTTPS (nginx reverse proxy or managed platform) and set correct env variables.
   - Add rate limiting and monitoring for external APIs (OpenAI, Google Vision) to avoid surprise costs.
   - For persistent chat sessions, consider adding Redis for session storage (not implemented by default).

5. Optional
   - Use Docker to containerize backend and serve frontend via Nginx. I can create Dockerfiles if needed.

Files added/changed to help deployment
- `kusinai-server/.env.example`
- `KusinAI/.env.example`
- `kusinai-server/package.json` now includes a `start` script
- `kusinai-server/server.js` will serve frontend `dist/` when `NODE_ENV=production`

If you want, I can also:
- Add Dockerfiles for backend and frontend and a `docker-compose.yml` to run everything locally.
- Add PM2 ecosystem config and a simple systemd unit example.
- Add production-grade middleware (rate-limit, helmet) and logging.

Mobile / APK note
-----------------
This project was updated to support a mobile-only distribution workflow (APK). There are two common approaches:

- Wrap the built web app with Capacitor and build a native Android APK (recommended when you want to reuse the existing React/Vite UI). See `README_MOBILE.md` for step-by-step instructions.
- Alternatively, port the UI to a native framework (React Native / Flutter). That requires more work but yields a true native app.

Hosting & services (your setup)
-------------------------------
- Backend (API): Render — deploy the `kusinai-server` service. Use the `npm start` command (already present in `kusinai-server/package.json`) as the start command in Render. Make sure the `PORT` env var is available (Render provides one automatically).
- Database: MongoDB Atlas — supply the connection string as `MONGODB_URI` in Render's environment settings.
- Frontend web hosting (optional): Vercel — only necessary if you want a web preview of the app or to host assets. If you distribute solely via APK, you don't need Vercel for production, but it can be handy for QA and web previews.

Docker
------
I added a simple `Dockerfile` in `kusinai-server/` to make containerized deployment easier. Render can run either from a Docker image or directly from the Node app. The Docker image is minimal and uses the `npm start` script.

Runtime config for mobile builds
------------------------------
- The mobile APK will ship the frontend assets built at compile time. That means `VITE_API_URL` (or whichever runtime API URL you use) must be baked into the build when running `npm run build`.
- For development/test builds you can point `VITE_API_URL` to a staging Render service. For production, build with the production backend URL.
- If you need to change the backend URL after an APK is published, consider implementing a small remote configuration endpoint or use Capacitor's native preferences to store runtime config.

Next steps I can take (optional)
--------------------------------
- Create a `docker-compose.yml` to run backend + a local MongoDB for development.
- Add PM2 ecosystem file for process management.
- Add basic production middleware (helmet, express-rate-limit) and logging.

