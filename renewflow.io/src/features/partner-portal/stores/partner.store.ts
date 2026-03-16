import { create } from 'zustand';

interface PartnerState {
  activeTab: 'dashboard' | 'rfqs' | 'price-lists' | 'orders' | 'entitlements';
  setActiveTab: (tab: PartnerState['activeTab']) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const usePartnerStore = create<PartnerState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
