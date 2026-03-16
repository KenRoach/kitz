-- RLS policies for support_* and notif_* tables

ALTER TABLE support_ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE notif_alert ENABLE ROW LEVEL SECURITY;
ALTER TABLE notif_email_log ENABLE ROW LEVEL SECURITY;

-- support_ticket: operators see all, VARs see own org, partners see own org OR partner_id match
CREATE POLICY "support_ticket_select" ON support_ticket FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR partner_id = auth.org_id()
);

CREATE POLICY "support_ticket_insert" ON support_ticket FOR INSERT
  WITH CHECK (
    org_id = auth.org_id()
  );

CREATE POLICY "support_ticket_update" ON support_ticket FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
  OR partner_id = auth.org_id()
);

-- notif_alert: operators see all, others see own org
CREATE POLICY "notif_alert_select" ON notif_alert FOR SELECT USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

CREATE POLICY "notif_alert_insert" ON notif_alert FOR INSERT
  WITH CHECK (auth.org_type() = 'operator');

CREATE POLICY "notif_alert_update" ON notif_alert FOR UPDATE USING (
  auth.org_type() = 'operator'
  OR org_id = auth.org_id()
);

-- notif_email_log: operators only
CREATE POLICY "notif_email_log_select" ON notif_email_log FOR SELECT USING (
  auth.org_type() = 'operator'
);

CREATE POLICY "notif_email_log_insert" ON notif_email_log FOR INSERT
  WITH CHECK (auth.org_type() = 'operator');
