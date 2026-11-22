import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { loadBillingStore } from "./storage";
import type {
  BillingStoreData,
  Customer,
  CustomerSnapshot,
  Garment,
  GarmentUnit,
  Order,
  OrderStatus,
  PaymentMethod,
  Service,
} from "./types";
import { orderTotals } from "./calculations";
import { SAMPLE_GARMENTS } from "./sample-data";

/**
 * Verified production store UUID for SPYNN Chandanagar owned by vennapusamadankumarreddy@gmail.com
 */
export const SPYNN_STORE_ID = "dd83fb7a-938e-44ce-9de5-fbb2fbb057c3";

/**
 * Minimum sequential floor.
 * Orders up to 0082 exist in shop records; new orders continue from 0083+.
 */
export const MIN_ORDER_NUMBER_FLOOR = 82;

let cachedStoreId: string | null = null;

/**
 * Resolves the active store_id for billing operations.
 * Defaults to the verified production store ID.
 */
export async function getStoreId(): Promise<string> {
  if (cachedStoreId) return cachedStoreId;
  if (!isSupabaseConfigured()) return SPYNN_STORE_ID;

  try {
    const { data } = await supabase
      .from("billing_stores")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (data?.id) {
      cachedStoreId = data.id;
      return data.id;
    }
  } catch {
    // Fall back to known production store ID
  }
  return SPYNN_STORE_ID;
}

/**
 * Queries Supabase to determine the authoritative next unique sequential order number.
 * Guarantees every new order continues past 0082 (minimum floor 82).
 */
