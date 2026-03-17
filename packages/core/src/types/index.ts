export type VentureStatus = "active" | "paused" | "archived";

export interface Venture {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: VentureStatus;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  ventureId: string;
  name: string;
  description: string;
  skills: string[];
  isActive: boolean;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export type PipelineStatus = "draft" | "active" | "paused" | "completed" | "failed";

export interface Pipeline {
  id: string;
  ventureId: string;
  name: string;
  description: string;
  status: PipelineStatus;
  steps: PipelineStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStep {
  id: string;
  name: string;
  skillSlug: string;
  dependsOn: string[];
  condition?: string;
  delayMs?: number;
  config: Record<string, unknown>;
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
  createdAt: Date;
  updatedAt: Date;
}

export type DealStage =
  | "identified"
  | "contacted"
  | "qualified"
  | "quoted"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface Deal {
  id: string;
  ventureId: string;
  contactId: string;
  title: string;
  stage: DealStage;
  value: number;
  currency: string;
  metadata: Record<string, unknown>;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ChannelType = "whatsapp" | "email" | "webhook";

export interface Interaction {
  id: string;
  ventureId: string;
  contactId: string;
  channel: ChannelType;
  direction: "inbound" | "outbound";
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface AgentLog {
  id: string;
  ventureId: string;
  skill: string;
  inputHash: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  latencyMs: number;
  createdAt: Date;
}

export interface AgentJobPayload {
  skill: string;
  context: Record<string, unknown>;
  venture_id: string;
  language: string;
}

export interface ChannelMessage {
  to: string;
  channel: ChannelType;
  template: string;
  vars: Record<string, string>;
  venture_id: string;
}
