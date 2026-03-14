-- Notification domain: alerts and email logs

CREATE TABLE notif_alert (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES core_organization(id),
  user_id uuid REFERENCES core_user(id),
  asset_id uuid REFERENCES asset_item(id),
  quote_id uuid REFERENCES quote_request(id),
  po_id uuid REFERENCES order_po(id),
  type text NOT NULL
    CHECK (type IN (
      'warranty_expiry', 'quote_update', 'po_status',
      'entitlement', 'rfq_received', 'system'
    )),
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notif_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES notif_alert(id),
  to_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'failed')),
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
