# KitZ OS Gateway — AI orchestration engine (Fastify/TypeScript)
FROM node:20-alpine
WORKDIR /app

# Copy gateway source and install
COPY kitz_gateway_ts/package.json kitz_gateway_ts/package-lock.json* ./
RUN npm ci --omit=dev
COPY kitz_gateway_ts/ ./
RUN npx tsc

ENV PORT=8787
ENV HOST=0.0.0.0
ENV AUTH_ENABLED=true

EXPOSE 8787

CMD ["node", "dist/index.js"]
