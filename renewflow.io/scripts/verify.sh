#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# RenewFlow.io — Post-Deployment Verification
# Run after deploy.sh to verify all cloud services are connected
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

BASE_URL="${1:-https://www.renewflow.io}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
  local name="$1"
  local url="$2"
  local expect="${3:-200}"

  printf "  %-40s " "$name"

  HTTP_CODE=$(curl -s -o /tmp/renewflow_check.json -w "%{http_code}" "$url" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "$expect" ]; then
    echo -e "${GREEN}✓ $HTTP_CODE${NC}"
    PASS=$((PASS + 1))
  elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}✗ Connection failed${NC}"
    FAIL=$((FAIL + 1))
  else
    echo -e "${RED}✗ $HTTP_CODE (expected $expect)${NC}"
    FAIL=$((FAIL + 1))
  fi
}

check_contains() {
  local name="$1"
  local url="$2"
  local search="$3"

  printf "  %-40s " "$name"

  BODY=$(curl -s "$url" 2>/dev/null || echo "")

  if echo "$BODY" | grep -q "$search"; then
    echo -e "${GREEN}✓ Contains '$search'${NC}"
    PASS=$((PASS + 1))
  elif [ -z "$BODY" ]; then
    echo -e "${RED}✗ No response${NC}"
    FAIL=$((FAIL + 1))
  else
    echo -e "${RED}✗ Missing '$search'${NC}"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  RenewFlow.io — Cloud Service Verification"
echo "  Target: $BASE_URL"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ─── 1. Core App ─────────────────────────────────────────────
echo -e "${BLUE}[1] Core Application${NC}"
check "Health endpoint"               "$BASE_URL/api/health"
check_contains "Health response body"  "$BASE_URL/api/health" '"status":"ok"'
check "Homepage loads"                 "$BASE_URL"
echo ""

# ─── 2. Auth endpoints ──────────────────────────────────────
echo -e "${BLUE}[2] Authentication (Supabase)${NC}"
check "Login page"                     "$BASE_URL/login"
check "Register page"                  "$BASE_URL/register"
check "Auth API - login"               "$BASE_URL/api/auth/login" "405"  # GET returns 405, POST expected
check "Auth API - signup"              "$BASE_URL/api/auth/signup" "405"
echo ""

# ─── 3. Dashboard routes ─────────────────────────────────────
echo -e "${BLUE}[3] Dashboard Routes${NC}"
check "Dashboard"                      "$BASE_URL/dashboard"
check "Assets page"                    "$BASE_URL/assets"
check "Orders page"                    "$BASE_URL/orders"
check "Quoter page"                    "$BASE_URL/quoter"
check "Inbox page"                     "$BASE_URL/inbox"
check "Support page"                   "$BASE_URL/support"
check "Insights page"                  "$BASE_URL/insights"
check "Rewards page"                   "$BASE_URL/rewards"
check "Settings page"                  "$BASE_URL/settings"
echo ""

# ─── 4. API endpoints ────────────────────────────────────────
echo -e "${BLUE}[4] API Endpoints${NC}"
check "Assets API"                     "$BASE_URL/api/assets"
check "Orders API"                     "$BASE_URL/api/orders"
check "Tickets API"                    "$BASE_URL/api/tickets"
check "Insights API"                   "$BASE_URL/api/insights"
check "Rewards API"                    "$BASE_URL/api/rewards"
echo ""

# ─── 5. SSL Certificate ──────────────────────────────────────
echo -e "${BLUE}[5] SSL Certificate${NC}"
printf "  %-40s " "SSL valid"
SSL_EXPIRY=$(echo | openssl s_client -servername "${BASE_URL#https://}" -connect "${BASE_URL#https://}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null || echo "")
if [ -n "$SSL_EXPIRY" ]; then
  echo -e "${GREEN}✓ $SSL_EXPIRY${NC}"
  PASS=$((PASS + 1))
else
  echo -e "${YELLOW}? Could not check SSL${NC}"
  WARN=$((WARN + 1))
fi
echo ""

# ─── 6. DNS Check ────────────────────────────────────────────
echo -e "${BLUE}[6] DNS Resolution${NC}"
printf "  %-40s " "www.renewflow.io resolves"
DNS_RESULT=$(dig +short www.renewflow.io 2>/dev/null || nslookup www.renewflow.io 2>/dev/null | grep -i address | tail -1 || echo "")
if [ -n "$DNS_RESULT" ]; then
  echo -e "${GREEN}✓ $DNS_RESULT${NC}"
  PASS=$((PASS + 1))
else
  echo -e "${RED}✗ DNS not resolving${NC}"
  FAIL=$((FAIL + 1))
fi
echo ""

# ─── Summary ─────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════"
echo -e "  Results: ${GREEN}$PASS passed${NC} | ${RED}$FAIL failed${NC} | ${YELLOW}$WARN warnings${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}All checks passed! RenewFlow.io is live and connected.${NC}"
  exit 0
else
  echo -e "${YELLOW}Some checks failed. Review the output above.${NC}"
  exit 1
fi
