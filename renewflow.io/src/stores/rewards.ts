// ─── Rewards Store ───
// Centralized Zustand store for rewards points and history.
// Any page can call `addPoints()` to grant points for actions:
//  - Pipeline: advancing assets through stages
//  - Quoter: generating/sending quotes
//  - Orders: creating/fulfilling POs
//  - Import: importing asset data
//  - Inbox: sending emails

import { create } from "zustand";
import type { RewardEntry, RewardLevel, RewardsProfile } from "@/types";
import { REWARDS_DATA } from "@/data/seeds";

const REWARDS_STORAGE_KEY = "renewflow_rewards";

// ─── Level thresholds ───
const LEVELS: { level: RewardLevel; min: number }[] = [
  { level: "Platinum", min: 7500 },
  { level: "Gold", min: 3000 },
  { level: "Silver", min: 1000 },
  { level: "Bronze", min: 0 },
];

const NEXT_LEVEL_AT: Record<RewardLevel, number> = {
  Bronze: 1000,
  Silver: 3000,
  Gold: 7500,
  Platinum: 15000,
};

function getLevel(points: number): RewardLevel {
  for (const l of LEVELS) {
    if (points >= l.min) return l.level;
  }
  return "Bronze";
}

function getNextLevel(current: RewardLevel): RewardLevel {
  const idx = LEVELS.findIndex((l) => l.level === current);
  return idx > 0 ? (LEVELS[idx - 1]?.level ?? "Platinum") : "Platinum";
}

function persist(profile: RewardsProfile) {
  try {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(profile));
  } catch { /* quota */ }
}

function loadPersisted(): RewardsProfile | null {
  try {
    const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RewardsProfile;
  } catch {
    return null;
  }
}

interface RewardsStore {
  profile: RewardsProfile;
  /** Add points with a description. Called from any page. */
  addPoints: (action: string, pts: number) => void;
  /** Load from API / localStorage / seed on mount */
  hydrate: () => void;
}

export const useRewardsStore = create<RewardsStore>((set) => ({
  profile: loadPersisted() || REWARDS_DATA,

  addPoints: (action, pts) =>
    set((state) => {
      const newPoints = state.profile.points + pts;
      const level = getLevel(newPoints);
      const nextLevel = getNextLevel(level);
      const entry: RewardEntry = {
        action,
        pts,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      const profile: RewardsProfile = {
        points: newPoints,
        level,
        nextLevel,
        nextAt: NEXT_LEVEL_AT[level],
        history: [entry, ...state.profile.history].slice(0, 50), // keep last 50
      };
      persist(profile);
      return { profile };
    }),

  hydrate: () => {
    const cached = loadPersisted();
    if (cached) {
      set({ profile: cached });
    }
  },
}));
