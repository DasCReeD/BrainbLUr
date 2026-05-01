# Backend Map
*Freshness: 2026-05-01*

## Overview
BrainBlur is a **0-backend application**. It operates entirely within the user's browser, utilizing WebGL and Web Audio APIs.

## CI/CD Infrastructure
While there is no active server, the project relies on GitHub Actions for its "backend" deployment infrastructure.

*   **Workflow**: `.github/workflows/deploy.yml`
*   **Process**:
    1. Triggers on push to `main`.
    2. Provisions an Ubuntu runner.
    3. Executes `npm install` and `npm run build` (Vite).
    4. Uploads the `dist/` directory as a GitHub Pages artifact.
    5. Deploys to the production GitHub Pages environment.
