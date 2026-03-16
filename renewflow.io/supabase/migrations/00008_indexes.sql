-- Performance indexes

-- Asset indexes
CREATE INDEX idx_asset_item_org_warranty ON asset_item (org_id, warranty_end);
CREATE INDEX idx_asset_item_org_status ON asset_item (org_id, status);

-- Quote indexes
CREATE INDEX idx_quote_request_org_status ON quote_request (org_id, status);
CREATE INDEX idx_quote_line_item_quote_version ON quote_line_item (quote_id, version);
CREATE INDEX idx_quote_price_list_lookup ON quote_price_list (partner_id, brand, coverage_type);
CREATE INDEX idx_quote_rfq_partner_status ON quote_rfq (partner_id, status);

-- Order indexes
CREATE INDEX idx_order_po_org_status ON order_po (org_id, status);
CREATE INDEX idx_order_po_partner_status ON order_po (partner_id, status);

-- Support indexes
CREATE INDEX idx_support_ticket_org_status ON support_ticket (org_id, status);

-- Notification indexes
CREATE INDEX idx_notif_alert_org_read ON notif_alert (org_id, read, created_at);

-- Audit indexes
CREATE INDEX idx_audit_status_change_lookup ON audit_status_change (table_name, record_id);
