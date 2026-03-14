-- Seed data for development and testing

-- Organizations
INSERT INTO core_organization (id, name, type, country, industry) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'RenewFlow Operations', 'operator', 'US', 'Technology'),
  ('a0000000-0000-0000-0000-000000000002', 'TechDistribuidora LATAM', 'var', 'MX', 'IT Distribution'),
  ('a0000000-0000-0000-0000-000000000003', 'Soluciones IT Panamá', 'var', 'PA', 'IT Services'),
  ('a0000000-0000-0000-0000-000000000004', 'ServiceNet LATAM', 'delivery_partner', 'CO', 'Warranty Services'),
  ('a0000000-0000-0000-0000-000000000005', 'Dell Direct LATAM', 'delivery_partner', 'BR', 'OEM Services');

-- Users (IDs must match auth.users — these are for local dev only)
INSERT INTO core_user (id, org_id, email, full_name, role) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'operator@renewflo.test', 'Ana Operadora', 'admin'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'var1@renewflo.test', 'Carlos Revendedor', 'admin'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'var2@renewflo.test', 'Maria Soluciones', 'admin'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'partner1@renewflo.test', 'Juan ServiceNet', 'admin'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'partner2@renewflo.test', 'Pedro Dell', 'admin');

-- Contacts
INSERT INTO core_contact (org_id, name, email, phone, role, is_primary) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Carlos Revendedor', 'carlos@techdist.mx', '+52-555-0100', 'Director', true),
  ('a0000000-0000-0000-0000-000000000003', 'Maria Soluciones', 'maria@soluciones.pa', '+507-6700-0100', 'Gerente IT', true);

-- Assets for TechDistribuidora
INSERT INTO asset_item (org_id, brand, model, serial, device_type, tier, warranty_end, status) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Dell', 'PowerEdge R750', 'SN-DELL-001', 'Server', 'critical', CURRENT_DATE + INTERVAL '30 days', 'alerted-30'),
  ('a0000000-0000-0000-0000-000000000002', 'Dell', 'PowerEdge R650', 'SN-DELL-002', 'Server', 'critical', CURRENT_DATE + INTERVAL '14 days', 'alerted-14'),
  ('a0000000-0000-0000-0000-000000000002', 'HP', 'ProLiant DL380', 'SN-HP-001', 'Server', 'standard', CURRENT_DATE + INTERVAL '60 days', 'alerted-60'),
  ('a0000000-0000-0000-0000-000000000002', 'Lenovo', 'ThinkPad X1 Carbon', 'SN-LEN-001', 'Laptop', 'standard', CURRENT_DATE + INTERVAL '90 days', 'discovered'),
  ('a0000000-0000-0000-0000-000000000002', 'Dell', 'Latitude 5540', 'SN-DELL-003', 'Laptop', 'low-use', CURRENT_DATE - INTERVAL '10 days', 'lapsed');

-- Assets for Soluciones IT
INSERT INTO asset_item (org_id, brand, model, serial, device_type, tier, warranty_end, status) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'Dell', 'PowerEdge R750', 'SN-DELL-004', 'Server', 'critical', CURRENT_DATE + INTERVAL '7 days', 'alerted-7'),
  ('a0000000-0000-0000-0000-000000000003', 'Cisco', 'Catalyst 9300', 'SN-CISCO-001', 'Switch', 'critical', CURRENT_DATE + INTERVAL '45 days', 'alerted-60'),
  ('a0000000-0000-0000-0000-000000000003', 'HP', 'EliteBook 850', 'SN-HP-002', 'Laptop', 'standard', CURRENT_DATE + INTERVAL '120 days', 'discovered');

-- Price lists for ServiceNet LATAM
INSERT INTO quote_price_list (partner_id, brand, model_pattern, coverage_type, duration_months, unit_price, valid_from, valid_until) VALUES
  ('a0000000-0000-0000-0000-000000000004', 'Dell', 'PowerEdge R7%', 'tpm', 12, 450.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days'),
  ('a0000000-0000-0000-0000-000000000004', 'Dell', 'PowerEdge R6%', 'tpm', 12, 380.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days'),
  ('a0000000-0000-0000-0000-000000000004', 'HP', 'ProLiant%', 'tpm', 12, 420.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days'),
  ('a0000000-0000-0000-0000-000000000004', 'Dell', 'PowerEdge R7%', 'tpm', 36, 1100.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days');

-- Price lists for Dell Direct LATAM
INSERT INTO quote_price_list (partner_id, brand, model_pattern, coverage_type, duration_months, unit_price, valid_from, valid_until) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'Dell', 'PowerEdge%', 'oem', 12, 600.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days'),
  ('a0000000-0000-0000-0000-000000000005', 'Dell', 'Latitude%', 'oem', 12, 180.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days');
