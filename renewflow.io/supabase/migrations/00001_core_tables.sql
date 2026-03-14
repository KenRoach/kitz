-- Core domain: organizations, users, contacts

CREATE TABLE core_organization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('var', 'operator', 'delivery_partner')),
  country text,
  industry text,
  billing_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE core_user (
  id uuid PRIMARY KEY, -- matches auth.users.id
  org_id uuid NOT NULL REFERENCES core_organization(id),
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE core_contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES core_organization(id),
  name text NOT NULL,
  email text,
  phone text,
  role text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
