-- RLS policies for audit_* tables

ALTER TABLE audit_status_change ENABLE ROW LEVEL SECURITY;

-- audit_status_change: operators only
CREATE POLICY "audit_status_change_select" ON audit_status_change FOR SELECT USING (
  auth.org_type() = 'operator'
);

CREATE POLICY "audit_status_change_insert" ON audit_status_change FOR INSERT
  WITH CHECK (true); -- Service role inserts audits
