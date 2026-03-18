import type { Venture, Skill, Contact, Deal, AgentLog } from "@/types";
import { factoryApi, contactApi, agentApi } from "./api";

export const ventures = {
  list: () => factoryApi.get<Venture[]>("/ventures"),
  get: (id: string) => factoryApi.get<Venture>(`/ventures/${id}`),
  create: (data: Pick<Venture, "name" | "slug" | "description">) => factoryApi.post<Venture>("/ventures", data),
  update: (id: string, data: Partial<Venture>) => factoryApi.patch<Venture>(`/ventures/${id}`, data),
  delete: (id: string) => factoryApi.delete<void>(`/ventures/${id}`),
};

export const skills = {
  list: (ventureId?: string) => factoryApi.get<Skill[]>(ventureId ? `/skills?venture_id=${ventureId}` : "/skills"),
  get: (id: string) => factoryApi.get<Skill>(`/skills/${id}`),
  create: (data: { ventureId: string; name: string; slug: string; description?: string }) => factoryApi.post<Skill>("/skills", data),
  delete: (id: string) => factoryApi.delete<void>(`/skills/${id}`),
};

export const contacts = {
  list: (ventureId: string) => contactApi.get<Contact[]>(`/contacts?venture_id=${ventureId}`),
  get: (id: string) => contactApi.get<Contact>(`/contacts/${id}`),
  create: (data: { ventureId: string; firstName: string; lastName: string; email?: string; phone?: string; company?: string }) =>
    contactApi.post<Contact>("/contacts", data),
  delete: (id: string) => contactApi.delete<void>(`/contacts/${id}`),
};

export const deals = {
  list: (ventureId: string) => contactApi.get<Deal[]>(`/deals?venture_id=${ventureId}`),
  create: (data: { ventureId: string; contactId: string; title: string; stage?: string; value?: number }) =>
    contactApi.post<Deal>("/deals", data),
  update: (id: string, data: Partial<Deal>) => contactApi.patch<Deal>(`/deals/${id}`, data),
};

export const agentLogs = {
  list: (ventureId: string) => factoryApi.get<AgentLog[]>(`/logs?venture_id=${ventureId}`),
};

export const execute = {
  run: (skill: string, ventureId: string, context: Record<string, unknown>) =>
    agentApi.post<{ success: boolean; output: unknown }>("/execute", { skill, venture_id: ventureId, context }),
};
