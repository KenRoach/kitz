# Stage 1: Compile gateway TypeScript
FROM node:20-alpine AS build
WORKDIR /app
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json ./
RUN npm ci
COPY kitz_gateway_ts/src ./src
COPY kitz_gateway_ts/tsconfig.json ./
RUN npx tsc

# Stage 2: Production runtime
FROM node:20-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json ./
RUN npm ci --omit=dev && chown -R app:app /app
COPY --from=build --chown=app:app /app/dist ./dist/

# SQL migrations (loaded at runtime by dist/db/migrate.js)
COPY --chown=app:app kitz_gateway_ts/src/db/schema.sql ./src/db/schema.sql
COPY --chown=app:app kitz_gateway_ts/src/db/seed.sql ./src/db/seed.sql
COPY --chown=app:app kitz_gateway_ts/src/db/migrations ./src/db/migrations

# Pre-built frontend SPA (build externally or skip if deploying separately)
COPY --chown=app:app static_dist ./static/

ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0
ENV AUTH_ENABLED=true
ENV STATIC_DIR=/app/static

USER app
EXPOSE 8787
CMD ["node", "dist/index.js"]
