# KusinAI Admin (Web)

Standalone admin dashboard for managing recipes and users. Built with React + Vite.

## Prerequisites
- Node.js and npm
- Backend URL reachable from the web (e.g., Render)

## Setup
```powershell
# In Windows PowerShell
Push-Location "g:\College\4th Year\Capstone Project\KusinAI-admin"
Copy-Item .env.example .env.local
# Edit .env.local with your backend URL
$env:VITE_API_URL = "https://your-backend.onrender.com"
npm install
npm run dev
Pop-Location
```

## Build
```powershell
Push-Location "g:\College\4th Year\Capstone Project\KusinAI-admin"
$env:VITE_API_URL = "https://your-backend.onrender.com"
npm run build
Pop-Location
```

## Deploy (Vercel example)
- Set `VITE_API_URL` in Vercel project settings.
- Deploy the `dist/` build.
- `vercel.json` includes SPA rewrites.

## Notes
- Admin routes are protected and require `role === 'admin'`.
- APK app should not include admin routes; admins use this site.
