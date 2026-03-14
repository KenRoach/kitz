"use client";

import { Outlet } from 'react-router-dom';
import { PartnerSidebar } from './components/PartnerSidebar';
import './partner.css';

export function PartnerLayout() {
  return (
    <div className="partner-layout">
      <PartnerSidebar />
      <main className="partner-main"><Outlet /></main>
    </div>
  );
}
