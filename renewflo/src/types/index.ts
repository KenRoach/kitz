// ─── Domain Types ───

export type AssetTier = "critical" | "standard" | "low-use" | "eol";

export type AssetStatus =
  | "discovered"
  | "alerted-7"
  | "alerted-14"
  | "alerted-30"
  | "alerted-60"
  | "alerted-90"
  | "quoted"
  | "tpm-approved"
  | "oem-approved"
  | "fulfilled"
  | "lost"
  | "lapsed";

export interface Asset {
  id: string;
  brand: string;
  model: string;
  serial: string;
  client: string;
  tier: AssetTier;
  daysLeft: number;
  oem: number | null;
  tpm: number;
  status: AssetStatus;
  warrantyEnd?: string;
  deviceType?: string;
  purchaseDate?: string;
  quantity?: number;
}

export interface InboxMessage {
  id: number;
  from: string;
  company: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

// ─── Purchase Order Types ───

export type POStatus = "draft" | "pending-approval" | "approved" | "submitted" | "acknowledged" | "fulfilled" | "cancelled";

export interface PurchaseOrder {
  id: string;
  client: string;
  quoteRef: string;
  items: POLineItem[];
  status: POStatus;
  total: number;
  created: string;
  updated: string;
  vendorPO?: string;
  deliveryPartner?: string;
  notes?: string;
}

export interface POLineItem {
  assetId: string;
  brand: string;
  model: string;
  serial: string;
  coverageType: "tpm" | "oem";
  price: number;
  quantity: number;
}

export type TicketStatus = "open" | "in-progress" | "escalated" | "resolved";
export type TicketPriority = "critical" | "high" | "medium" | "low";

export interface SupportTicket {
  id: string;
  client: string;
  device: string;
  issue: string;
  status: TicketStatus;
  priority: TicketPriority;
  created: string;
  assignee: string;
}

export interface RewardEntry {
  action: string;
  pts: number;
  date: string;
}

export type RewardLevel = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface RewardsProfile {
  points: number;
  level: RewardLevel;
  nextLevel: RewardLevel;
  nextAt: number;
  history: RewardEntry[];
}

export interface ChatMessage {
  role: "system" | "user" | "ai";
  text: string;
}

// ─── Import Types ───

export interface ImportFieldDef {
  key: string;
  label: string;
  required: boolean;
  hint: string;
}

export type ImportStep = "upload" | "mapping" | "preview" | "done";

export interface ImportedAsset extends Asset {
  warrantyEnd?: string;
  deviceType?: string;
  purchaseDate?: string;
  quantity: number;
}

export type ColumnMapping = Record<string, number>;

// ─── Navigation ───

export type PageId =
  | "dashboard"
  | "import"
  | "quoter"
  | "inbox"
  | "notifications"
  | "support"
  | "rewards"
  | "orders"
  | "insights";
