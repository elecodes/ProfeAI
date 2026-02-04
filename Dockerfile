# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifest and frontend manifest (where all dependencies live)
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
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

# Copy manifestations
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install production dependencies from frontend workspace
# Note: Since there is no backend/package.json, we rely on frontend's dependencies
RUN npm install --omit=dev -w frontend

# Copy backend source
COPY backend/src ./backend/src
COPY backend/scripts ./backend/scripts

# Copy built frontend assets from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 3001

# Start the server using tsx (which is a dependency in frontend/package.json)
CMD ["npx", "tsx", "backend/src/server.ts"]
