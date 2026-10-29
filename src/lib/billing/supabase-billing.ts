import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Customer, Garment, Order, OrderStatus, PaymentMethod } from "./types";
import { orderTotals } from "./calculations";

/**
 * Service for syncing SPYNN billing data with Supabase PostgreSQL database.
 * Matches schemas defined in database.sql.
 */

export async function syncOrderToSupabase(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    };
  }

  try {
    const totals = orderTotals(order);

    // 1. Upsert customer snapshot
    let customerId = order.customerId;
    if (order.customer && order.customer.mobile) {
      const { data: custData, error: custErr } = await supabase
        .from("billing_customers")
        .upsert(
          {
            name: order.customer.name || "Walk-in Customer",
            mobile: order.customer.mobile,
            address: order.customer.address || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "mobile" }
        )
        .select("id")
        .single();

      if (!custErr && custData) {
        customerId = custData.id;
      }
    }

    // 2. Upsert billing order
    const { data: orderData, error: orderErr } = await supabase
      .from("billing_orders")
      .upsert(
        {
          order_number: order.orderNumber,
          customer_id: customerId,
          customer_name: order.customer.name || "Walk-in Customer",
          customer_mobile: order.customer.mobile || "",
          customer_address: order.customer.address || null,
          subtotal: totals.subtotal,
          discount_percent: totals.discountPercent,
          discount_amount: totals.discountAmount,
          total: totals.total,
          amount_paid: totals.amountPaid,
          balance: totals.balance,
          payment_method: order.paymentMethod || "Cash",
          cash_amount: order.cashAmount ?? null,
          online_amount: order.onlineAmount ?? null,
          order_status: order.orderStatus,
          payment_status: totals.paymentStatus,
          notes: order.notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "order_number" }
      )
      .select("id")
      .single();

    if (orderErr) {
      return { success: false, error: orderErr.message };
    }

    // 3. Upsert order line items
    if (orderData?.id && order.items.length > 0) {
      // Clear existing lines for this order
      await supabase.from("billing_order_items").delete().eq("order_id", orderData.id);

      const itemsToInsert = order.items.map((item) => ({
        order_id: orderData.id,
        garment_name: item.garmentName,
        service: item.service,
        category: null,
        variant: item.variant || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        unit: item.unit || "item",
        line_total: item.quantity * item.unitPrice,
      }));

      const { error: itemsErr } = await supabase.from("billing_order_items").insert(itemsToInsert);
      if (itemsErr) {
        return { success: false, error: itemsErr.message };
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network/Database error" };
  }
}

export async function syncCustomerToSupabase(
  customer: Customer
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured." };
  }

  try {
    const { error } = await supabase.from("billing_customers").upsert(
      {
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "mobile" }
    );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error saving customer" };
  }
}

export async function syncOrderStatusToSupabase(
  orderNumber: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false };

  try {
    const { error } = await supabase
      .from("billing_orders")
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq("order_number", orderNumber);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error updating status" };
  }
}

export async function syncPaymentToSupabase(
  orderNumber: string,
  amountPaid: number,
  paymentMethod: PaymentMethod = "Cash",
  split?: { cashAmount?: number; onlineAmount?: number }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false };

  try {
    const { data: order, error: fetchErr } = await supabase
      .from("billing_orders")
      .select("total")
      .eq("order_number", orderNumber)
      .single();

    if (fetchErr || !order) return { success: false, error: fetchErr?.message };

    const total = Number(order.total) || 0;
    const balance = Math.max(0, total - amountPaid);
    const paymentStatus = balance === 0 ? "paid" : amountPaid > 0 ? "partial" : "unpaid";

    const { error: updateErr } = await supabase
      .from("billing_orders")
      .update({
        amount_paid: amountPaid,
        balance,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        cash_amount: split?.cashAmount ?? null,
        online_amount: split?.onlineAmount ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", orderNumber);

    if (updateErr) return { success: false, error: updateErr.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error recording payment" };
  }
}

export async function syncGarmentPriceToSupabase(
  garment: Garment
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false };

  try {
    const itemKey = `${garment.service}:${garment.name}:${garment.variant || "standard"}`;
    const { error } = await supabase.from("billing_garment_prices").upsert(
      {
        item_key: itemKey,
        service: garment.service,
        category: garment.category,
        garment_name: garment.name,
        variant: garment.variant || null,
        price: garment.price,
        unit: garment.unit || "item",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "item_key" }
    );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error saving price" };
  }
}
