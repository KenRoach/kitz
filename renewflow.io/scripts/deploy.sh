#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# RenewFlow.io — Full Cloud Deployment Script
# Deploys to Railway + Supabase + Resend + KitZ OS API
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[deploy]${NC} $*"; }
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# ─── Step 0: Check prerequisites ────────────────────────────
log "Checking prerequisites..."

command -v node  >/dev/null 2>&1 || err "Node.js is required"
command -v npm   >/dev/null 2>&1 || err "npm is required"

# Install Railway CLI v3 if needed
if ! command -v railway >/dev/null 2>&1; then
  log "Installing Railway CLI..."
  npm install -g @railway/cli
fi

# Install Supabase CLI if needed
if ! command -v supabase >/dev/null 2>&1; then
  log "Installing Supabase CLI..."
  npm install -g supabase
fi

ok "Prerequisites ready"

# ─── Step 1: Authenticate CLIs ──────────────────────────────
log "Checking Railway authentication..."
if ! railway whoami >/dev/null 2>&1; then
  warn "Not logged into Railway. Opening login..."
  railway login
fi
ok "Railway authenticated as: $(railway whoami 2>&1)"

log "Checking Supabase authentication..."
if ! supabase projects list >/dev/null 2>&1; then
  warn "Not logged into Supabase. Please log in..."
  supabase login
fi
ok "Supabase authenticated"

# ─── Step 2: Supabase — Link & Migrate ──────────────────────
log "Listing Supabase projects..."
supabase projects list

echo ""
read -rp "Enter your Supabase project ref (e.g. abcdefghijkl): " SUPABASE_REF

if [ -z "$SUPABASE_REF" ]; then
  err "Supabase project ref is required"
fi

log "Linking Supabase project $SUPABASE_REF..."
supabase link --project-ref "$SUPABASE_REF"

log "Pushing 16 database migrations..."
supabase db push
ok "Supabase migrations applied"

# Get API keys
log "Retrieving Supabase API keys..."
SUPABASE_KEYS=$(supabase projects api-keys --project-ref "$SUPABASE_REF" 2>&1)
echo "$SUPABASE_KEYS"

# Extract keys (format varies by CLI version)
SUPABASE_URL="https://${SUPABASE_REF}.supabase.co"
echo ""
ok "Supabase URL: $SUPABASE_URL"
echo ""
read -rp "Paste your Supabase ANON key: " SUPABASE_ANON_KEY
read -rp "Paste your Supabase SERVICE ROLE key: " SUPABASE_SERVICE_KEY

# ─── Step 3: Collect remaining secrets ───────────────────────
echo ""
log "Collecting environment variables..."

read -rp "Resend API key (re_...): " RESEND_API_KEY
read -rp "KitZ OS API URL [https://kitz-os.railway.app]: " KITZ_OS_API_URL
KITZ_OS_API_URL="${KITZ_OS_API_URL:-https://kitz-os.railway.app}"
read -rp "KitZ API key (kitz_...): " KITZ_API_KEY

# ─── Step 4: Railway — Link & Configure ─────────────────────
log "Listing Railway projects..."
railway list 2>/dev/null || true

echo ""
log "Linking to Railway project..."
echo "(Select your existing RenewFlow project from the list)"
railway link

log "Setting environment variables in Railway..."

railway variables set \
  NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
  RESEND_API_KEY="$RESEND_API_KEY" \
  EMAIL_FROM="RenewFlow <noreply@renewflow.io>" \
  KITZ_OS_API_URL="$KITZ_OS_API_URL" \
  KITZ_API_KEY="$KITZ_API_KEY" \
  NEXT_PUBLIC_APP_URL="https://www.renewflow.io" \
  NEXT_PUBLIC_FEATURE_AI_CHAT="true" \
  NEXT_PUBLIC_FEATURE_REWARDS="true" \
  NEXT_PUBLIC_FEATURE_PO_MANAGEMENT="true" \
  PORT="3000"

ok "All environment variables set"

# ─── Step 5: Deploy ──────────────────────────────────────────
log "Deploying to Railway..."
railway up --detach

ok "Deployment started! Railway is building your Docker image."
echo ""
log "Opening Railway dashboard to monitor build..."
railway open || true

# ─── Step 6: Domain setup reminder ───────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DEPLOYMENT STARTED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Next steps (in Railway dashboard):"
echo ""
echo "  1. Go to Service → Settings → Networking → Custom Domain"
echo "     Add: www.renewflow.io"
echo "     Add: renewflow.io (optional — bare domain)"
echo ""
echo "  2. Update DNS at your domain registrar:"
echo "     CNAME  www  →  <hash>.up.railway.app"
echo "     (Railway will show you the exact CNAME target)"
echo ""
echo "  3. Wait 5-30 min for SSL provisioning"
echo ""
echo "  4. Verify: curl https://www.renewflow.io/api/health"
echo ""
echo "  5. Verify Resend domain (https://resend.com/domains):"
echo "     - Add renewflow.io"
echo "     - Set SPF, DKIM, DMARC DNS records"
echo ""
echo "═══════════════════════════════════════════════════════════"
