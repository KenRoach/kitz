-- Quote domain: requests, line items, price lists, RFQs

CREATE TABLE quote_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES core_organization(id),
  requested_by uuid NOT NULL REFERENCES core_user(id),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'pending', 'pricing', 'rfq_pending',
      'priced', 'accepted', 'requote', 'expired', 'rejected'
    )),
  version integer NOT NULL DEFAULT 1,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quote_line_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quote_request(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES core_organization(id),
  asset_id uuid NOT NULL REFERENCES asset_item(id),
  coverage_type text NOT NULL CHECK (coverage_type IN ('tpm', 'oem')),
  duration_months integer NOT NULL,
  unit_price numeric(12,2),
  quantity integer NOT NULL DEFAULT 1,
  partner_id uuid REFERENCES core_organization(id),
  source text NOT NULL CHECK (source IN ('price_list', 'rfq')),
  version integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quote_price_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES core_organization(id),
  brand text NOT NULL,
  model_pattern text NOT NULL,
  coverage_type text NOT NULL CHECK (coverage_type IN ('tpm', 'oem')),
  duration_months integer NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until >= valid_from)
);

CREATE TABLE quote_rfq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quote_request(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES core_organization(id),
  status text NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'responded', 'expired', 'declined')),
  sent_at timestamptz,
  responded_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
