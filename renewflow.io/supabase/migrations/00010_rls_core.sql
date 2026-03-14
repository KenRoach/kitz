-- RLS policies for core_* tables

ALTER TABLE core_organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_contact ENABLE ROW LEVEL SECURITY;

-- core_organization: operators see all, others see own org
CREATE POLICY "core_organization_select" ON core_organization FOR SELECT USING (
  auth.org_type() = 'operator'
  OR id = auth.org_id()
);

CREATE POLICY "core_organization_insert" ON core_organization FOR INSERT
  WITH CHECK (auth.org_type() = 'operator');

CREATE POLICY "core_organization_update" ON core_organization FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR id = auth.org_id()
);

-- core_user: operators see all, others see own org
CREATE POLICY "core_user_select" ON core_user FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

CREATE POLICY "core_user_insert" ON core_user FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR org_id = auth.org_id()
  );

CREATE POLICY "core_user_update" ON core_user FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

-- core_contact: operators see all, VARs see own org, partners no access
CREATE POLICY "core_contact_select" ON core_contact FOR SELECT USING (
  auth.org_type() = 'operator'
  OR (auth.org_type() = 'var' AND org_id = auth.org_id())
);

CREATE POLICY "core_contact_insert" ON core_contact FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR (auth.org_type() = 'var' AND org_id = auth.org_id())
  );

CREATE POLICY "core_contact_update" ON core_contact FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR (auth.org_type() = 'var' AND org_id = auth.org_id())
);

CREATE POLICY "core_contact_delete" ON core_contact FOR DELETE USING (
  auth.org_type() = 'operator'
  OR (auth.org_type() = 'var' AND org_id = auth.org_id())
);
