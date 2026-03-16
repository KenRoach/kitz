# Two-stage build: compile TypeScript, then run

FROM node:20-alpine AS build
WORKDIR /app
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json ./
RUN npm ci
COPY kitz_gateway_ts/src ./src
COPY kitz_gateway_ts/tsconfig.json ./
RUN npx tsc

FROM node:20-alpine
WORKDIR /app
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist/

ENV PORT=8787
ENV HOST=0.0.0.0
ENV AUTH_ENABLED=true

EXPOSE 8787
CMD ["node", "dist/index.js"]
