"use client";

import { Routes, Route, Navigate } from 'react-router-dom';
import { PartnerLayout } from './PartnerLayout';
import { PartnerDashboard } from './pages/PartnerDashboard';
import { RfqInbox } from './pages/RfqInbox';
import { RfqDetail } from './pages/RfqDetail';
import { PriceLists } from './pages/PriceLists';
import { PriceListForm } from './pages/PriceListForm';
import { ActivePOs } from './pages/ActivePOs';
import { PODetail } from './pages/PODetail';
import { Entitlements } from './pages/Entitlements';
import { EntitlementForm } from './pages/EntitlementForm';

export function PartnerRouter({ orgType }: { orgType: string }) {
  if (orgType !== 'delivery_partner') return <Navigate to="/" replace />;
  return (
    <Routes>
      <Route element={<PartnerLayout />}>
        <Route index element={<PartnerDashboard />} />
        <Route path="rfqs" element={<RfqInbox />} />
        <Route path="rfqs/:quoteId" element={<RfqDetail />} />
        <Route path="price-lists" element={<PriceLists />} />
        <Route path="price-lists/new" element={<PriceListForm />} />
        <Route path="price-lists/:id/edit" element={<PriceListForm />} />
        <Route path="orders" element={<ActivePOs />} />
        <Route path="orders/:id" element={<PODetail />} />
        <Route path="entitlements" element={<Entitlements />} />
        <Route path="entitlements/:orderId" element={<EntitlementForm />} />
      </Route>
    </Routes>
  );
}
