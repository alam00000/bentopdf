# Build stage
FROM node:20-alpine AS builder

# Accept version argument
ARG VERSION=latest

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build without type checking (vite build only)
RUN npm run build -- --mode production

# Production stage
FROM nginx:alpine

# Accept version argument
ARG VERSION=latest

# Add version information
RUN echo "BentoPDF Version: ${VERSION}" > /usr/share/nginx/html/version.txt
RUN echo "Build Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /usr/share/nginx/html/version.txt

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

LABEL org.opencontainers.image.title="BentoPDF"
LABEL org.opencontainers.image.description="A comprehensive PDF manipulation tool"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.source="https://github.com/bentopdf/bentopdf"
LABEL org.opencontainers.image.licenses="Apache-2.0"

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]