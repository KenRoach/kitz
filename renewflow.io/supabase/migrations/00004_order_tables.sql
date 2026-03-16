-- Order domain: purchase orders, line items, entitlements

CREATE TABLE order_po (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES core_organization(id),
  quote_id uuid NOT NULL REFERENCES quote_request(id),
  submitted_by uuid NOT NULL REFERENCES core_user(id),
  partner_id uuid NOT NULL REFERENCES core_organization(id),
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN (
      'submitted', 'under_review', 'approved', 'routed',
      'acknowledged', 'entitlement_verified', 'completed', 'cancelled'
    )),
  total numeric(12,2) NOT NULL,
  vendor_po_ref text,
  reviewed_by uuid REFERENCES core_user(id),
  reviewed_at timestamptz,
  routed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_line_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES order_po(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES core_organization(id),
  partner_id uuid NOT NULL REFERENCES core_organization(id),
  asset_id uuid NOT NULL REFERENCES asset_item(id),
  coverage_type text NOT NULL CHECK (coverage_type IN ('tpm', 'oem')),
  duration_months integer NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1
);

CREATE TABLE order_entitlement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES order_po(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES core_organization(id),
  partner_id uuid NOT NULL REFERENCES core_organization(id),
  asset_id uuid NOT NULL REFERENCES asset_item(id),
  entitlement_id text,
  coverage_start date NOT NULL,
  coverage_end date NOT NULL,
  verified_by uuid REFERENCES core_user(id),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (coverage_end >= coverage_start)
);
