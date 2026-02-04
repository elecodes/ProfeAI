# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifest and workspace manifests
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for the whole monorepo
RUN npm install

# Copy source code
COPY . .

# Build the frontend (outputs to /app/frontend/dist)
RUN npm run frontend:build

# Stage 2: Serve the application with Node.js
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Update npm to fix vulnerabilities in base image
RUN npm install -g npm@latest
# Update system packages to fix OS-level vulnerabilities
RUN apk update && apk upgrade

# Copy root package.json for workspace awareness
COPY package*.json ./
COPY backend/package*.json ./backend/

# Disable husky in production
RUN npm pkg delete scripts.prepare
# Install production dependencies for the backend workspace
RUN npm install --omit=dev -w backend

# Copy backend source
COPY backend/server.ts ./backend/
COPY backend/src ./backend/src
COPY backend/scripts ./backend/scripts

# Copy built frontend assets from builder stage
# Ensure this matches your Vite build output directory
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 3001

# The backend server should be configured to serve frontend/dist
# We use tsx to run the backend in our specific configuration
CMD ["npx", "tsx", "backend/src/server.ts"]
