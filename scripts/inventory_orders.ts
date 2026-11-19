/**
 * Order Inventory Script
 * Queries Supabase billing_orders and billing_order_items to produce
 * a full order inventory for review before any deletion.
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/inventory_orders.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log("=".repeat(72));
  console.log("SPYNN Billing — Order Inventory (Supabase)");
  console.log("=".repeat(72));

  // ── 1. Fetch all billing_orders ──────────────────────────────────────────
  const { data: orders, error: ordErr } = await supabase
    .from("billing_orders")
    .select(`
      id,
      order_number,
      customer_id,
      total,
      order_status,
      payment_status,
      created_at
    `)
    .order("created_at", { ascending: true });

  if (ordErr) {
    console.error("Failed to fetch billing_orders:", ordErr.message);
    process.exit(1);
  }

  if (!orders || orders.length === 0) {
    console.log("\n[billing_orders] No orders found in Supabase.\n");
    return;
  }

  // ── 2. Fetch all billing_customers for name lookup ────────────────────────
  const { data: customers } = await supabase
    .from("billing_customers")
    .select("id, full_name, mobile");

  const custMap = new Map<string, { full_name: string; mobile: string }>();
  for (const c of customers ?? []) {
    custMap.set(c.id, { full_name: c.full_name, mobile: c.mobile });
  }

  // ── 3. Fetch all billing_order_items ─────────────────────────────────────
  const { data: items } = await supabase
    .from("billing_order_items")
    .select("id, order_id, garment_name, quantity, line_total");

  const itemMap = new Map<string, typeof items>();
  for (const item of items ?? []) {
    if (!itemMap.has(item.order_id)) itemMap.set(item.order_id, []);
    itemMap.get(item.order_id)!.push(item);
  }

  // ── 4. Print inventory ────────────────────────────────────────────────────
  console.log(`\nFound ${orders.length} order(s) in billing_orders:\n`);
  console.log(
    "Order #".padEnd(16) +
    "DB UUID (first 8)".padEnd(14) +
    "Customer".padEnd(28) +
    "Total".padEnd(10) +
    "Status".padEnd(16) +
    "Created"
  );
  console.log("-".repeat(104));

  for (const o of orders) {
    const cust = o.customer_id ? custMap.get(o.customer_id) : undefined;
    const custName = cust?.full_name ?? "(no customer)";
    const lineItems = itemMap.get(o.id) ?? [];

    console.log(
      o.order_number.padEnd(16) +
      o.id.slice(0, 8).padEnd(14) +
      custName.slice(0, 26).padEnd(28) +
      `₹${Number(o.total).toFixed(2)}`.padEnd(10) +
      (o.order_status ?? "").padEnd(16) +
      (o.created_at ? new Date(o.created_at).toLocaleString("en-IN") : "")
    );

    for (const item of lineItems) {
      console.log(
        "  └─ " +
        `${item.garment_name}`.padEnd(36) +
        `qty: ${item.quantity}`.padEnd(12) +
        `₹${Number(item.line_total).toFixed(2)}`
      );
    }
  }

  // ── 5. billing_customers summary ─────────────────────────────────────────
  console.log("\n" + "=".repeat(72));
  console.log("billing_customers (all — will NOT be deleted):\n");

  const { data: allCusts } = await supabase
    .from("billing_customers")
    .select("id, full_name, mobile, address")
    .order("full_name", { ascending: true });

  for (const c of allCusts ?? []) {
    console.log(`  • ${c.full_name}  |  ${c.mobile}  |  ${c.address ?? "(no address)"}`);
  }

  // ── 6. billing_audit_logs summary ────────────────────────────────────────
  console.log("\n" + "=".repeat(72));
  console.log("billing_audit_logs (existing entries):\n");

  const { data: auditLogs, error: auditErr } = await supabase
    .from("billing_audit_logs")
    .select("id, action, entity_id, performed_by, created_at")
    .order("created_at", { ascending: false });

  if (auditErr) {
    console.log("  (Cannot read audit logs — may require elevated role)");
  } else if (!auditLogs || auditLogs.length === 0) {
    console.log("  (No audit log entries found)");
  } else {
    for (const log of auditLogs) {
      console.log(
        `  [${log.action}] entity: ${log.entity_id}  by: ${log.performed_by ?? "?"}  at: ${log.created_at}`
      );
    }
  }

  console.log("\n" + "=".repeat(72));
  console.log("Inventory complete. No data was modified.");
  console.log("=".repeat(72));
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
