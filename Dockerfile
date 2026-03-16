# Stage 1: Build frontend SPA
FROM node:20-alpine AS frontend
WORKDIR /app
COPY renewflo/package.json renewflo/package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY renewflo/ ./
ARG VITE_API_URL=https://api-production-dcc6.up.railway.app/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npx tsc -b && npx vite build

# Stage 2: Compile gateway TypeScript
FROM node:20-alpine AS gateway
WORKDIR /app
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json ./
RUN npm ci
COPY kitz_gateway_ts/src ./src
COPY kitz_gateway_ts/tsconfig.json ./
RUN npx tsc

# Stage 3: Production runtime
FROM node:20-alpine
WORKDIR /app
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=gateway /app/dist ./dist/
COPY --from=frontend /app/dist ./static/

ENV PORT=8787
ENV HOST=0.0.0.0
ENV AUTH_ENABLED=true
ENV STATIC_DIR=/app/static

EXPOSE 8787
CMD ["node", "dist/index.js"]
