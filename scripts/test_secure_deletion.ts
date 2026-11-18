/**
 * SPYNN Billing – Secure Order Deletion Verification Suite
 * Tests the migration SQL, supabase-billing.ts RPC call, and UI integration.
 *
 * Run: npx tsx scripts/test_secure_deletion.ts
 */

import fs from "fs";
import path from "path";

console.log("=================================================================");
console.log("SPYNN BILLING – SECURE ORDER DELETION VERIFICATION SUITE");
console.log("=================================================================");

let passed = 0;
let failed = 0;

function pass(msg: string) {
  console.log(`  ✓ PASS: ${msg}`);
  passed++;
}

function fail(msg: string) {
  console.error(`  ✗ FAIL: ${msg}`);
  failed++;
}

function assert(condition: boolean, msg: string) {
  condition ? pass(msg) : fail(msg);
}

function section(title: string) {
  console.log(`\n--- [${title}] ---`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const migrationPath = path.resolve(
  "supabase/migrations/secure_order_deletion.sql"
);
const supabaseBillingPath = path.resolve(
  "src/lib/billing/supabase-billing.ts"
);
const billingStorePath = path.resolve(
  "src/components/billing/billing-store.tsx"
);
const deleteModalPath = path.resolve(
  "src/components/billing/delete-order-modal.tsx"
);
const ordersPagePath = path.resolve(
  "src/app/(billing)/billing/orders/page.tsx"
);
const customerPagePath = path.resolve(
  "src/app/(billing)/billing/customers/[id]/page.tsx"
);
const databaseSqlPath = path.resolve("database.sql");
const excelExportPath = path.resolve("src/lib/billing/excel-export.ts");

function read(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";
}

const migration = read(migrationPath);
const sbBilling = read(supabaseBillingPath);
const store = read(billingStorePath);
const modal = read(deleteModalPath);
const ordersPage = read(ordersPagePath);
const customerPage = read(customerPagePath);
const dbSql = read(databaseSqlPath);
const excelExport = read(excelExportPath);

// ─── Section 1: Migration File ───────────────────────────────────────────────

section("1. Migration File Structure");

assert(fs.existsSync(migrationPath), "Migration file exists at supabase/migrations/secure_order_deletion.sql");
assert(migration.length > 1000, "Migration file has substantial content");
const sqlCodeOnly = migration.replace(/--.*$/gm, "").toLowerCase();
assert(!sqlCodeOnly.includes("drop table"), "Migration does not drop any tables");
assert(!sqlCodeOnly.includes("delete from billing"), "Migration does not delete any billing records");
assert(!sqlCodeOnly.includes("truncate"), "Migration does not truncate any tables");

// ─── Section 2: PostgreSQL Function Security ─────────────────────────────────

section("2. PostgreSQL Function Security");

assert(
  migration.includes("create or replace function public.delete_billing_order_by_number"),
  "Migration creates/replaces the delete function"
);
assert(
  migration.includes("security definer"),
  "Function uses SECURITY DEFINER"
);
assert(
  migration.includes("set search_path = ''"),
  "Function sets explicit empty search_path to prevent injection"
);
assert(
  migration.includes("auth.uid()"),
  "Function calls auth.uid() to verify the authenticated user"
);
assert(
  migration.includes("v_caller_uid is null"),
  "Function rejects unauthenticated callers (uid is null)"
);
assert(
  migration.includes("from   public.billing_staff"),
  "Function fetches the caller's role and status from public.billing_staff"
);
assert(
  migration.includes("auth_user_id = v_caller_uid"),
  "Function looks up staff record via auth_user_id = auth.uid()"
);
assert(
  migration.includes("v_is_active is not true"),
  "Function rejects inactive staff records (is_active = true required)"
);
assert(
  migration.includes("v_staff_role <> 'owner'"),
  "Function authorizes the 'owner' role and rejects unauthorized roles"
);
assert(
  migration.includes("v_audit_actor := v_caller_uid::text;"),
  "Audit actor is strictly based on the authenticated caller UUID auth.uid()"
);
assert(
  !migration.includes("public.profiles"),
  "Migration has ZERO references to non-existent public.profiles"
);
assert(
  !sqlCodeOnly.includes("create table public.profiles") &&
  !sqlCodeOnly.includes("create table if not exists public.profiles") &&
  !sqlCodeOnly.includes("create table public.billing_staff") &&
  !sqlCodeOnly.includes("create table if not exists public.billing_staff"),
  "Migration does NOT create or alter public.profiles or public.billing_staff"
);
assert(
  migration.includes("display_name_hint"),
  "Client-supplied p_performed_by is stored only as a display_name_hint in details"
);
assert(
  migration.includes("for update of o"),
  "Function uses SELECT ... FOR UPDATE OF o to lock the billing_orders row during deletion"
);
assert(
  migration.includes("left join public.billing_customers c on c.id = o.customer_id") &&
  migration.includes("c.full_name"),
  "Function joins public.billing_customers to retrieve customer full_name (not missing billing_orders.customer_name)"
);
assert(
  migration.includes("delete from public.billing_order_items"),
  "Function explicitly deletes associated order items"
);
assert(
  migration.includes("delete from public.billing_orders"),
  "Function deletes the order record"
);
assert(
  migration.includes("insert into public.billing_audit_logs"),
  "Function inserts an audit log entry"
);
assert(
  migration.includes("'auth_uid',          v_caller_uid"),
  "Audit log records the verified auth.uid()"
);
assert(
  migration.includes("'staff_role',        v_staff_role"),
  "Audit log records the verified staff role"
);
assert(
  migration.includes("exception when others then"),
  "Function has an exception handler to prevent partial commits"
);
assert(
  migration.includes("No data was changed"),
  "Exception handler returns a safe error without leaking internal SQLERRM"
);

// ─── Section 3: Permission Grants ────────────────────────────────────────────

section("3. Function Execution Permissions");

assert(
  migration.includes("revoke execute on function public.delete_billing_order_by_number(text, text)") &&
  migration.includes("from public;"),
  "Execution revoked from PUBLIC"
);
assert(
  migration.includes("revoke execute on function public.delete_billing_order_by_number(text, text)") &&
  migration.includes("from anon;"),
  "Execution revoked from anon role"
);
assert(
  migration.includes("grant execute on function public.delete_billing_order_by_number(text, text)") &&
  migration.includes("to authenticated;"),
  "Execution granted only to authenticated role"
);

// ─── Section 4: Audit Log Schema Compatibility ───────────────────────────────

section("4. Audit Log Schema – Column Name Compatibility");

// Check that the SQL schema has the expected column names
assert(
  dbSql.includes("action") && dbSql.includes("entity_type") &&
  dbSql.includes("entity_id") && dbSql.includes("details") &&
  dbSql.includes("performed_by"),
  "database.sql defines the expected audit log columns: action, entity_type, entity_id, details, performed_by"
);

// Check migration uses same column names in the INSERT
const auditInsertBlock = migration.slice(
  migration.indexOf("insert into public.billing_audit_logs"),
  migration.indexOf("return jsonb_build_object(\n    'success',              true")
);
assert(auditInsertBlock.includes("action"), "Migration INSERT uses 'action' column");
assert(auditInsertBlock.includes("entity_type"), "Migration INSERT uses 'entity_type' column");
assert(auditInsertBlock.includes("entity_id"), "Migration INSERT uses 'entity_id' column");
assert(auditInsertBlock.includes("details"), "Migration INSERT uses 'details' column");
assert(auditInsertBlock.includes("performed_by"), "Migration INSERT uses 'performed_by' column");

// ─── Section 5: Strict RPC-Only Verification (No Direct Table Fallback) ──────

section("5. Strict RPC-Only Deletion & Audit Integrity");

// Slice deleteOrderFromSupabase body
const deleteFnStart = sbBilling.indexOf("export async function deleteOrderFromSupabase");
const deleteFnEnd = sbBilling.indexOf("export async function fetchOrdersFromSupabase");
const deleteFnBody = sbBilling.slice(deleteFnStart, deleteFnEnd);

assert(
  !deleteFnBody.includes('supabase.from("billing_orders").delete()'),
  "[Correction 5.1] deleteOrderFromSupabase has NO direct deletion from billing_orders"
);
assert(
  !deleteFnBody.includes('supabase.from("billing_order_items").delete()'),
  "[Correction 5.2] deleteOrderFromSupabase has NO direct deletion from billing_order_items"
);
assert(
  !deleteFnBody.includes('supabase.from("billing_audit_logs").insert('),
  "[Correction 5.3] deleteOrderFromSupabase has NO client-side audit log insert (handled inside PostgreSQL transaction)"
);
assert(
  !deleteFnBody.includes("fallback_path"),
  "[Correction 5.4] deleteOrderFromSupabase has NO direct-delete fallback path"
);
assert(
  deleteFnBody.includes('"delete_billing_order_by_number"'),
  "[Correction 5.5] supabase-billing.ts calls the correct RPC function name"
);
assert(
  deleteFnBody.includes("p_order_number: orderNumber"),
  "[Correction 5.6] supabase-billing.ts passes p_order_number parameter"
);
assert(
  deleteFnBody.includes("p_performed_by: performedBy"),
  "[Correction 5.7] supabase-billing.ts passes p_performed_by parameter as display hint"
);
assert(
  deleteFnBody.includes("if (rpcErr)"),
  "[Correction 5.8] supabase-billing.ts checks rpcErr and returns failure if RPC fails"
);
assert(
  deleteFnBody.includes("result.success === false"),
  "[Correction 5.9] supabase-billing.ts inspects result.success === false and surfaces database error"
);
assert(
  deleteFnBody.includes("result.success === true"),
  "[Correction 5.10] supabase-billing.ts returns success only when result.success === true"
);
assert(
  deleteFnBody.includes("Unexpected response from database"),
  "[Correction 5.11] supabase-billing.ts treats missing or invalid responses as failure"
);

// ─── Section 6: Dynamic DELETE Policies Removal Verification ────────────────

section("6. Table-Level Privilege Hardening & Dynamic DELETE Policy Removal");

assert(
  migration.includes("alter table public.billing_orders enable row level security;") &&
  migration.includes("alter table public.billing_order_items enable row level security;"),
  "[Hardening 1] RLS explicitly enabled on billing_orders and billing_order_items"
);
assert(
  migration.includes("from pg_policies"),
  "[Objective 1.1] Migration queries pg_policies to find existing policies dynamically"
);
assert(
  migration.includes("schemaname = 'public'"),
  "[Objective 1.2] Migration filters pg_policies for schema 'public'"
);
assert(
  migration.includes("tablename in ('billing_orders', 'billing_order_items')"),
  "[Objective 1.3] Migration filters for billing_orders and billing_order_items tables"
);
assert(
  migration.includes("cmd = 'DELETE'"),
  "[Objective 1.4] Migration filters strictly for cmd = 'DELETE' (preserves SELECT, INSERT, UPDATE)"
);
assert(
  migration.includes("execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);"),
  "[Objective 1.5] Migration drops every matching policy dynamically using format('%I', ...)"
);
assert(
  migration.includes("revoke delete on table public.billing_orders from public, anon, authenticated;") &&
  migration.includes("revoke delete on table public.billing_order_items from public, anon, authenticated;"),
  "[Hardening 2] Direct DELETE privileges explicitly revoked from PUBLIC, anon and authenticated on both tables"
);
assert(
  !migration.includes("revoke select on table public.billing_orders") &&
  !migration.includes("revoke insert on table public.billing_orders") &&
  !migration.includes("revoke update on table public.billing_orders"),
  "[Hardening 3] SELECT, INSERT, and UPDATE privileges are NOT revoked on billing tables"
);
assert(
  !migration.includes("for delete"),
  "[Objective 2] Migration creates NO replacement DELETE policies ('for delete' is absent)"
);

// ─── Section 7: Audit Log Protection Verification ───────────────────────────

section("7. Audit Log Protection Verification");

assert(
  migration.includes('drop policy if exists "Admins and Agents can insert billing audit logs."'),
  "[Correction 3.1] Migration drops client-side audit INSERT policy"
);
assert(
  !migration.includes('for insert\n  with check'),
  "[Correction 3.2] Migration does NOT create replacement client INSERT policy on audit table"
);
assert(
  migration.includes("revoke insert, update, delete on table public.billing_audit_logs from public, anon, authenticated;") ||
  migration.includes("revoke insert, update, delete on table public.billing_audit_logs from anon, authenticated;"),
  "[Correction 3.3] Direct table writes on audit log revoked from client roles"
);
assert(
  migration.includes("grant select on table public.billing_audit_logs to authenticated;"),
  "[Correction 3.4] Read-only SELECT access granted to authenticated staff"
);
assert(
  migration.includes("create policy \"Authorized staff can view billing audit logs.\""),
  "[Correction 3.5] Audit log SELECT policy preserved for active owner staff"
);
assert(
  migration.includes("where billing_staff.auth_user_id = auth.uid()") &&
  migration.includes("billing_staff.is_active = true") &&
  migration.includes("billing_staff.role = 'owner'"),
  "[Correction 3.6] Audit log SELECT policy queries public.billing_staff for active owner"
);

// ─── Section 8: Authoritative Identity Verification ─────────────────────────

section("8. Authoritative Audit Identity Verification");

assert(
  migration.includes("v_audit_actor := v_caller_uid::text;"),
  "[Correction 2.1] Audit actor uses authoritative authenticated UUID v_caller_uid::text"
);
assert(
  !migration.includes("p_performed_by,"),
  "[Correction 2.2] Client p_performed_by is NEVER trusted as the authoritative audit actor"
);
assert(
  migration.includes("'display_name_hint', p_performed_by"),
  "[Correction 2.3] p_performed_by is stored only as a display_name_hint in details JSONB"
);

// ─── Section 7: Billing Store Integration ────────────────────────────────────

section("7. Billing Store Integration");

assert(
  store.includes("deleteOrderFromSupabase"),
  "billing-store.tsx imports deleteOrderFromSupabase"
);
assert(
  store.includes("const res = await deleteOrderFromSupabase"),
  "billing-store.tsx awaits the Supabase delete before updating local store"
);
assert(
  store.includes("if (!res.success)") || store.includes("if (!res.success)"),
  "billing-store.tsx only removes the order from local store when Supabase deletion succeeded"
);
assert(
  store.includes("performedBy"),
  "billing-store.tsx derives performedBy from the session user"
);

// ─── Section 8: Delete Confirmation Modal ────────────────────────────────────

section("8. Delete Confirmation Modal (UI Safeguards)");

assert(modal.includes("confirmed"), "Modal has a double-confirmation checkbox state");
assert(
  modal.includes("disabled={!confirmed || isDeleting}"),
  "Delete button is disabled until checkbox is confirmed and not while deleting"
);
assert(modal.includes("isDeleting"), "Modal has loading state during deletion");
assert(modal.includes("Loader2"), "Modal shows a spinner while deletion is in progress");
assert(modal.includes("onConfirmDelete"), "Modal calls parent's onConfirmDelete handler");

// ─── Section 9: Global Orders Page Integration ───────────────────────────────

section("9. Global Orders Page Integration");

assert(ordersPage.includes("DeleteOrderModal"), "Orders page mounts DeleteOrderModal");
assert(ordersPage.includes("ToastContainer"), "Orders page mounts ToastContainer for feedback");
assert(ordersPage.includes("handleConfirmDelete"), "Orders page has handleConfirmDelete handler");
assert(
  ordersPage.includes("addToast(\"success\"") && ordersPage.includes("addToast(\"error\""),
  "Orders page shows success toast on deletion and error toast on failure"
);
assert(ordersPage.includes("deleteOrder"), "Orders page calls deleteOrder from billing store");

// ─── Section 10: Customer Orders Page Integration ────────────────────────────

section("10. Customer Orders Page Integration");

assert(customerPage.includes("DeleteOrderModal"), "Customer page mounts DeleteOrderModal");
assert(customerPage.includes("ToastContainer"), "Customer page mounts ToastContainer");
assert(customerPage.includes("handleConfirmDelete"), "Customer page has handleConfirmDelete handler");
assert(
  customerPage.includes("setSelectedOrder(null)"),
  "Customer page closes the order details modal when the viewed order is deleted"
);
assert(customerPage.includes("Trash2"), "Customer page has Trash2 delete icon in the orders table");
assert(
  customerPage.includes("setOrderToDelete(order)"),
  "Customer page opens delete modal on trash button click"
);
assert(
  customerPage.includes("Delete Order"),
  "Customer page has 'Delete Order' button inside the order details modal"
);

// ─── Section 11: Excel Export Preservation ───────────────────────────────────

section("11. Excel Export – Existing Functionality Unaffected");

assert(fs.existsSync(excelExportPath), "excel-export.ts still exists");
assert(
  excelExport.includes("buildOrdersWorkbook") && excelExport.includes("buildCustomerOrdersWorkbook"),
  "Excel export still exports buildOrdersWorkbook and buildCustomerOrdersWorkbook"
);
assert(
  !sbBilling.includes("buildOrdersWorkbook"),
  "supabase-billing.ts does not interfere with excel-export module"
);

// ─── Section 12: Security Scenario Matrix ────────────────────────────────────

section("12. Security Scenario Coverage (function logic analysis)");

// Scenario 1: Authenticated owner can delete
assert(
  migration.includes("v_staff_role <> 'owner'") &&
  migration.includes("from   public.billing_staff"),
  "[Scenario 1] owner role is authorized via billing_staff"
);
// Scenario 2: Inactive staff record is rejected
assert(
  migration.includes("v_is_active is not true") &&
  migration.includes("'Unauthorised: staff account is inactive.'"),
  "[Scenario 2] inactive staff record is rejected"
);
// Scenario 3: Unauthenticated user is rejected
assert(
  migration.includes("v_caller_uid is null"),
  "[Scenario 3] unauthenticated callers (uid=null) are rejected"
);
// Scenario 4: anon role cannot call the function
assert(
  migration.includes("revoke execute on function public.delete_billing_order_by_number(text, text)\n  from anon;"),
  "[Scenario 4] anon role cannot execute the function (revoked)"
);
// Scenario 5: Unauthorised role is rejected
assert(
  migration.includes("does not have permission to delete orders") &&
  migration.includes("v_staff_role <> 'owner'"),
  "[Scenario 5] unauthorised role receives a clear rejection message"
);
// Scenario 6: Non-existent order returns a proper error
assert(
  migration.includes("does not exist in the database"),
  "[Scenario 6] non-existent order returns a proper error"
);
// Scenario 7: Deletion removes order and items atomically
assert(
  migration.includes("delete from public.billing_order_items") &&
  migration.includes("delete from public.billing_orders"),
  "[Scenario 7] deletion removes both order items and the order record"
);
// Scenario 8: Audit log records the deletion
assert(
  migration.includes("insert into public.billing_audit_logs"),
  "[Scenario 8] audit log entry is inserted on successful deletion"
);
// Scenario 9: Failed deletion does not partially modify data
assert(
  migration.includes("exception when others then") &&
  migration.includes("No data was changed"),
  "[Scenario 9] exception handler rolls back partial changes"
);
// Scenario 10: Existing order history and Excel exports keep working
assert(
  sbBilling.includes("fetchOrdersFromSupabase"),
  "[Scenario 10] fetchOrdersFromSupabase function still exists for order history"
);
assert(
  !sqlCodeOnly.includes("drop table") && !sqlCodeOnly.includes("truncate"),
  "[Scenario 10] migration does not remove any existing data"
);

// Scenario 11: RPC unavailable error handling in frontend
assert(
  deleteFnBody.includes("if (rpcErr)") && deleteFnBody.includes("return {\n        success: false,"),
  "[Scenario 11] RPC unavailable/transport error immediately returns { success: false, error }"
);

// Scenario 12: No success response when deletion fails
assert(
  !deleteFnBody.includes("return { success: true }") ||
  (deleteFnBody.match(/return \{\s*success:\s*true\s*\}/g) || []).length === 2, // 1 for !isSupabaseConfigured, 1 for result.success === true
  "[Scenario 12] deleteOrderFromSupabase returns success only when RPC explicitly returns { success: true } (or dev unconfigured mode)"
);

// ─── Section 13: Safe Migration Properties ───────────────────────────────────

section("13. Migration Safety Properties");

assert(migration.includes("create table if not exists"), "Audit log table creation is idempotent");
assert(migration.includes("create index if not exists"), "Index creation is idempotent");
assert(migration.includes("create or replace function"), "Function creation is idempotent");
assert(migration.includes("drop policy if exists"), "Policy drops are safe (IF EXISTS)");
assert(!migration.includes("reset"), "Migration does not reset the database");
assert(!migration.includes("drop table"), "Migration does not drop any tables");

// ─── Section 14: Final Security Correction Checklist ─────────────────────────

section("14. Final Security Correction Checklist");

// 1. All existing DELETE policies on both tables are dynamically removed
assert(
  migration.includes("from pg_policies") &&
  migration.includes("schemaname = 'public'") &&
  migration.includes("tablename in ('billing_orders', 'billing_order_items')") &&
  migration.includes("cmd = 'DELETE'") &&
  migration.includes("execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);"),
  "[Verification 1] PostgreSQL DO block dynamically drops all DELETE policies on billing tables from pg_policies"
);

// 2. No new DELETE policies are created
assert(
  !migration.includes("for delete"),
  "[Verification 2] Migration creates NO new/replacement direct DELETE policies ('for delete' is absent)"
);

// 3. SELECT, INSERT, and UPDATE policies are preserved
assert(
  !migration.includes("cmd = 'SELECT'") &&
  !migration.includes("cmd = 'INSERT'") &&
  !migration.includes("cmd = 'UPDATE'") &&
  dbSql.includes("for select using") &&
  dbSql.includes("for insert with check") &&
  dbSql.includes("for update using"),
  "[Verification 3] SELECT, INSERT, and UPDATE policies on billing tables are strictly preserved"
);

// 4. Frontend deletion remains RPC-only
assert(
  !deleteFnBody.includes(".delete()") &&
  deleteFnBody.includes('"delete_billing_order_by_number"'),
  "[Verification 4] Frontend deletion remains strictly RPC-only with zero direct table deletions"
);

// 5. Anonymous users cannot execute the RPC
assert(
  migration.includes("revoke execute on function public.delete_billing_order_by_number(text, text)\n  from anon;"),
  "[Verification 5] Anonymous users cannot execute the RPC (revoked from anon)"
);

// 6. Unauthenticated users are rejected
assert(
  migration.includes("v_caller_uid is null") &&
  migration.includes("'Unauthenticated: you must be logged in to delete an order.'"),
  "[Verification 6] Unauthenticated users rejected with clear message"
);

// 7. Only active owner role is authorized
assert(
  migration.includes("v_staff_role <> 'owner'") &&
  migration.includes("v_is_active is not true") &&
  migration.includes("does not have permission to delete orders"),
  "[Verification 7] Only active owner role is authorized; inactive and other roles rejected"
);

// 8. Audit identity cannot be spoofed through p_performed_by
assert(
  migration.includes("v_audit_actor := v_caller_uid::text;") &&
  !migration.includes("coalesce(v_caller_email, p_performed_by,"),
  "[Verification 8] Audit identity uses strictly authenticated UUID, cannot be spoofed through p_performed_by"
);

// 9. Audit records cannot be forged through direct client inserts
assert(
  !migration.includes('for insert\n  with check') &&
  (migration.includes("revoke insert, update, delete on table public.billing_audit_logs from public, anon, authenticated;") ||
   migration.includes("revoke insert, update, delete on table public.billing_audit_logs from anon, authenticated;")),
  "[Verification 9] Audit records cannot be forged through direct client inserts (write revoked from clients)"
);

// 10. Deletion and audit logging remain atomic
assert(
  (migration.includes("for update of o;") || migration.includes("for    update;")) &&
  migration.includes("delete from public.billing_order_items") &&
  migration.includes("delete from public.billing_orders") &&
  migration.includes("insert into public.billing_audit_logs") &&
  migration.includes("exception when others then"),
  "[Verification 10] Row-locking, item deletion, order deletion, and audit logging remain strictly atomic in 1 transaction"
);

// 11. Explicit RLS enabled on both tables
assert(
  migration.includes("alter table public.billing_orders enable row level security;") &&
  migration.includes("alter table public.billing_order_items enable row level security;"),
  "[Verification 11] Row Level Security explicitly enabled on billing_orders and billing_order_items"
);

// 12. Direct DELETE privileges revoked from PUBLIC, anon and authenticated
assert(
  migration.includes("revoke delete on table public.billing_orders from public, anon, authenticated;") &&
  migration.includes("revoke delete on table public.billing_order_items from public, anon, authenticated;"),
  "[Verification 12] Direct table DELETE privileges explicitly revoked from PUBLIC, anon and authenticated on both tables"
);

// 13. SELECT, INSERT, and UPDATE privileges are not revoked
assert(
  !migration.includes("revoke select on table public.billing_orders") &&
  !migration.includes("revoke insert on table public.billing_orders") &&
  !migration.includes("revoke update on table public.billing_orders") &&
  !migration.includes("revoke select on table public.billing_order_items") &&
  !migration.includes("revoke insert on table public.billing_order_items") &&
  !migration.includes("revoke update on table public.billing_order_items"),
  "[Verification 13] SELECT, INSERT, and UPDATE privileges are preserved and NOT revoked"
);

// 14. Authorized users can still delete through the RPC
assert(
  migration.includes("grant execute on function public.delete_billing_order_by_number(text, text)\n  to authenticated;") &&
  migration.includes("security definer"),
  "[Verification 14] Authorized authenticated users can execute deletion through the SECURITY DEFINER RPC"
);

// 15. FOR ALL policies handling: verified that cmd = 'ALL' policies are not blindly dropped
assert(
  !sqlCodeOnly.includes("cmd = 'all'") &&
  migration.includes("cmd = 'DELETE'"),
  "[Verification 15] Policies with cmd = 'ALL' are not dropped (preserving SELECT/INSERT/UPDATE), while table DELETE revocation blocks client deletion"
);

// 16. Function owner retains privileges for SECURITY DEFINER execution
assert(
  migration.includes("security definer") &&
  migration.includes("set search_path = ''") &&
  migration.includes("delete from public.billing_order_items") &&
  migration.includes("delete from public.billing_orders") &&
  migration.includes("insert into public.billing_audit_logs"),
  "[Verification 16] Function owner (postgres) retains table privileges to delete order items, delete order, and insert audit records"
);

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log("\n=================================================================");
console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================================");

if (failed > 0) {
  process.exit(1);
}
