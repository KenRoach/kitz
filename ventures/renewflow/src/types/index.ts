export interface Venture {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "paused" | "archived";
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  ventureId: string;
  name: string;
  slug: string;
  description: string;
  promptTemplate: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  ventureId: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  company: string | null;
  language: string;
  country: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  ventureId: string;
  contactId: string;
  title: string;
  stage: DealStage;
  value: number;
  currency: string;
  metadata: Record<string, unknown>;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DealStage =
  | "identified"
  | "contacted"
  | "qualified"
  | "quoted"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface AgentLog {
  id: string;
  ventureId: string;
  skill: string;
  inputHash: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  latencyMs: number;
  createdAt: string;
}

export interface Asset {
  id: string;
  ventureId: string;
  brand: string;
  model: string;
  serial: string;
  clientName: string | null;
  tier: string | null;
  warrantyEnd: string | null;
  status: string;
  tpmPrice: number | null;
  oemPrice: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
