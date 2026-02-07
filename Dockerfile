# Stage 1: Build Frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Backend & Serve
FROM node:20-alpine
WORKDIR /app

# Copy backend dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy backend code and env
COPY server/ ./
COPY server/.env ./.env

# Copy built frontend to backend's public directory
COPY --from=frontend-build /app/frontend/dist ./public

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]
