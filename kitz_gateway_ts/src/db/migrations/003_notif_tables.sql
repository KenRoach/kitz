-- Notification tables for RenewFlow warranty alerts

CREATE TABLE IF NOT EXISTS notif_alert (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  asset_id UUID NOT NULL REFERENCES asset_item(id) ON DELETE CASCADE,
  threshold_days INT NOT NULL,        -- 90, 60, 30, 14, 7, 0
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, sent, failed, dismissed
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  UNIQUE (asset_id, threshold_days)   -- one alert per asset per threshold
);

CREATE TABLE IF NOT EXISTS notif_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES notif_alert(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',  -- sent, failed
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_alert_org ON notif_alert(org_id);
CREATE INDEX IF NOT EXISTS idx_notif_alert_status ON notif_alert(status);
CREATE INDEX IF NOT EXISTS idx_notif_email_log_alert ON notif_email_log(alert_id);
