#!/usr/bin/env node

/**
 * Happy-path API smoke test.
 *
 * Env vars (required):
 *   GATEWAY_URL           — e.g. https://gateway.renewflow.io
 *   HAPPY_PATH_EMAIL      — test account email
 *   HAPPY_PATH_PASSWORD   — test account password
 *
 * Env vars (optional):
 *   FACTORY_URL           — factory-api URL (defaults to GATEWAY_URL)
 *   HAPPY_PATH_VENTURE_ID — venture ID to test agents/contacts
 */

const GATEWAY = process.env.GATEWAY_URL;
const EMAIL = process.env.HAPPY_PATH_EMAIL;
const PASSWORD = process.env.HAPPY_PATH_PASSWORD;
const FACTORY = process.env.FACTORY_URL || GATEWAY;
const VENTURE_ID = process.env.HAPPY_PATH_VENTURE_ID;

if (!GATEWAY || !EMAIL || !PASSWORD) {
  console.error("Missing required env vars: GATEWAY_URL, HAPPY_PATH_EMAIL, HAPPY_PATH_PASSWORD");
  process.exit(1);
}

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`  \u2713 ${name}`);
    passed++;
  } catch (err) {
    console.error(`  \u2717 ${name}: ${err.message}`);
    failed++;
  }
}

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

console.log(`\nHappy-path smoke test against ${GATEWAY}\n`);

// 1. Gateway health
await check("Gateway /health", async () => {
  const data = await get(`${GATEWAY}/health`);
  if (data.status !== "ok") throw new Error(`status=${data.status}`);
});

// 2. Login
let token;
await check("Login", async () => {
  const data = await post(`${GATEWAY}/v0.1/auth/login`, { email: EMAIL, password: PASSWORD });
  if (!data.token && !data.access_token) throw new Error("No token in response");
  token = data.token || data.access_token;
});

// 3. List tools
await check("List tools", async () => {
  const data = await get(`${GATEWAY}/v0.1/tools`);
  if (!Array.isArray(data.tools) || data.tools.length === 0) throw new Error("No tools returned");
});

// 4. Factory agents (optional)
if (VENTURE_ID && FACTORY) {
  await check(`Factory agents (venture=${VENTURE_ID})`, async () => {
    const data = await get(`${FACTORY}/ventures/${VENTURE_ID}/agents`);
    if (!Array.isArray(data)) throw new Error("Expected array of agents");
  });

  await check(`Factory contacts (venture=${VENTURE_ID})`, async () => {
    const data = await get(`${FACTORY}/ventures/${VENTURE_ID}/contacts`);
    if (!Array.isArray(data)) throw new Error("Expected array of contacts");
  });
}

// Summary
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
