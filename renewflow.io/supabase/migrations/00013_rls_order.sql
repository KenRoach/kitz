-- RLS policies for order_* tables

ALTER TABLE order_po ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_entitlement ENABLE ROW LEVEL SECURITY;

-- order_po: operators see all, VARs see own org, partners see partner_id match
CREATE POLICY "order_po_select" ON order_po FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR partner_id = auth.org_id()
);

CREATE POLICY "order_po_insert" ON order_po FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR org_id = auth.org_id()
  );

CREATE POLICY "order_po_update" ON order_po FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR partner_id = auth.org_id()
);

-- order_line_item: same dual-org pattern
CREATE POLICY "order_line_item_select" ON order_line_item FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR partner_id = auth.org_id()
);

CREATE POLICY "order_line_item_insert" ON order_line_item FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR org_id = auth.org_id()
  );

-- order_entitlement: same dual-org pattern
CREATE POLICY "order_entitlement_select" ON order_entitlement FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR partner_id = auth.org_id()
);

CREATE POLICY "order_entitlement_insert" ON order_entitlement FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR partner_id = auth.org_id()
  );

CREATE POLICY "order_entitlement_update" ON order_entitlement FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR partner_id = auth.org_id()
);
