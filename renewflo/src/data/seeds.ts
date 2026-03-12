import type { Asset, InboxMessage, SupportTicket, RewardsProfile, PurchaseOrder } from "@/types";

export const INITIAL_ASSETS: Asset[] = [
  { id: "A-1001", brand: "Dell", model: "Latitude 5540", serial: "DLTG7X3", client: "Grupo Alfa", tier: "critical", daysLeft: 7, oem: 289, tpm: 149, status: "alerted-7" },
  { id: "A-1002", brand: "HP", model: "EliteBook 840 G10", serial: "HP2K9M1", client: "Rex Distribution", tier: "standard", daysLeft: 14, oem: 245, tpm: 119, status: "alerted-14" },
  { id: "A-1003", brand: "Lenovo", model: "ThinkPad T14 Gen 4", serial: "LNV8R2P", client: "Café Central", tier: "standard", daysLeft: 28, oem: 199, tpm: 99, status: "alerted-30" },
  { id: "A-1004", brand: "Dell", model: "OptiPlex 7010", serial: "DLQW5N8", client: "Grupo Alfa", tier: "low-use", daysLeft: 45, oem: 159, tpm: 79, status: "alerted-90" },
  { id: "A-1005", brand: "HP", model: "ProDesk 400 G9", serial: "HP7T3K2", client: "Beta Investments", tier: "standard", daysLeft: 60, oem: 189, tpm: 95, status: "alerted-60" },
  { id: "A-1006", brand: "Lenovo", model: "ThinkCentre M70q", serial: "LNVP4X1", client: "TechSoluciones", tier: "low-use", daysLeft: 88, oem: 139, tpm: 69, status: "alerted-90" },
  { id: "A-1007", brand: "Dell", model: "Precision 5680", serial: "DLM2W9K", client: "Modern Arch", tier: "critical", daysLeft: 22, oem: 449, tpm: 229, status: "quoted" },
  { id: "A-1008", brand: "HP", model: "EliteDesk 800 G9", serial: "HP5N1R7", client: "Grupo Alfa", tier: "standard", daysLeft: -15, oem: null, tpm: 109, status: "lapsed" },
];

export const INBOX_DATA: InboxMessage[] = [
  { id: 1, from: "Carlos Méndez", company: "Grupo Alfa", subject: "RE: TPM Quote — 5 Dell Units", preview: "We approve the TPM quote for the 5 Dell units. Please send PO.", time: "10:32 AM", unread: true },
  { id: 2, from: "Ana Rodríguez", company: "Rex Distribution", subject: "Quote Request — HP EliteBook", preview: "Can you send me the quote for the HP EliteBook 840 G10?", time: "9:15 AM", unread: true },
  { id: 3, from: "Pedro Silva", company: "TechSoluciones", subject: "OEM Warranty Pricing", preview: "What's the OEM warranty cost for the Lenovo units?", time: "Yesterday", unread: false },
  { id: 4, from: "María Torres", company: "Beta Investments", subject: "Warranty Renewal — 12 HP Devices", preview: "Need to renew warranty on 12 HP devices. Can you generate a PO?", time: "Yesterday", unread: false },
  { id: 5, from: "Luis García", company: "Café Central", subject: "ThinkPad Screen Issue", preview: "The ThinkPad has a screen issue — is this covered under warranty?", time: "Mar 9", unread: false },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-3001", client: "Grupo Alfa", quoteRef: "Q-5001", status: "approved",
    total: 745, created: "Mar 11", updated: "Mar 11", vendorPO: "GA-2026-0042",
    items: [
      { assetId: "A-1001", brand: "Dell", model: "Latitude 5540", serial: "DLTG7X3", coverageType: "tpm", price: 149, quantity: 5 },
    ],
  },
  {
    id: "PO-3002", client: "Rex Distribution", quoteRef: "Q-5002", status: "pending-approval",
    total: 119, created: "Mar 10", updated: "Mar 10",
    items: [
      { assetId: "A-1002", brand: "HP", model: "EliteBook 840 G10", serial: "HP2K9M1", coverageType: "tpm", price: 119, quantity: 1 },
    ],
  },
  {
    id: "PO-3003", client: "Modern Arch", quoteRef: "Q-5003", status: "draft",
    total: 449, created: "Mar 9", updated: "Mar 9",
    items: [
      { assetId: "A-1007", brand: "Dell", model: "Precision 5680", serial: "DLM2W9K", coverageType: "oem", price: 449, quantity: 1 },
    ],
  },
  {
    id: "PO-3004", client: "Café Central", quoteRef: "Q-5004", status: "fulfilled",
    total: 297, created: "Mar 3", updated: "Mar 7", vendorPO: "CC-2026-0018",
    items: [
      { assetId: "A-1003", brand: "Lenovo", model: "ThinkPad T14 Gen 4", serial: "LNV8R2P", coverageType: "tpm", price: 99, quantity: 3 },
    ],
  },
];