export async function getNextOrderNumberFromSupabase(storeId?: string): Promise<string> {
  const targetStoreId = storeId || (await getStoreId());
  let maxNumber = MIN_ORDER_NUMBER_FLOOR;

  if (isSupabaseConfigured()) {
    try {
      const [{ data: byNum }, { data: byDate }] = await Promise.all([
        supabase
          .from("billing_orders")
          .select("order_number")
          .eq("store_id", targetStoreId)
          .order("order_number", { ascending: false })
          .limit(50),
        supabase
          .from("billing_orders")
          .select("order_number")
          .eq("store_id", targetStoreId)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      const allRows = [...(byNum || []), ...(byDate || [])];
      for (const row of allRows) {
        const match = /^SPYNN-(\d+)$/.exec(row.order_number);
        if (match) {
          const n = parseInt(match[1], 10);
          if (Number.isFinite(n) && n > maxNumber) {
            maxNumber = n;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch highest order number from Supabase:", err);
    }
  }

  // Also check local store orders in case any new orders exist in client state
  try {
    const current = loadBillingStore();
    for (const o of current.orders) {
      const match = /^SPYNN-(\d+)$/.exec(o.orderNumber);
      if (match) {
        const n = parseInt(match[1], 10);
        if (Number.isFinite(n) && n > maxNumber) {
          maxNumber = n;
        }
      }
    }
  } catch {
    // ignore
  }

  return `SPYNN-${String(maxNumber + 1).padStart(4, "0")}`;
}

/**
 * Service for syncing SPYNN billing data with Supabase PostgreSQL database.
 * Prevents duplicate saves: for new orders, uses explicit INSERT with unique order number
 * collision detection and retry; for existing orders, updates by order_number.
 */
export async function syncOrderToSupabase(
  order: Order,
  isNewOrder = false
): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase not configured.",
    };
  }

  try {
    const storeId = await getStoreId();
    const totals = orderTotals(order);

    // 1. Upsert customer snapshot into billing_customers
    let customerId = order.customerId;
    const custMobile = order.customer?.mobile ? order.customer.mobile.trim() : "";
    const custName = order.customer?.name ? order.customer.name.trim() : "Walk-in Customer";
    const custAddress = order.customer?.address ? order.customer.address.trim() : null;

    if (custMobile) {
      const { data: custData, error: custErr } = await supabase
        .from("billing_customers")
        .upsert(
          {
            store_id: storeId,
            full_name: custName,
            mobile: custMobile,
            address: custAddress,
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

    let effectiveOrderNumber = order.orderNumber;
    let orderData: { id: string; order_number: string } | null = null;

    const orderPayload = {
      store_id: storeId,
      customer_id: customerId,
      source_customer_snapshot: {
        name: custName,
        mobile: custMobile,
        address: custAddress,
      },
      subtotal: totals.subtotal,
      discount: totals.discountAmount,
      discount_percent: totals.discountPercent,
      tax_percent: order.taxPercent ?? 0,
      total: totals.total,
      amount_paid: totals.amountPaid,
      balance: totals.balance,
      payment_method: order.paymentMethod || "Cash",
      order_status: order.orderStatus,
      payment_status: totals.paymentStatus,
      notes: order.notes || null,
      created_at: order.createdAt,
      updated_at: new Date().toISOString(),
    };

    if (isNewOrder) {
      // 2a. INSERT for new orders to prevent silent overwrite of existing records
      let insertAttempts = 0;
      let inserted = false;

      while (!inserted && insertAttempts < 3) {
        insertAttempts++;
        const { data: insertedOrder, error: insErr } = await supabase
          .from("billing_orders")
          .insert({
            ...orderPayload,
            order_number: effectiveOrderNumber,
          })
          .select("id, order_number")
          .single();

        if (!insErr && insertedOrder) {
          orderData = insertedOrder;
          inserted = true;
          break;
        }

        // If duplicate order number conflict (code 23505), allocate the next sequential number and retry
        if (insErr && insErr.code === "23505") {
          console.warn(`Order number ${effectiveOrderNumber} already taken, allocating next unique number...`);
          effectiveOrderNumber = await getNextOrderNumberFromSupabase(storeId);
          continue;
        }

        return { success: false, error: insErr?.message || "Failed to insert order" };
      }

      if (!inserted || !orderData) {
        return { success: false, error: "Failed to allocate unique order number." };
      }
    } else {
      // 2b. UPDATE for existing orders
      const { data: updatedOrder, error: updErr } = await supabase
        .from("billing_orders")
        .update(orderPayload)
        .eq("order_number", effectiveOrderNumber)
        .select("id, order_number")
        .single();

      if (updErr) {
        return { success: false, error: updErr.message };
      }
      orderData = updatedOrder;
    }

    // 3. Upsert order line items
    if (orderData?.id && order.items.length > 0) {
      if (!isNewOrder) {
        try {
          // Clear existing lines for this order (ignore if delete privilege is restricted by RLS)
          await supabase.from("billing_order_items").delete().eq("order_id", orderData.id);
        } catch {
          // ignore
        }
      }

      const itemsToInsert = order.items.map((item) => ({
        store_id: storeId,
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

    return { success: true, orderNumber: effectiveOrderNumber };
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
    const storeId = await getStoreId();
    const { error } = await supabase.from("billing_customers").upsert(
      {
        store_id: storeId,
        full_name: customer.name,
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
  _split?: { cashAmount?: number; onlineAmount?: number }
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
 */
export async function deleteOrderFromSupabase(
  orderNumber: string,
  _orderId?: string,
  performedBy?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
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

    if (rpcErr) {
      return {
        success: false,
        error: rpcErr.message || "Failed to execute order deletion on the database.",
      };
    }

    if (rpcData !== null && typeof rpcData === "object") {
      const result = rpcData as { success?: boolean; error?: string };
      if (result.success === true) return { success: true };
      if (result.success === false) {
        return {
          success: false,
          error: result.error ?? "Order deletion was rejected by the database.",
        };
      }
    }

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
 * Fetches all customers for the specified store from Supabase.
 */
export async function fetchCustomersFromSupabase(
  storeId?: string
): Promise<{ success: boolean; customers?: Customer[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const targetStoreId = storeId || (await getStoreId());
    const { data, error } = await supabase
      .from("billing_customers")
      .select("id, store_id, full_name, mobile, address, created_at, updated_at")
      .eq("store_id", targetStoreId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const customers: Customer[] = (data || []).map((row) => ({
      id: row.id,
      name: row.full_name || "Walk-in Customer",
      mobile: row.mobile || "",
      address: row.address || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { success: true, customers };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error fetching customers from Supabase",
    };
  }
}

/**
 * Fetches all orders with line items and customer snapshots from Supabase.
 */
export async function fetchOrdersFromSupabase(
  storeId?: string
): Promise<{
  success: boolean;
  orders?: Order[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const targetStoreId = storeId || (await getStoreId());
    const { data, error } = await supabase
      .from("billing_orders")
      .select(`
        id,
        order_number,
        customer_id,
        store_id,
        source_customer_snapshot,
        subtotal,
        discount,
        discount_percent,
        tax_percent,
        total,
        amount_paid,
        balance,
        payment_method,
        order_status,
        payment_status,
        notes,
        created_at,
        updated_at,
        billing_customers (
          id,
          full_name,
          mobile,
          address
        ),
        billing_order_items (
          id,
          source_item_id,
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
      .eq("store_id", targetStoreId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: true, orders: [] };
    }

    type DbCustomer = {
      id: string;
      full_name: string;
      mobile: string;
      address?: string | null;
    };

    type DbItem = {
      id: string;
      source_item_id?: string | null;
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
      const custRaw = row.billing_customers as unknown as DbCustomer | null;
      const snap = (row.source_customer_snapshot as { name?: string; mobile?: string; address?: string }) || {};

      const customer: CustomerSnapshot = {
        name: custRaw?.full_name || snap.name || "Walk-in Customer",
        mobile: custRaw?.mobile || snap.mobile || "",
        address: custRaw?.address || snap.address || "",
      };

      const itemsRaw = (row.billing_order_items as unknown as DbItem[]) || [];
      const items = itemsRaw.map((item) => ({
        id: item.id,
        garmentId: item.source_item_id || item.id,
        garmentName: item.garment_name,
        variant: item.variant || undefined,
        illustration: "shirt" as const,
        service: item.service as Service,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unit_price) || 0,
        unit: (item.unit || "item") as GarmentUnit,
      }));

      return {
        id: row.id,
        orderNumber: row.order_number,
        customerId: row.customer_id,
        customer,
        items,
        notes: row.notes || "",
        discount: Number(row.discount) || 0,
        discountPercent: Number(row.discount_percent) || 0,
        taxPercent: Number(row.tax_percent) || 0,
        amountPaid: Number(row.amount_paid) || 0,
        paymentMethod: (row.payment_method || "Cash") as PaymentMethod,
        orderStatus: (row.order_status || "Received") as OrderStatus,
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

/**
 * Loads the complete billing store (garments, customers, and orders) from Supabase.
 */
export async function fetchBillingStoreFromSupabase(): Promise<{
  success: boolean;
  store?: BillingStoreData;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const storeId = await getStoreId();
    const [custRes, ordRes] = await Promise.all([
      fetchCustomersFromSupabase(storeId),
      fetchOrdersFromSupabase(storeId),
    ]);

    if (!custRes.success && custRes.error) {
      return { success: false, error: custRes.error };
    }
    if (!ordRes.success && ordRes.error) {
      return { success: false, error: ordRes.error };
    }

    return {
      success: true,
      store: {
        garments: SAMPLE_GARMENTS,
        customers: custRes.customers || [],
        orders: ordRes.orders || [],
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error loading data from Supabase",
    };
  }
}
