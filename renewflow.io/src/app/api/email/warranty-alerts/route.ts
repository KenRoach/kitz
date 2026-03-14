import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, createUserClient, requireOrgType } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-response";
import { sendEmail, buildWarrantyAlertEmail } from "@/lib/resend";

const schema = z.object({
  to: z.string().email(),
  maxDays: z.number().int().default(30),
});

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const user = await getAuthUser(req);
  requireOrgType(user, "var", "operator");

  const body = schema.parse(await req.json());
  const client = createUserClient(user.accessToken);

  // Get expiring assets
  const { data: assets, error } = await client
    .from("asset_item")
    .select("brand, model, serial, warranty_end, tpm_price")
    .lte("warranty_end", new Date(Date.now() + body.maxDays * 86400000).toISOString())
    .gte("warranty_end", new Date().toISOString())
    .order("warranty_end", { ascending: true });

  if (error) throw error;
  if (!assets?.length) {
    return NextResponse.json({ sent: false, message: "No expiring assets found" });
  }

  const alertAssets = assets.map((a: Record<string, unknown>) => ({
    brand: a.brand as string,
    model: a.model as string,
    serial: a.serial as string,
    client: "Portfolio",
    daysLeft: Math.ceil((new Date(a.warranty_end as string).getTime() - Date.now()) / 86400000),
    tpm: (a.tpm_price as number) ?? 0,
  }));

  const { subject, text, html } = buildWarrantyAlertEmail(alertAssets);
  const result = await sendEmail(body.to, subject, text, html);

  return NextResponse.json({ sent: true, emailId: result.id, assetCount: alertAssets.length });
});
