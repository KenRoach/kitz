-- KitZ(OS) Phase 1: Core business tables
-- All prefixed kz_ to avoid collision with existing RenewFlow tables.

CREATE TABLE IF NOT EXISTS kz_business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  business_type TEXT,                  -- panaderia, salon, tienda, electricista, etc.
  business_name TEXT,
  language TEXT DEFAULT 'es',
  onboarded BOOLEAN DEFAULT FALSE,
  onboard_step TEXT DEFAULT 'greeting', -- greeting, ask_type, ask_name, first_capture, done
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kz_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES kz_business_profiles(id),
  description TEXT,
  amount NUMERIC(12,2),
  customer_name TEXT,
  items JSONB DEFAULT '[]',
  status TEXT DEFAULT 'completed',      -- completed, pending, cancelled
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kz_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES kz_business_profiles(id),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  last_interaction TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kz_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES kz_business_profiles(id),
  item_name TEXT NOT NULL,
  quantity NUMERIC(12,2) DEFAULT 0,
  unit TEXT DEFAULT 'unidad',
  unit_cost NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kz_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES kz_business_profiles(id),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kz_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES kz_business_profiles(id),
  role TEXT NOT NULL,                   -- user, assistant, system
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kz_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES kz_business_profiles(id),
  order_id UUID REFERENCES kz_orders(id),
  items JSONB DEFAULT '[]',
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',          -- draft, sent, paid
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kz_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES kz_business_profiles(id),
  channel TEXT NOT NULL DEFAULT 'whatsapp', -- whatsapp, email, sms
  recipient TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',        -- pending, approved, sent, rejected
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_kz_orders_profile ON kz_orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_kz_orders_created ON kz_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_kz_customers_profile ON kz_customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_kz_inventory_profile ON kz_inventory(profile_id);
CREATE INDEX IF NOT EXISTS idx_kz_expenses_profile ON kz_expenses(profile_id);
CREATE INDEX IF NOT EXISTS idx_kz_conversations_profile ON kz_conversations(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_kz_drafts_profile ON kz_drafts(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_kz_business_profiles_phone ON kz_business_profiles(phone);
