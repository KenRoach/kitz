-- Kitz Gateway PostgreSQL schema for RenewFlow
-- Run against your Supabase project SQL editor

-- Auth tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Asset management
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial TEXT NOT NULL,
  client TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('critical', 'standard', 'low-use', 'eol')),
  days_left INTEGER NOT NULL DEFAULT 0,
  oem NUMERIC(10,2),
  tpm NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'discovered',
  warranty_end TEXT,
  device_type TEXT,
  purchase_date TEXT,
  quantity INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_assets_client ON assets(client);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_tier ON assets(tier);

-- Purchase orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  quote_ref TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created TEXT NOT NULL,
  updated TEXT NOT NULL,
  vendor_po TEXT,
  delivery_partner TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Quotes (AI-generated)
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  assets JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  total_oem NUMERIC(12,2),
  total_tpm NUMERIC(12,2),
  savings NUMERIC(12,2),
  created TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'draft'
);

-- Support tickets
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  device TEXT,
  issue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  created TEXT NOT NULL,
  assignee TEXT
);

-- Inbox messages
CREATE TABLE IF NOT EXISTS inbox (
  id SERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  company TEXT,
  subject TEXT NOT NULL,
  preview TEXT,
  time TEXT NOT NULL,
  unread BOOLEAN NOT NULL DEFAULT true
);

-- Rewards
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY DEFAULT 1,
  points INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Bronze',
  next_level TEXT,
  next_at INTEGER,
  history JSONB NOT NULL DEFAULT '[]'
);

-- Delivery partners
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  capabilities JSONB NOT NULL DEFAULT '[]',
  regions JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN NOT NULL DEFAULT true
);

-- PO submissions to partners
CREATE TABLE IF NOT EXISTS po_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id),
  partner_id UUID NOT NULL REFERENCES delivery_partners(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'submitted',
  tracking TEXT
);

CREATE INDEX IF NOT EXISTS idx_po_submissions_order ON po_submissions(order_id);
CREATE INDEX IF NOT EXISTS idx_po_submissions_partner ON po_submissions(partner_id);