export const SUPPORT_LOGS: SupportTicket[] = [
  { id: "T-2001", client: "Grupo Alfa", device: "Dell Latitude 5540", issue: "No display output", status: "open", priority: "high", created: "Mar 11", assignee: "TPM" },
  { id: "T-2002", client: "Café Central", device: "ThinkPad T14 Gen 4", issue: "Battery not charging", status: "in-progress", priority: "medium", created: "Mar 10", assignee: "Lenovo" },
  { id: "T-2003", client: "Rex Distribution", device: "HP EliteBook 840 G10", issue: "Keyboard defective", status: "resolved", priority: "low", created: "Mar 8", assignee: "HP" },
  { id: "T-2004", client: "Modern Arch", device: "Dell Precision 5680", issue: "Intermittent GPU error", status: "escalated", priority: "critical", created: "Mar 7", assignee: "Dell" },
];

export const REWARDS_DATA: RewardsProfile = {
  points: 4750,
  level: "Gold",
  nextLevel: "Platinum",
  nextAt: 7500,
  history: [
    { action: "Renewal closed — Grupo Alfa (5 devices)", pts: 250, date: "Mar 10" },
    { action: "Referral: TechSoluciones signed up", pts: 500, date: "Mar 8" },
    { action: "Quote sent — Rex Distribution", pts: 50, date: "Mar 7" },
    { action: "Onboarding complete — Modern Arch", pts: 200, date: "Mar 5" },
    { action: "Renewal closed — Café Central (3 devices)", pts: 150, date: "Mar 3" },
    { action: "7-day daily usage streak", pts: 100, date: "Mar 2" },
  ],
};

export const IMPORT_FIELD_DEFINITIONS = [
  { key: "serial", label: "Serial / Service Tag", required: true, hint: "Dell service tag, HP serial, etc." },
  { key: "brand", label: "Brand", required: true, hint: "Dell, HP, Lenovo" },
  { key: "model", label: "Model", required: true, hint: "e.g. Latitude 5540" },
  { key: "client", label: "Client / Account", required: false, hint: "Company name" },
  { key: "warranty_end", label: "Warranty End Date", required: true, hint: "OEM warranty expiry date" },
  { key: "device_type", label: "Device Type", required: false, hint: "Laptop, desktop, workstation" },
  { key: "purchase_date", label: "Purchase Date", required: false, hint: "Original purchase date" },
  { key: "quantity", label: "Quantity", required: false, hint: "Number of identical units" },
] as const;

export const SAMPLE_TEMPLATE_ROWS = [
  ["Serial / Service Tag", "Brand", "Model", "Client", "Warranty End", "Device Type", "Purchase Date", "Qty"],
  ["DLTG7X3", "Dell", "Latitude 5540", "Grupo Alfa", "2026-06-15", "Laptop", "2023-06-15", 1],
  ["HP2K9M1", "HP", "EliteBook 840 G10", "Rex Distribution", "2026-04-01", "Laptop", "2023-04-01", 1],
  ["LNV8R2P", "Lenovo", "ThinkPad T14 Gen 4", "Café Central", "2026-04-10", "Laptop", "2023-10-10", 1],
  ["DLQW5N8", "Dell", "OptiPlex 7010", "Grupo Alfa", "2026-05-01", "Desktop", "2022-05-01", 3],
];
