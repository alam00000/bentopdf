# Global variable declaration:
# Build to serve under Subdirectory BASE_URL if provided, eg: "ARG BASE_URL=/pdf/", otherwise leave blank: "ARG BASE_URL="
ARG BASE_URL=

# Build stage
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY vendor ./vendor
ENV HUSKY=0
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm config set fetch-timeout 600000 && \
    npm ci
COPY . .

# Build without type checking (vite build only)
# Pass SIMPLE_MODE environment variable if provided
ARG SIMPLE_MODE=false
ENV SIMPLE_MODE=$SIMPLE_MODE
ARG COMPRESSION_MODE=all
ENV COMPRESSION_MODE=$COMPRESSION_MODE

# global arg to local arg - BASE_URL is read from env by vite.config.ts
ARG BASE_URL
ENV BASE_URL=$BASE_URL

# WASM module URLs (pre-configured defaults)
# Override these for air-gapped or self-hosted WASM deployments
ARG VITE_WASM_PYMUPDF_URL
ARG VITE_WASM_GS_URL
ARG VITE_WASM_CPDF_URL
ENV VITE_WASM_PYMUPDF_URL=$VITE_WASM_PYMUPDF_URL
ENV VITE_WASM_GS_URL=$VITE_WASM_GS_URL
ENV VITE_WASM_CPDF_URL=$VITE_WASM_CPDF_URL

# OCR asset URLs (optional, used for self-hosted or air-gapped OCR)
ARG VITE_TESSERACT_WORKER_URL
ARG VITE_TESSERACT_CORE_URL
ARG VITE_TESSERACT_LANG_URL
ARG VITE_TESSERACT_AVAILABLE_LANGUAGES
ARG VITE_OCR_FONT_BASE_URL
ENV VITE_TESSERACT_WORKER_URL=$VITE_TESSERACT_WORKER_URL
ENV VITE_TESSERACT_CORE_URL=$VITE_TESSERACT_CORE_URL
ENV VITE_TESSERACT_LANG_URL=$VITE_TESSERACT_LANG_URL
ENV VITE_TESSERACT_AVAILABLE_LANGUAGES=$VITE_TESSERACT_AVAILABLE_LANGUAGES
ENV VITE_OCR_FONT_BASE_URL=$VITE_OCR_FONT_BASE_URL

# Default UI language (e.g. en, fr, de, es, zh, ar)
ARG VITE_DEFAULT_LANGUAGE
ENV VITE_DEFAULT_LANGUAGE=$VITE_DEFAULT_LANGUAGE

# Custom branding (e.g. VITE_BRAND_NAME=MyCompany VITE_BRAND_LOGO=my-logo.svg)
ARG VITE_BRAND_NAME
ARG VITE_BRAND_LOGO
ARG VITE_FOOTER_TEXT
ENV VITE_BRAND_NAME=$VITE_BRAND_NAME
ENV VITE_BRAND_LOGO=$VITE_BRAND_LOGO
ENV VITE_FOOTER_TEXT=$VITE_FOOTER_TEXT

ARG DISABLE_TOOLS
ENV DISABLE_TOOLS=$DISABLE_TOOLS

ENV NODE_OPTIONS="--max-old-space-size=3072"

RUN --mount=type=secret,id=VITE_CORS_PROXY_URL \
    --mount=type=secret,id=VITE_CORS_PROXY_SECRET \
    VITE_CORS_PROXY_URL=$(cat /run/secrets/VITE_CORS_PROXY_URL 2>/dev/null || echo "") \
    VITE_CORS_PROXY_SECRET=$(cat /run/secrets/VITE_CORS_PROXY_SECRET 2>/dev/null || echo "") \
    npm run build:with-docs

# Production stage
# TODO@ALAM: Change to quay once fixed
FROM nginx:1.28.3-alpine-slim

LABEL org.opencontainers.image.source="https://github.com/alam00000/bentopdf"
LABEL org.opencontainers.image.url="https://github.com/alam00000/bentopdf"

# global arg to local arg
ARG BASE_URL

# Set this to "true" to disable Nginx listening on IPv6
ENV DISABLE_IPV6=false

RUN apk upgrade --no-cache

COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html${BASE_URL%/}
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --chmod=755 nginx-ipv6.sh /docker-entrypoint.d/99-disable-ipv6.sh
RUN mkdir -p /etc/nginx/tmp /var/cache/nginx && chown -R nginx:nginx /etc/nginx/tmp /var/cache/nginx

USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
