import type { Venture, Skill, Agent, Pipeline, Contact, Deal, AgentLog } from "@/types";
import { api } from "./api";

export const ventures = {
  list: () => api.get<Venture[]>("/ventures"),
  get: (id: string) => api.get<Venture>(`/ventures/${id}`),
  create: (data: Pick<Venture, "name" | "slug" | "description">) =>
    api.post<Venture>("/ventures", data),
  update: (id: string, data: Partial<Venture>) =>
    api.put<Venture>(`/ventures/${id}`, data),
  delete: (id: string) => api.delete<void>(`/ventures/${id}`),
};

export const skills = {
  list: (ventureId: string) =>
    api.get<Skill[]>(`/skills?ventureId=${ventureId}`),
  get: (id: string) => api.get<Skill>(`/skills/${id}`),
  create: (data: Pick<Skill, "ventureId" | "name" | "slug" | "description" | "promptTemplate">) =>
    api.post<Skill>("/skills", data),
  update: (id: string, data: Partial<Skill>) =>
    api.put<Skill>(`/skills/${id}`, data),
  delete: (id: string) => api.delete<void>(`/skills/${id}`),
};

export const agents = {
  list: (ventureId: string) =>
    api.get<Agent[]>(`/ventures/${ventureId}/agents`),
  get: (id: string) => api.get<Agent>(`/agents/${id}`),
  create: (data: Pick<Agent, "ventureId" | "name" | "description">) =>
    api.post<Agent>("/agents", data),
  update: (id: string, data: Partial<Agent>) =>
    api.put<Agent>(`/agents/${id}`, data),
};

export const pipelines = {
  list: (ventureId: string) =>
    api.get<Pipeline[]>(`/ventures/${ventureId}/pipelines`),
  get: (id: string) => api.get<Pipeline>(`/pipelines/${id}`),
  create: (data: Pick<Pipeline, "ventureId" | "name" | "description" | "steps">) =>
    api.post<Pipeline>("/pipelines", data),
  update: (id: string, data: Partial<Pipeline>) =>
    api.put<Pipeline>(`/pipelines/${id}`, data),
};

export const contacts = {
  list: (ventureId: string) =>
    api.get<Contact[]>(`/ventures/${ventureId}/contacts`),
  get: (id: string) => api.get<Contact>(`/contacts/${id}`),
  create: (data: Pick<Contact, "ventureId" | "firstName" | "lastName" | "email">) =>
    api.post<Contact>("/contacts", data),
};

export const deals = {
  list: (ventureId: string) =>
    api.get<Deal[]>(`/ventures/${ventureId}/deals`),
  get: (id: string) => api.get<Deal>(`/deals/${id}`),
};

export const agentLogs = {
  list: (ventureId: string, params?: { skill?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.skill) qs.set("skill", params.skill);
    if (params?.limit) qs.set("limit", String(params.limit));
    return api.get<AgentLog[]>(`/ventures/${ventureId}/logs?${qs}`);
  },
};
