-- Audit domain: status change tracking

CREATE TABLE audit_status_change (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES core_user(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
