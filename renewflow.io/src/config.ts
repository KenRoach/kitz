export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  features: {
    aiChat: process.env.NEXT_PUBLIC_FEATURE_AI_CHAT !== "false",
    rewards: process.env.NEXT_PUBLIC_FEATURE_REWARDS !== "false",
    poManagement: process.env.NEXT_PUBLIC_FEATURE_PO_MANAGEMENT !== "false",
  },
} as const;
