# Multi-stage build: Node for frontend, Python for gateway
# Stage 1: Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/renewflo
COPY renewflo/package.json renewflo/package-lock.json ./
RUN npm ci
COPY renewflo/ ./
RUN npm run build

# Stage 2: Python gateway + static frontend
FROM python:3.12-slim
WORKDIR /app

# Copy gateway source
COPY kitz_gateway/ ./kitz_gateway/
COPY pyproject.toml ./

# Copy built frontend
COPY --from=frontend /app/renewflo/dist ./static/

# Environment variables (override via Railway/Fly/etc.)
ENV PORT=8787
ENV HOST=0.0.0.0
ENV AUTH_ENABLED=false
ENV STATIC_DIR=/app/static

EXPOSE 8787

CMD ["python", "-m", "kitz_gateway.cli"]
