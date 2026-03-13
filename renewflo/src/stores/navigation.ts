import { create } from "zustand";
import type { PageId } from "@/types";

interface NavigationStore {
  page: PageId;
  chatOpen: boolean;
  setPage: (page: PageId) => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  page: "dashboard",
  chatOpen: false,
  setPage: (page) => set({ page }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setChatOpen: (open) => set({ chatOpen: open }),
}));
