"use server";

import { execute, deals, ventures } from "@/lib/services";
import { revalidatePath } from "next/cache";

export async function generateQuote(assetData: Record<string, unknown>[]) {
  const ventureList = await ventures.list();
  const flow = ventureList.find((v) => v.slug === "renewflow");
  if (!flow) throw new Error("Flow venture not found");

  const result = await execute.run("tpm-quote", flow.id, {
    hardware_inventory: assetData,
    language: "es",
    country: "PA",
  });
  return result;
}

export async function createDeal(
  title: string,
  value: number,
  contactId?: string,
) {
  const ventureList = await ventures.list();
  const flow = ventureList.find((v) => v.slug === "renewflow");
  if (!flow) throw new Error("Flow venture not found");

  await deals.create({
    ventureId: flow.id,
    contactId: contactId || flow.id, // fallback
    title,
    stage: "quoted",
    value,
  });
  revalidatePath("/deals");
}
