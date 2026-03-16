# Multi-stage build: Stage 1 builds frontend, Stage 2 compiles gateway TS, Stage 3 runs

# Stage 1: Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/renewflo
COPY renewflo/package.json renewflo/package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY renewflo/ ./
RUN npm run build

# Stage 2: Compile gateway TypeScript
FROM node:20-alpine AS gateway-build
WORKDIR /app
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json* ./
RUN npm ci
COPY kitz_gateway_ts/ ./
RUN npx tsc

# Stage 3: Production runtime
FROM node:20-alpine
WORKDIR /app

# Install production deps only
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json* ./
RUN npm ci --omit=dev

# Copy compiled JS from build stage
COPY --from=gateway-build /app/dist ./dist/

# Copy built frontend
COPY --from=frontend /app/renewflo/dist ./static/

# Environment variables (override via Railway/Fly/etc.)
ENV PORT=8787
ENV HOST=0.0.0.0
ENV AUTH_ENABLED=true
ENV STATIC_DIR=/app/static

EXPOSE 8787

CMD ["node", "dist/index.js"]
