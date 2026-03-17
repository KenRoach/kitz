/** Delivery partner PO routing tools. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";
import { sendEmail, isConfigured } from "../services/mailer.js";
import { partnerToken } from "../routes/partner-portal.js";

export const partnerTools: ToolDef[] = [
  {
    name: "list_partners",
    description: "List delivery partners",
    handler: async (args) => {
      const db = getSupabase();
      let query = db.from("delivery_partners").select("*");
      if (args.active !== undefined) query = query.eq("active", args.active as boolean);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return { partners: data ?? [], count: (data ?? []).length };
    },
  },
  {
    name: "submit_po_to_partner",
    description: "Submit a purchase order to a delivery partner via email",
    handler: async (args) => {
      const db = getSupabase();
      const orderId = args.orderId as string;
      const partnerId = args.partnerId as string;

      if (!orderId || !partnerId) throw new Error("orderId and partnerId are required");

      // Fetch order
      const { data: order, error: orderErr } = await db
        .from("order_po")
        .select("*")
        .eq("id", orderId)
        .single();
      if (orderErr || !order) throw new Error("Order not found");

      // Fetch partner
      const { data: partner, error: partnerErr } = await db
        .from("delivery_partners")
        .select("*")
        .eq("id", partnerId)
        .single();
      if (partnerErr || !partner) throw new Error("Delivery partner not found");

      // Create submission record
      const { data: submission, error: subErr } = await db
        .from("po_submissions")
        .insert({ order_id: orderId, partner_id: partnerId, status: "submitted" })
        .select()
        .single();
      if (subErr) throw new Error(subErr.message);

      // Update order status
      await db.from("order_po").update({
        status: "submitted",
        delivery_partner: partner.name,
        updated: new Date().toISOString().slice(0, 10),
      }).eq("id", orderId);

      // Send email to partner if SMTP is configured
      let emailSent = false;
      if (isConfigured()) {
        const items = (order.items ?? []) as { brand: string; model: string; coverageType: string; price: number }[];
        const itemLines = items
          .map((item, i) => `${i + 1}. ${item.brand} ${item.model} — ${item.coverageType.toUpperCase()} — $${item.price}`)
          .join("\n");

        try {
          const appUrl = process.env.APP_URL || "https://www.renewflow.io";
          const token = partnerToken(partnerId);
          const portalUrl = `${appUrl}/partner/portal?token=${token}`;

          await sendEmail(
            partner.email,
            `RenewFlow PO ${orderId} — ${order.client}`,
            `New purchase order from RenewFlow.\n\nPO: ${orderId}\nClient: ${order.client}\nTotal: $${order.total}\n\nItems:\n${itemLines}\n\nView and acknowledge in the Partner Portal:\n${portalUrl}`,
            `<div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2>New Purchase Order</h2>
              <p><strong>PO:</strong> ${orderId}<br><strong>Client:</strong> ${order.client}<br><strong>Total:</strong> $${order.total}</p>
              <p>${itemLines.replace(/\n/g, "<br>")}</p>
              <p style="margin-top:16px;"><a href="${portalUrl}" style="display:inline-block;padding:10px 20px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View in Partner Portal</a></p>
              <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Sent by RenewFlow</p>
            </div>`
          );
          emailSent = true;
        } catch {
          // PO record created, email failed — logged by Fastify
        }
      }

      return {
        submissionId: submission.id,
        orderId,
        partnerId,
        partnerName: partner.name,
        status: "submitted",
        emailSent,
      };
    },
  },
  {
    name: "acknowledge_po",
    description: "Partner acknowledges receipt of a PO",
    handler: async (args) => {
      const db = getSupabase();
      const submissionId = args.submissionId as string;

      const { error } = await db.from("po_submissions").update({
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
      }).eq("id", submissionId);

      if (error) throw new Error(error.message);

      // Update order status
      const { data: sub } = await db.from("po_submissions").select("order_id").eq("id", submissionId).single();
      if (sub) {
        await db.from("order_po").update({
          status: "acknowledged",
          updated: new Date().toISOString().slice(0, 10),
        }).eq("id", sub.order_id);
      }

      return { submissionId, status: "acknowledged" };
    },
  },
  {
    name: "fulfill_po",
    description: "Partner marks a PO as fulfilled/delivered",
    handler: async (args) => {
      const db = getSupabase();
      const submissionId = args.submissionId as string;
      const tracking = (args.tracking as string) ?? null;

      const { error } = await db.from("po_submissions").update({
        status: "fulfilled",
        fulfilled_at: new Date().toISOString(),
        tracking,
      }).eq("id", submissionId);

      if (error) throw new Error(error.message);

      // Update order status
      const { data: sub } = await db.from("po_submissions").select("order_id").eq("id", submissionId).single();
      if (sub) {
        await db.from("order_po").update({
          status: "fulfilled",
          updated: new Date().toISOString().slice(0, 10),
        }).eq("id", sub.order_id);
      }

      return { submissionId, status: "fulfilled", tracking };
    },
  },
];
