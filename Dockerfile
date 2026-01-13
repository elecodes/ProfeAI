# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application with Node.js
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Update npm to fix vulnerabilities in base image
RUN npm install -g npm@latest

COPY package*.json ./
RUN npm install --omit=dev

# Copy backend code
# Copy backend code
COPY server.ts ./
COPY src ./src

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["npm", "start"]
