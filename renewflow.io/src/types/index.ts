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

export interface ChatContext {
  user: { name: string; role: string; orgId: string };
  portfolio: { totalDevices: number; uniqueClients: number; totalOEM: number; totalTPM: number; savings: number };
  alerts: { expiring30: number; lapsed: number; critical: number };
  pipeline: Record<string, number>;
  orders: { total: number; pending: number; fulfilled: number; totalValue: number };
  topExpiring: Array<{ brand: string; model: string; client: string; daysLeft: number }>;
  currentPage: string;
  locale: string;
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

// ─── Auth Types ───

export type UserRole = "var" | "support" | "delivery-partner";

export const ROLE_LABELS: Record<UserRole, string> = {
  var: "VAR Partner",
  support: "Support Team",
  "delivery-partner": "Delivery Partner",
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role: UserRole;
}

export interface AuthTokenPayload {
  token: string;
  userId: string;
  orgId: string;
  name: string;
  role: UserRole;
  expiresIn: number;
}

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
  | "pipeline"
  | "settings"
  | "how-it-works";

// ─── Inbox Email Types ───

export type EmailDirection = "inbound" | "outbound";
export type EmailCategory = "quote" | "renewal" | "promo" | "general" | "reply";

export interface InboxEmail {
  id: string;
  direction: EmailDirection;
  category: EmailCategory;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  read: boolean;
  starred: boolean;
  timestamp: string;
  threadId?: string;
  replyTo?: string;
}
