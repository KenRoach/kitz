#!/usr/bin/env bash
# production-verify.sh — Verify required docs and scripts exist before deploy.

set -uo pipefail

PASS=0
FAIL=0

check_file() {
  if [ -f "$1" ]; then
    printf "  OK   %s\n" "$1"
    ((PASS++))
  else
    printf "  MISS %s\n" "$1"
    ((FAIL++))
  fi
}

echo ""
echo "Production readiness — file checks"
echo "===================================="
echo ""

echo "Docs:"
check_file "docs/friday-database.md"
check_file "docs/friday-ops.md"
check_file "docs/production/02-database.md"
check_file "docs/happy-path-checklist.md"
check_file "docs/support-and-oncall.md"
check_file "docs/production/06-observability.md"

echo ""
echo "Scripts:"
check_file "scripts/happy-path-api.mjs"
check_file "scripts/seed-kitz-skills.mjs"

echo ""
echo "Deploy:"
check_file "docs/deploy/railway-supabase.md"
check_file ".env.railway.example"
check_file "railway.json"

echo ""
echo "Docker:"
check_file "docker/Dockerfile.service"
check_file "docker/Dockerfile.kitz-next"
check_file "docker/Dockerfile.renewflo"
check_file "renewflo/server/index.mjs"

echo ""
echo "CI:"
check_file ".github/workflows/ci.yml"

echo ""
echo "Config:"
check_file "Dockerfile"
check_file "prisma/schema.prisma"

echo ""
echo "===================================="
echo "${PASS} passed, ${FAIL} missing"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
