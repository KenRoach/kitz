/**
 * API key authentication for service-to-service calls.
 * RenewFlow authenticates to KitZ OS using X-API-Key header.
 */

import type { FastifyRequest } from "fastify";

const VALID_API_KEYS = new Set(
  (process.env.KITZ_API_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean),
);

export function validateApiKey(request: FastifyRequest): boolean {
  const apiKey = request.headers["x-api-key"] as string | undefined;
  if (!apiKey) return false;
  return VALID_API_KEYS.has(apiKey);
}

export function requireApiKey(request: FastifyRequest): void {
  if (!validateApiKey(request)) {
    throw { statusCode: 401, message: "Invalid or missing API key" };
  }
}
