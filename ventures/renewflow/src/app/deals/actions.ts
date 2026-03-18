"use server";

import { deals } from "@/lib/services";
import type { DealStage } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateDealStage(dealId: string, stage: DealStage) {
  await deals.update(dealId, { stage });
  revalidatePath("/deals");
}
