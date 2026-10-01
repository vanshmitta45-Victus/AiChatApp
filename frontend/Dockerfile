# ==============================================================================
# Multi-Stage Dockerfile for React Vite Spatial Frontend
# ==============================================================================

# Stage 1: Build the React Application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package*.json ./
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# Stage 2: Serve Bundle with Nginx Alpine
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx website
RUN rm -rf ./*

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./

# Copy custom reverse proxy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
