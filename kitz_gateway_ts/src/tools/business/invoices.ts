/** Business invoice tools. */

import type { ToolDef } from "../registry.js";
import { getSupabase } from "../../db/client.js";

export const invoiceTools: ToolDef[] = [
  {
    name: "biz_generate_invoice",
    description: "Generar una factura/recibo para un pedido",
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "ID del pedido (opcional si se proveen items)" },
        items: { type: "array", description: "Lista de items: [{name, quantity, price}]" },
        tax_rate: { type: "number", description: "Tasa de impuesto (default: 0.07 ITBMS)" },
      },
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const orderId = (args.order_id as string) || null;
      const items = (args.items as Array<{ name: string; quantity: number; price: number }>) || [];
      const taxRate = (args.tax_rate as number) || 0.07; // 7% ITBMS (Panama default)

      if (!profileId) throw new Error("profile_id is required");
      if (items.length === 0 && !orderId) throw new Error("items or order_id is required");

      let invoiceItems = items;

      // If order_id provided, pull items from the order
      if (orderId && items.length === 0) {
        const { data: order, error } = await db
          .from("kz_orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (error || !order) throw new Error(`Order not found: ${orderId}`);

        const orderItems = (order.items as Array<{ name: string; quantity: number; price: number }>) || [];
        if (orderItems.length > 0) {
          invoiceItems = orderItems;
        } else {
          invoiceItems = [{ name: order.description, quantity: 1, price: Number(order.amount) }];
        }
      }

      const subtotal = invoiceItems.reduce((s, i) => s + i.quantity * i.price, 0);
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      const { data, error } = await db
        .from("kz_invoices")
        .insert({
          profile_id: profileId,
          order_id: orderId,
          items: invoiceItems,
          subtotal,
          tax,
          total,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return {
        invoice: data,
        message: `Factura creada: $${subtotal.toFixed(2)} + $${tax.toFixed(2)} ITBMS = $${total.toFixed(2)}`,
      };
    },
  },
];
