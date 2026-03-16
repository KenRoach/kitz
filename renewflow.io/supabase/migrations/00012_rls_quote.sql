-- RLS policies for quote_* tables

ALTER TABLE quote_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_price_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_rfq ENABLE ROW LEVEL SECURITY;

-- quote_request: operators see all, VARs see own, partners see quotes with RFQs for them
CREATE POLICY "quote_request_select" ON quote_request FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR id IN (SELECT quote_id FROM quote_rfq WHERE partner_id = auth.org_id())
);

CREATE POLICY "quote_request_insert" ON quote_request FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR org_id = auth.org_id()
  );

CREATE POLICY "quote_request_update" ON quote_request FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

-- quote_line_item: operators see all, VARs see own org, partners see own partner_id
CREATE POLICY "quote_line_item_select" ON quote_line_item FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR partner_id = auth.org_id()
);

CREATE POLICY "quote_line_item_insert" ON quote_line_item FOR INSERT
  WITH CHECK (
    auth.org_type() = 'operator'
    OR org_id = auth.org_id()
  );

CREATE POLICY "quote_line_item_update" ON quote_line_item FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR partner_id = auth.org_id()
);

-- quote_price_list: operators see all, partners CRUD own
CREATE POLICY "quote_price_list_select" ON quote_price_list FOR SELECT USING (
  auth.org_type() = 'operator'
  OR partner_id = auth.org_id()
);

CREATE POLICY "quote_price_list_insert" ON quote_price_list FOR INSERT
  WITH CHECK (partner_id = auth.org_id());

CREATE POLICY "quote_price_list_update" ON quote_price_list FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR partner_id = auth.org_id()
);

CREATE POLICY "quote_price_list_delete" ON quote_price_list FOR DELETE USING (
  partner_id = auth.org_id()
);

-- quote_rfq: operators see all, partners see own
CREATE POLICY "quote_rfq_select" ON quote_rfq FOR SELECT USING (
  auth.org_type() = 'operator'
  OR partner_id = auth.org_id()
);

CREATE POLICY "quote_rfq_insert" ON quote_rfq FOR INSERT
  WITH CHECK (auth.org_type() = 'operator');

CREATE POLICY "quote_rfq_update" ON quote_rfq FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR partner_id = auth.org_id()
);
