# Cleanup suggestions and safe steps

This project contains both a frontend (`KusinAI/`) and backend (`kusinai-server/`). Below are safe, manual cleanup suggestions and commands to help you find and remove unused dependencies and files. I do not remove anything automatically—these are recommended steps you can run locally and validate before deleting.

1) Audit installed packages

From each folder run:

  npm prune
  npm dedupe

2) Find likely unused packages (local check)

Install `depcheck` globally or run via npx:

  npx depcheck

Review the output carefully—`depcheck` can report false positives (e.g., packages used via string-based imports, build tooling, or runtime). Remove packages only after manual verification.

3) Remove unused files

- Remove `dist/` or `build/` folders from VCS (already ignored by `.gitignore` typically).
- Check for large media or old screenshots in `public/assets/` and move them to a storage bucket if needed.

4) Lockfiles and reproducible builds

- Commit `package-lock.json` for both `KusinAI` and `kusinai-server` if you want reproducible installs. If none exist, run `npm install` and commit the generated lockfile.

5) Lint / Format

- Run your project's linters or tests (if present). For quick checks, run `npm run build` in `KusinAI` and `node server.js` in `kusinai-server` to ensure nothing breaks.

6) Optional: create a small CI job

- Add a GitHub Action to run `npm ci` and `npm run build` to catch broken dependencies early.

If you'd like, I can run a safe automated scan (list files over 5 MB, run `depcheck` suggestions) and create a report — tell me when to proceed and I'll run the checks locally in this workspace.
