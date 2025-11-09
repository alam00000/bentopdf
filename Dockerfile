# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build without type checking (vite build only)
# Pass SIMPLE_MODE environment variable if provided
ARG SIMPLE_MODE=false
ENV SIMPLE_MODE=$SIMPLE_MODE
RUN npm run build -- --mode production

# Production stage
FROM nginxinc/nginx-unprivileged:stable-alpine-slim

LABEL org.opencontainers.image.source="https://github.com/alam00000/bentopdf"

COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /etc/nginx/tmp && chown -R nginx:nginx /etc/nginx/tmp

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]


# Old Dockerfile for Root User
# # Build stage
# FROM node:20-alpine AS builder

# WORKDIR /app

# COPY package*.json ./
# RUN npm ci

# COPY . .

# # Build without type checking (vite build only)
# # Pass SIMPLE_MODE environment variable if provided
# ARG SIMPLE_MODE=false
# ENV SIMPLE_MODE=$SIMPLE_MODE
# RUN npm run build -- --mode production

# # Production stage
# FROM nginx:alpine

# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf

# EXPOSE 8080

# CMD ["nginx", "-g", "daemon off;"]
