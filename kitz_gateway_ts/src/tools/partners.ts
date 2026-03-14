/** Delivery partner PO routing tools. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";
import { sendEmail, isConfigured } from "../services/mailer.js";

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
        .from("orders")
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
      await db.from("orders").update({
        status: "submitted",
        delivery_partner: partner.name,
        updated: new Date().toISOString().slice(0, 10),
      }).eq("id", orderId);

      // Send email to partner if SMTP is configured
      if (isConfigured()) {
        const items = order.items as { brand: string; model: string; coverageType: string; price: number }[];
        const itemLines = items
          .map((item, i) => `${i + 1}. ${item.brand} ${item.model} — ${item.coverageType.toUpperCase()} — $${item.price}`)
          .join("\n");

        await sendEmail(
          partner.email,
          `RenewFlow PO ${orderId} — ${order.client}`,
          `New purchase order from RenewFlow.\n\nPO: ${orderId}\nClient: ${order.client}\nTotal: $${order.total}\n\nItems:\n${itemLines}\n\nPlease acknowledge receipt.`,
          undefined
        );
      }

      return {
        submissionId: submission.id,
        orderId,
        partnerId,
        partnerName: partner.name,
        status: "submitted",
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
        await db.from("orders").update({
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
        await db.from("orders").update({
          status: "fulfilled",
          updated: new Date().toISOString().slice(0, 10),
        }).eq("id", sub.order_id);
      }

      return { submissionId, status: "fulfilled", tracking };
    },
  },
];
