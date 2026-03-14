-- Seed data for RenewFlow dev/staging
-- Run after schema.sql

-- Sample assets (8 devices across 6 clients)
INSERT INTO assets (id, brand, model, serial, client, tier, days_left, oem, tpm, status, warranty_end, device_type, purchase_date, quantity)
VALUES
  ('A001', 'Dell', 'Precision 5570', 'SN-DL-001', 'Grupo Alfa', 'critical', 12, 489, 299, 'alerted-14', '2026-03-26', 'Workstation', '2023-03-26', 1),
  ('A002', 'HP', 'ProBook 450 G10', 'SN-HP-002', 'Rex Distribution', 'standard', 45, 329, 189, 'alerted-60', '2026-04-28', 'Laptop', '2023-04-28', 1),
  ('A003', 'Lenovo', 'ThinkPad T14s', 'SN-LN-003', 'Café Central', 'standard', 5, 299, 169, 'alerted-7', '2026-03-19', 'Laptop', '2023-03-19', 1),
  ('A004', 'Dell', 'OptiPlex 7090', 'SN-DL-004', 'Modern Arch', 'low-use', 90, 199, 99, 'alerted-90', '2026-06-12', 'Desktop', '2023-06-12', 1),
  ('A005', 'HP', 'ZBook Fury 16', 'SN-HP-005', 'Beta Investments', 'critical', 3, 599, 379, 'alerted-7', '2026-03-17', 'Workstation', '2023-03-17', 1),
  ('A006', 'Lenovo', 'ThinkStation P360', 'SN-LN-006', 'TechSoluciones', 'critical', 28, 449, 279, 'alerted-30', '2026-04-11', 'Workstation', '2023-04-11', 1),
  ('A007', 'Dell', 'Latitude 5530', 'SN-DL-007', 'Grupo Alfa', 'standard', -15, 279, 159, 'lapsed', '2026-02-27', 'Laptop', '2023-02-27', 1),
  ('A008', 'HP', 'ProDesk 400 G9', 'SN-HP-008', 'Rex Distribution', 'low-use', 120, 179, 89, 'discovered', '2026-07-12', 'Desktop', '2023-07-12', 1)
ON CONFLICT (id) DO NOTHING;

-- Sample orders
INSERT INTO orders (id, client, quote_ref, status, total, created, updated, vendor_po, delivery_partner, notes, items)
VALUES
  ('PO-4201', 'Grupo Alfa', 'Q-7801', 'approved', 299, '2025-01-10', '2025-01-12', 'GA-2025-019', NULL, NULL,
   '[{"assetId":"A001","brand":"Dell","model":"Precision 5570","serial":"SN-DL-001","coverageType":"tpm","price":299,"quantity":1}]'),
  ('PO-4202', 'Rex Distribution', 'Q-7802', 'pending-approval', 189, '2025-01-11', '2025-01-11', NULL, NULL, NULL,
   '[{"assetId":"A002","brand":"HP","model":"ProBook 450 G10","serial":"SN-HP-002","coverageType":"tpm","price":189,"quantity":1}]'),
  ('PO-4203', 'Café Central', 'Q-7803', 'draft', 169, '2025-01-12', '2025-01-12', NULL, NULL, 'Urgent — 5 days left',
   '[{"assetId":"A003","brand":"Lenovo","model":"ThinkPad T14s","serial":"SN-LN-003","coverageType":"tpm","price":169,"quantity":1}]'),
  ('PO-4204', 'Beta Investments', 'Q-7804', 'fulfilled', 599, '2024-12-01', '2025-01-08', 'BI-2024-112', 'WarrantyPro LATAM', 'OEM renewed',
   '[{"assetId":"A005","brand":"HP","model":"ZBook Fury 16","serial":"SN-HP-005","coverageType":"oem","price":599,"quantity":1}]')
ON CONFLICT (id) DO NOTHING;

-- Sample tickets
INSERT INTO tickets (id, client, device, issue, status, priority, created, assignee)
VALUES
  ('TK-001', 'Grupo Alfa', 'Dell Precision 5570', 'Warranty claim rejected by OEM', 'open', 'high', '2025-01-10', 'Maria S.'),
  ('TK-002', 'Café Central', 'Lenovo ThinkPad T14s', 'Device not booting — hardware failure', 'in-progress', 'critical', '2025-01-11', 'Carlos R.'),
  ('TK-003', 'Modern Arch', 'Dell OptiPlex 7090', 'Request for coverage upgrade', 'resolved', 'medium', '2025-01-05', 'Ana P.'),
  ('TK-004', 'TechSoluciones', 'Lenovo ThinkStation P360', 'Delayed renewal — budget hold', 'escalated', 'high', '2025-01-09', 'Luis M.')
ON CONFLICT (id) DO NOTHING;

-- Sample inbox
INSERT INTO inbox (sender, company, subject, preview, time, unread)
VALUES
  ('Ricardo Vega', 'Grupo Alfa', 'RE: Warranty renewal quote Q-7801', 'Approved. Please proceed with TPM coverage for the Precision 5570.', '2025-01-12 09:15', true),
  ('Patricia Molina', 'Rex Distribution', 'Quote request: 15 HP ProBooks', 'We need coverage for our new batch of ProBook 450 G10s...', '2025-01-11 16:40', true),
  ('Carlos Ruiz', 'Café Central', 'URGENT: ThinkPad warranty expiring', 'Our T14s warranty expires in 5 days. Can you expedite?', '2025-01-11 11:20', false),
  ('WarrantyPro LATAM', 'WarrantyPro', 'PO-4204 fulfilled', 'The OEM warranty for ZBook Fury 16 has been activated.', '2025-01-08 14:00', false),
  ('Ana Perez', 'Modern Arch', 'Coverage upgrade inquiry', 'We would like to explore upgrading from low-use to standard tier...', '2025-01-07 10:30', true)
ON CONFLICT DO NOTHING;

-- Rewards
INSERT INTO rewards (id, points, level, next_level, next_at, history)
VALUES (1, 4750, 'Gold', 'Platinum', 7500, '[
  {"action":"Renewed 3 devices","points":150,"date":"2025-01-10"},
  {"action":"Referred Rex Distribution","points":500,"date":"2025-01-05"},
  {"action":"First quote generated","points":100,"date":"2024-12-20"},
  {"action":"Account activated","points":50,"date":"2024-12-15"}
]')
ON CONFLICT (id) DO NOTHING;
