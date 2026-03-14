import { useState } from 'react';
import { entitlementApi } from '../services/partner.api';

export interface EntitlementEntry { assetId: string; entitlementId: string; coverageStart: string; coverageEnd: string; }

export function useEntitlementSubmit(orderId: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submit = async (entitlements: EntitlementEntry[]) => {
    setSubmitting(true); setError(null);
    try { await entitlementApi.submit(orderId, entitlements); setSuccess(true); }
    catch (err) { setError((err as Error).message); } finally { setSubmitting(false); }
  };
  return { submit, submitting, error, success };
}
