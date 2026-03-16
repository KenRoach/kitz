-- Asset domain: import batches and asset items

CREATE TABLE asset_import_batch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES core_organization(id),
  uploaded_by uuid NOT NULL REFERENCES core_user(id),
  file_name text,
  row_count integer,
  status text NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  error_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE asset_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES core_organization(id),
  import_batch_id uuid REFERENCES asset_import_batch(id),
  brand text NOT NULL,
  model text NOT NULL,
  serial text NOT NULL,
  device_type text,
  tier text NOT NULL CHECK (tier IN ('critical', 'standard', 'low-use', 'eol')),
  warranty_end date NOT NULL,
  purchase_date date,
  status text NOT NULL DEFAULT 'discovered'
    CHECK (status IN (
      'discovered',
      'alerted-90', 'alerted-60', 'alerted-30', 'alerted-14', 'alerted-7',
      'quoted', 'tpm-approved', 'oem-approved',
      'fulfilled', 'lost', 'lapsed'
    )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, serial)
);
