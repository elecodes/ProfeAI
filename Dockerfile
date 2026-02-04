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

# Declare ARGs for build-time environment variables (VITE_*)
# Render will pass these from the Dashboard automatically
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_ENABLE_SENTRY
ARG VITE_SENTRY_DSN

# Build the frontend
# We create a .env file specifically for the build to ensure Vite sees the variables
RUN echo "VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY" > frontend/.env && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN" >> frontend/.env && \
    echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID" >> frontend/.env && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET" >> frontend/.env && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID" >> frontend/.env && \
    echo "VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID" >> frontend/.env && \
    echo "VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID" >> frontend/.env && \
    echo "VITE_ENABLE_SENTRY=$VITE_ENABLE_SENTRY" >> frontend/.env && \
    echo "VITE_SENTRY_DSN=$VITE_SENTRY_DSN" >> frontend/.env && \
    npm run frontend:build

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
# We use --ignore-scripts to prevent husky from trying to run in production
RUN npm install --omit=dev -w frontend --ignore-scripts

# Copy backend source
COPY backend/src ./backend/src
COPY backend/scripts ./backend/scripts

# Copy built frontend assets from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 3001

# Start the server using tsx (which is a dependency in frontend/package.json)
CMD ["npx", "tsx", "backend/src/server.ts"]
