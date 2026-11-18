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

/**
 * Permanently deletes an order and its associated line items from Supabase.
 *
 * SECURE RPC-ONLY IMPLEMENTATION:
 * Calls exclusively the atomic database function:
 *   public.delete_billing_order_by_number(p_order_number, p_performed_by)
 *
 * Security & Integrity Guarantees:
 *   - Verifies the caller's server-side JWT session via auth.uid().
 *   - Restricts deletion to authenticated staff with is_active = true and role = 'owner' in public.billing_staff.
 *   - Deletes order items and the order atomically within a single database transaction.
 *   - Records audit log entry in the same transaction using authoritative user identity.
 *   - Strictly RPC-only: never performs direct table deletion from client code.
 *   - Never falls back to client-side table deletes or client-side audit inserts.
 *   - Returns success only when the RPC explicitly returns { success: true }.
 */
export async function deleteOrderFromSupabase(
  orderNumber: string,
  _orderId?: string,
  performedBy?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Supabase not configured – local-only prototype mode; allow local deletion.
    return { success: true };
  }

  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      "delete_billing_order_by_number",
      {
        p_order_number: orderNumber,
        p_performed_by: performedBy ?? "staff",
      }
    );

    // 1. If RPC call itself failed (network issue, function missing, unauthenticated/unauthorized rejection)
    if (rpcErr) {
      return {
        success: false,
        error: rpcErr.message || "Failed to execute order deletion on the database.",
      };
    }

    // 2. Validate response structure from the stored procedure
    if (rpcData !== null && typeof rpcData === "object") {
      const result = rpcData as { success?: boolean; error?: string };

      if (result.success === true) {
        return { success: true };
      }

      if (result.success === false) {
        return {
          success: false,
          error: result.error ?? "Order deletion was rejected by the database.",
        };
      }
    }

    // 3. If response was missing or unexpected format, treat as failure
    return {
      success: false,
      error: "Unexpected response from database during order deletion.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Database error while deleting order",
    };
  }
}

/**
 * Fetches all orders from Supabase with their associated order items.
 */
export async function fetchOrdersFromSupabase(): Promise<{
  success: boolean;
  orders?: Order[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("billing_orders")
      .select(`
        id,
        order_number,
        customer_id,
        customer_name,
        customer_mobile,
        customer_address,
        subtotal,
        discount_percent,
        discount_amount,
        total,
        amount_paid,
        balance,
        payment_method,
        cash_amount,
        online_amount,
        order_status,
        payment_status,
        notes,
        created_at,
        updated_at,
        billing_order_items (
          id,
          garment_name,
          service,
          category,
          variant,
          quantity,
          unit_price,
          unit,
          line_total
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: true, orders: [] };
    }

    type DbItem = {
      id: string;
      garment_name: string;
      service: string;
      category?: string | null;
      variant?: string | null;
      quantity: number;
      unit_price: number;
      unit?: string | null;
      line_total?: number;
    };

    const orders: Order[] = data.map((row) => {
      const itemsRaw = (row.billing_order_items as unknown as DbItem[]) || [];
      const items = itemsRaw.map((item) => ({
        id: item.id,
        garmentId: item.id,
        garmentName: item.garment_name,
        variant: item.variant || undefined,
        illustration: "shirt" as const,
        service: item.service as import("./types").Service,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unit_price) || 0,
        unit: (item.unit || "item") as import("./types").GarmentUnit,
      }));

      return {
        id: row.id,
        orderNumber: row.order_number,
        customerId: row.customer_id,
        customer: {
          name: row.customer_name || "Walk-in Customer",
          mobile: row.customer_mobile || "",
          address: row.customer_address || "",
        },
        items,
        notes: row.notes || "",
        discount: Number(row.discount_amount) || 0,
        discountPercent: Number(row.discount_percent) || 0,
        taxPercent: 0,
        amountPaid: Number(row.amount_paid) || 0,
        paymentMethod: (row.payment_method || "Cash") as import("./types").PaymentMethod,
        cashAmount: row.cash_amount != null ? Number(row.cash_amount) : undefined,
        onlineAmount: row.online_amount != null ? Number(row.online_amount) : undefined,
        orderStatus: (row.order_status || "Received") as import("./types").OrderStatus,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return { success: true, orders };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error fetching orders from Supabase",
    };
  }
}
