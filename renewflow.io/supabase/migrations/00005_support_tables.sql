-- Support domain: tickets

CREATE TABLE support_ticket (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES core_organization(id),
  partner_id uuid REFERENCES core_organization(id),
  asset_id uuid REFERENCES asset_item(id),
  po_id uuid REFERENCES order_po(id),
  reported_by uuid NOT NULL REFERENCES core_user(id),
  assignee uuid REFERENCES core_user(id),
  subject text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'escalated', 'resolved')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
