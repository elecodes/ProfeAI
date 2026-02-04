# Docker Guide for AppTutor Safe

Your application is already configured and setup to run in Docker!

## Current Status
- **URL**: [http://localhost:3001](http://localhost:3001)
- **Container Name**: `apptutor_safe-app`
- **Port**: 3001

## Why use Docker for AppTutor?
For your specific project (React Frontend + Node.js Backend), Docker provides three massive benefits:

1.  **"It Just Works" Everywhere**:
    - Right now, your app needs specific versions of Node.js and dependencies.
    - Docker locks these in (using `node:20`). If you update Node on your Mac tomorrow, your app won't break because it runs in its own isolated bubble.

2.  **Unified Production Build**:
    - Your `Dockerfile` automatically builds your React frontend (`npm run build`) and connects it to your Node backend.
    - You don't need to run two separate terminals (`vite` and `server`) or worry about build steps. One command (`docker-compose up`) starts the whole system.

3.  **Security & Cleanliness**:
    - As we just saw, we fixed vulnerabilities by updating the Docker image, not by messing with your Mac's system files.
    - If you install a database or other tools later, they live in Docker, keeping your Mac clean.

## Common Commands

Run these commands in the terminal from the project root.

### 1. Start the Application
Starts the container in the background.
```bash
docker-compose up -d
```

### 2. Stop the Application
Stops and removes the containers.
```bash
docker-compose down
```

### 3. Rebuild (After Code Changes)
If you modify code (like `server.ts` or `src/`), you must rebuild:
```bash
docker-compose up --build -d
```

### 4. View Logs
See what's happening inside the container (useful for errors).
```bash
docker-compose logs -f app
```
(Press `Ctrl+C` to exit logs)

### 5. Check Disk Space
Since disk space is tight (~12GB available), occasionally run this to clean up unused Docker data:
```bash
docker system prune
```

## Deployment Ready
The same `Dockerfile` used locally is optimized for cloud platforms like **Render**:
1.  **Uniformity**: We use the same image definition for dev and prod.
2.  **Statics**: React is built and served by Express, eliminating Nginx needs for simple setups.

## Configuration Files
- **Dockerfile**: (Root) Defines the multi-stage build (React Build -> Node Server).
- **docker-compose.yml**: Orchestrates local development.
- **.dockerignore**: Keeps the build context clean.
