-- RLS policies for asset_* tables

ALTER TABLE asset_import_batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_item ENABLE ROW LEVEL SECURITY;

-- asset_import_batch: operators see all, VARs see own org
CREATE POLICY "asset_import_batch_select" ON asset_import_batch FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

CREATE POLICY "asset_import_batch_insert" ON asset_import_batch FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR org_id = auth.org_id()
  );

CREATE POLICY "asset_import_batch_update" ON asset_import_batch FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

-- asset_item: operators see all, VARs see own org, partners no access
CREATE POLICY "asset_item_select" ON asset_item FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

CREATE POLICY "asset_item_insert" ON asset_item FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR org_id = auth.org_id()
  );

CREATE POLICY "asset_item_update" ON asset_item FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

CREATE POLICY "asset_item_delete" ON asset_item FOR DELETE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);
