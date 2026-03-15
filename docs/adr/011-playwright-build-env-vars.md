# ADR 011: Build-time Environment Variables for Frontend

## Status
Accepted

## Context
The application uses Vite for the frontend. Vite follows a philosophy where environment variables prefixed with `VITE_` are statically embedded into the JavaScript bundle during the build step (`vite build`).

Previously, some environment variables (like Firebase configuration) were being passed at runtime during the Playwright test execution in CI. This caused the application to crash because the generated bundle had `undefined` values for critical services.

## Decision
We will ensure that all critical frontend environment variables (`VITE_*`) are available during the **build step** in all environments:

1.  **Local Dev**: Manual `.env` file or shell variables.
2.  **CI (GitHub Actions)**: Defined as `env` in the "Build Frontend" step of `ci.yml`.
3.  **Production (Render)**: Defined as **Build-time environment variables** (passed via `Dockerfile` `ARG`).

## Consequences
-   Changing a frontend environment variable (like an API key or Project ID) requires a **full rebuild** and redeployment of the container.
-   The `Dockerfile` must explicitly declare `ARG` for each variable to be passed from the CI/CD platform to the Vite build process.
-   We provide "dummy" values in CI for tests to ensure the build succeeds and the app remains functional in a headless environment.
