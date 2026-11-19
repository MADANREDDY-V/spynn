/**
 * SPYNN Billing — Test Order Cleanup Script
 *
 * Deletes the 12 confirmed test/demo orders from Supabase.
 * Uses the service-role key (bypasses RLS) for direct administrative cleanup.
 * Writes an audit log entry for each deleted order.
 *
 * Run: node --env-file=.env.migration.local scripts/cleanup_test_orders.mjs
 *
 * IMPORTANT: Inspect the DRY RUN output first. Set DRY_RUN = false to execute.
 */

import { createClient } from "@supabase/supabase-js";

// ── Configuration ────────────────────────────────────────────────────────────

const DRY_RUN = false; // set false to execute deletions

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: Missing SUPABASE_URL or SUPABASE_SECRET_KEY (from .env.migration.local).");
  process.exit(1);
}

/** Confirmed test/demo orders to delete — all verified as early-epoch A/B-suffix test runs */
const TEST_ORDERS = [
  { orderNumber: "SPYNN-0001-A", reason: "Sample customer Ananya Reddy; Oct-10 test run" },
  { orderNumber: "SPYNN-0001-B", reason: "Duplicate of -A; unpaid copy; Oct-10 test run" },
  { orderNumber: "SPYNN-0002-A", reason: "Sample customer Rahul Sharma; Oct-12 test run" },
  { orderNumber: "SPYNN-0002-B", reason: "Duplicate of -A; Oct-12 test run" },
  { orderNumber: "SPYNN-0003-A", reason: "madan test customer; Oct-16 test run" },
  { orderNumber: "SPYNN-0003-B", reason: "No customer linked; Oct-18 test run" },
  { orderNumber: "SPYNN-0004-A", reason: "No customer linked; Oct-17 test run" },
  { orderNumber: "SPYNN-0004-B", reason: "madAN test customer; Oct-18 test run" },
  { orderNumber: "SPYNN-0005-A", reason: "Srikanth test order; Oct-17 test run" },
  { orderNumber: "SPYNN-0005-B", reason: "madAN test customer; Oct-18 test run" },
  { orderNumber: "SPYNN-0006-A", reason: "Mrs. Annapurna; Oct-17 test run" },
  { orderNumber: "SPYNN-0006-B", reason: "Mohan Rao; Oct-18 test run" },
];

const PERFORMED_BY = "admin-cleanup-2026-11-18";

// ── Main ─────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("=".repeat(72));
  console.log(`SPYNN Billing — Test Order Cleanup ${DRY_RUN ? "(DRY RUN)" : "(LIVE)"}`);
  console.log("=".repeat(72));
  console.log(`Orders to process: ${TEST_ORDERS.length}`);
  if (DRY_RUN) console.log("\n⚠️  DRY RUN — no data will be modified.\n");
  else console.log("\n🔴 LIVE MODE — data WILL be deleted.\n");

  let deleted = 0;
  let skipped = 0;
  let errors = 0;

  for (const { orderNumber, reason } of TEST_ORDERS) {
    console.log(`\nProcessing: ${orderNumber}`);
    console.log(`  Reason : ${reason}`);

    // 1. Look up the order
    const { data: order, error: lookupErr } = await supabase
      .from("billing_orders")
      .select("id, customer_id, total")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (lookupErr) {
      console.error(`  ✗ Lookup error: ${lookupErr.message}`);
      errors++;
      continue;
    }

    if (!order) {
      console.log(`  ⚠ Not found in billing_orders — already deleted or never existed. Skipping.`);
      skipped++;
      continue;
    }

    console.log(`  Found  : id=${order.id}  total=Rs.${Number(order.total).toFixed(2)}`);

    // 2. Count items
    const { count: itemCount } = await supabase
      .from("billing_order_items")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id);

    console.log(`  Items  : ${itemCount ?? 0} line item(s)`);

    if (DRY_RUN) {
      console.log(`  → DRY RUN: would delete ${itemCount ?? 0} items + order + write audit log`);
      deleted++;
      continue;
    }

    // 3. Delete order items
    const { error: itemsErr } = await supabase
      .from("billing_order_items")
      .delete()
      .eq("order_id", order.id);

    if (itemsErr) {
      console.error(`  ✗ Failed to delete order items: ${itemsErr.message}`);
      errors++;
      continue;
    }

    // 4. Delete the order
    const { error: orderErr } = await supabase
      .from("billing_orders")
      .delete()
      .eq("id", order.id);

    if (orderErr) {
      console.error(`  ✗ Failed to delete order: ${orderErr.message}`);
      errors++;
      continue;
    }

    // 5. Write audit log
    const { error: auditErr } = await supabase
      .from("billing_audit_logs")
      .insert({
        action: "DELETE_ORDER",
        entity_type: "order",
        entity_id: orderNumber,
        details: {
          order_id: order.id,
          customer_id: order.customer_id,
          total: order.total,
          deletion_type: "admin-test-cleanup",
          reason,
        },
        performed_by: PERFORMED_BY,
      });

    if (auditErr) {
      // Non-fatal: order is already deleted; log the warning
      console.warn(`  ⚠ Audit log write failed (non-fatal): ${auditErr.message}`);
    } else {
      console.log(`  ✓ Audit log written`);
    }

    console.log(`  ✓ Deleted`);
    deleted++;
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(72));
  console.log("Summary:");
  console.log(`  Deleted : ${deleted}`);
  console.log(`  Skipped : ${skipped} (not found / already gone)`);
  console.log(`  Errors  : ${errors}`);
  console.log("=".repeat(72));

  if (errors > 0) {
    console.error("\nSome deletions failed. Review errors above.");
    process.exit(1);
  } else {
    console.log("\nCleanup complete.");
  }
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
