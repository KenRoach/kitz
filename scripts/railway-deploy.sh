#!/usr/bin/env bash
# railway-deploy.sh — Automate Railway deployment: set DATABASE_URL, verify health, seed skills.
#
# Usage:
#   ./scripts/railway-deploy.sh <SUPABASE_POSTGRES_PASSWORD>

set -euo pipefail

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info()    { printf "${CYAN}[INFO]${NC}  %s\n" "$*"; }
success() { printf "${GREEN}[OK]${NC}    %s\n" "$*"; }
warn()    { printf "${YELLOW}[WARN]${NC}  %s\n" "$*"; }
error()   { printf "${RED}[ERROR]${NC} %s\n" "$*" >&2; }
step()    { printf "\n${BOLD}▶ %s${NC}\n" "$*"; }

# ---------------------------------------------------------------------------
# Validate arguments
# ---------------------------------------------------------------------------
if [ $# -lt 1 ]; then
  error "Supabase Postgres password is required."
  echo "Usage: $0 <SUPABASE_POSTGRES_PASSWORD>"
  exit 1
fi

DB_PASSWORD="$1"
SUPABASE_REF="mjnywsngrtecsnkabkkh"
DATABASE_URL="postgresql://postgres.${SUPABASE_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------
BACKEND_SERVICES=(
  kitz-gateway
  factory-api
  agent-runtime
  contact-engine
  pipeline-runner
  channel-router
)

ALL_SERVICES=(
  "${BACKEND_SERVICES[@]}"
  kitz-web
  renewflow
)

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
step "Pre-flight checks"

# Railway CLI
if ! command -v railway &>/dev/null; then
  error "Railway CLI is not installed. Install it: https://docs.railway.app/develop/cli"
  exit 1
fi
success "Railway CLI found ($(railway --version 2>/dev/null || echo 'unknown version'))"

# Git — ensure we are on main with the latest merge
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "main" ]; then
  error "You must be on the 'main' branch to deploy. Current branch: ${CURRENT_BRANCH}"
  exit 1
fi
success "On branch: main"

LATEST_COMMIT="$(git log --oneline -1)"
info "Latest commit: ${LATEST_COMMIT}"

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  error "Working tree has uncommitted changes. Commit or stash them before deploying."
  exit 1
fi
success "Working tree is clean"

# ---------------------------------------------------------------------------
# Step 1 — Set DATABASE_URL on backend services
# ---------------------------------------------------------------------------
step "Setting DATABASE_URL on ${#BACKEND_SERVICES[@]} backend services"

for svc in "${BACKEND_SERVICES[@]}"; do
  info "Setting DATABASE_URL on ${svc}..."
  railway service "$svc"
  railway variables set DATABASE_URL="$DATABASE_URL"
  success "${svc} — DATABASE_URL set"
done

# ---------------------------------------------------------------------------
# Step 2 — Wait for deploys
# ---------------------------------------------------------------------------
step "Waiting for Railway deploys to propagate (60 seconds)"
for i in $(seq 60 -10 10); do
  printf "  ${YELLOW}%ss remaining...${NC}\n" "$i"
  sleep 10
done
success "Wait complete"

# ---------------------------------------------------------------------------
# Step 3 — Discover domains and verify health
# ---------------------------------------------------------------------------
step "Discovering service domains and verifying health endpoints"

declare -A SERVICE_URLS
HEALTH_PASS=0
HEALTH_FAIL=0

for svc in "${ALL_SERVICES[@]}"; do
  info "Resolving domain for ${svc}..."
  railway service "$svc"
  DOMAIN="$(railway domain 2>/dev/null | head -1 | tr -d '[:space:]')"

  if [ -z "$DOMAIN" ]; then
    error "${svc} — could not resolve domain"
    ((HEALTH_FAIL++))
    continue
  fi

  # Ensure URL has https:// prefix
  if [[ "$DOMAIN" != https://* ]]; then
    DOMAIN="https://${DOMAIN}"
  fi

  SERVICE_URLS["$svc"]="$DOMAIN"

  # Backend services use /health, frontends use /
  if [ "$svc" = "kitz-web" ] || [ "$svc" = "renewflow" ]; then
    HEALTH_PATH="/"
  else
    HEALTH_PATH="/health"
  fi

  HEALTH_URL="${DOMAIN}${HEALTH_PATH}"
  info "Checking ${HEALTH_URL}"

  HTTP_STATUS="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")"

  if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 400 ]; then
    success "${svc} — HTTP ${HTTP_STATUS}"
    ((HEALTH_PASS++))
  else
    error "${svc} — HTTP ${HTTP_STATUS}"
    ((HEALTH_FAIL++))
  fi
done

echo ""
info "Health check results: ${HEALTH_PASS} passed, ${HEALTH_FAIL} failed"

if [ "$HEALTH_FAIL" -gt 0 ]; then
  warn "Some services failed health checks. Review the output above."
fi

# ---------------------------------------------------------------------------
# Step 4 — Seed skills
# ---------------------------------------------------------------------------
step "Seeding skills via factory-api"

FACTORY_URL="${SERVICE_URLS[factory-api]:-}"
if [ -z "$FACTORY_URL" ]; then
  error "factory-api URL is not available. Cannot seed skills."
  exit 1
fi

info "FACTORY_URL=${FACTORY_URL}"
FACTORY_URL="$FACTORY_URL" pnpm seed:skills
success "Skills seeded"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
step "Deployment complete"

echo ""
printf "${BOLD}Service URLs:${NC}\n"
for svc in "${ALL_SERVICES[@]}"; do
  url="${SERVICE_URLS[$svc]:-unknown}"
  printf "  %-20s %s\n" "$svc" "$url"
done
echo ""

if [ "$HEALTH_FAIL" -gt 0 ]; then
  warn "${HEALTH_FAIL} service(s) failed health checks. Investigate before proceeding."
  exit 1
fi

success "All ${HEALTH_PASS} services healthy. Deployment finished."
