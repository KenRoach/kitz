# Multi-stage build: Stage 1 builds frontend, Stage 2 builds + runs Kitz Gateway (TypeScript)

# Stage 1: Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/renewflo
COPY renewflo/package.json renewflo/package-lock.json ./
RUN npm ci
COPY renewflo/ ./
RUN npm run build

# Stage 2: Build + run Kitz Gateway (TypeScript/Fastify)
FROM node:20-alpine
WORKDIR /app

# Copy gateway source and install
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json* ./
RUN npm ci --omit=dev
COPY kitz_gateway_ts/ ./
RUN npx tsc

# Copy built frontend
COPY --from=frontend /app/renewflo/dist ./static/

# Environment variables (override via Railway/Fly/etc.)
ENV PORT=8787
ENV HOST=0.0.0.0
ENV AUTH_ENABLED=true
ENV STATIC_DIR=/app/static

EXPOSE 8787

CMD ["node", "dist/index.js"]
