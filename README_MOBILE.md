# Building an Android APK (Capacitor) for KusinAI

This file documents an approach to produce an Android APK from the existing React/Vite frontend using Capacitor. It assumes your backend remains hosted (Render) and accessible from the device.

Prerequisites
- Node.js & npm installed.
- Android Studio + Android SDK (for building the APK).
- A hosted backend URL (e.g., a Render service) reachable from the phone. Set that URL as `VITE_API_URL` before building.

High-level steps
1. Install Capacitor in the frontend project

   # from `KusinAI` folder (PowerShell)
   npm install @capacitor/core @capacitor/cli --save

2. Initialize Capacitor (one-time)

   # replace values with your app id/name
   npx cap init KusinAI com.yourcompany.kusinai

3. Build the web app

   # set API url for the build, then run build
   $env:VITE_API_URL = 'https://your-backend.onrender.com'
   npm run build

4. Copy web assets to native projects

   npx cap copy

5. Add the Android platform and open Android Studio

   npx cap add android
   npx cap open android

6. Build & sign in Android Studio

- In Android Studio: Build > Generate Signed Bundle / APK... and follow the wizard to produce a signed APK.
- Make sure `minSdkVersion`/`targetSdkVersion` in the Android project meet Play Store requirements if you plan to publish.

Notes and tips
- CORS: The backend must allow requests from the WebView origin. Generally the app loads assets from the local WebView origin, so configure CORS on the server to allow the app (or allow all origins for simplicity during testing).
- Environment variables: Vite inlines env vars at build time. To change `VITE_API_URL` you'll need to rebuild and create a new APK.
- Runtime configuration: If you want to avoid rebuilding to change backend URLs, implement a small runtime config fetch (e.g., request a JSON from a fixed URL on app start) or use Capacitor's native preferences to set values post-install.
- Push notifications, native permissions, and other mobile-only features require Capacitor plugins and Android-manifest changes.

Troubleshooting
- If the web UI looks different in Android, check the WebView Chrome version in Android Studio's emulator/device and test for unsupported CSS features.
- If network calls fail on device, ensure the device/emulator has network access and the backend URL is reachable and not blocked by a firewall.

If you'd like, I can:
- Add a small wrapper script in `KusinAI` to set `VITE_API_URL` and run `npm run build` + `npx cap copy`.
- Create a short sample `capacitor.config.json` written to the repo with recommended settings for prod.
