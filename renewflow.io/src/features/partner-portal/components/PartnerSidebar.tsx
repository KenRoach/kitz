"use client";

import { NavLink } from 'react-router-dom';
import { usePartnerStore } from '../stores/partner.store';

const NAV_ITEMS = [
  { path: '/partner', label: 'Dashboard', icon: 'grid' },
  { path: '/partner/rfqs', label: 'RFQ Inbox', icon: 'inbox' },
  { path: '/partner/price-lists', label: 'Price Lists', icon: 'list' },
  { path: '/partner/orders', label: 'Active POs', icon: 'package' },
  { path: '/partner/entitlements', label: 'Entitlements', icon: 'shield' },
] as const;

export function PartnerSidebar() {
  const { sidebarCollapsed, toggleSidebar } = usePartnerStore();
  return (
    <aside className={`partner-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{sidebarCollapsed ? 'RF' : 'RenewFlow Partner'}</h2>
        <button onClick={toggleSidebar} className="sidebar-toggle">{sidebarCollapsed ? '>' : '<'}</button>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/partner'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
