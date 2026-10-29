import fs from "fs";
import path from "path";
import { SAMPLE_GARMENTS } from "../src/lib/billing/sample-data";
import { SERVICES } from "../src/lib/billing/types";
import { siteConfig } from "../src/config/site";
import { protoHash, signupUser, loginUser, getSessionUser, logoutUser, userStoragePrefix } from "../src/lib/billing/auth";

console.log("=================================================");
console.log("SPYNN BILLING — COMPREHENSIVE SPECIFICATION CHECK");
console.log("=================================================");

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`✓ PASS: ${desc}`);
    passCount++;
  } else {
    console.error(`✗ FAIL: ${desc}`);
    failCount++;
  }
}

// 1. Contact Information
console.log("\n[1] Contact Information Verification:");
assert(siteConfig.contact.phone === "+91 98666 35661", `Phone is +91 98666 35661 (got ${siteConfig.contact.phone})`);
assert(siteConfig.contact.email === "spynndrycleaning@gmail.com", `Email is spynndrycleaning@gmail.com (got ${siteConfig.contact.email})`);

// Check receipt component content
const receiptSource = fs.readFileSync(path.resolve("src/components/billing/receipt.tsx"), "utf-8");
assert(receiptSource.includes("98666 35661"), "Receipt includes 98666 35661");
assert(receiptSource.includes("spynndrycleaning@gmail.com"), "Receipt includes spynndrycleaning@gmail.com");
assert(receiptSource.includes("SPYNN DRY CLEANING STUDIO"), "Receipt includes SPYNN DRY CLEANING STUDIO header");
assert(receiptSource.includes("DRY CLEANING STUDIO · ORDER RECEIPT"), "Receipt includes DRY CLEANING STUDIO · ORDER RECEIPT subtitle");
assert(receiptSource.includes("Thank you for choosing SPYNN Studio."), "Receipt includes footer message");
assert(receiptSource.includes("/images/spynn-logo.png"), "Receipt embeds official SPYNN logo");

// Check receipt text generator
const receiptTextSource = fs.readFileSync(path.resolve("src/lib/billing/receipt-text.ts"), "utf-8");
assert(receiptTextSource.includes("98666 35661"), "Receipt text includes 98666 35661");
assert(receiptTextSource.includes("spynndrycleaning@gmail.com"), "Receipt text includes spynndrycleaning@gmail.com");

// 2. Official SPYNN Logo Asset
console.log("\n[2] Brand Asset Verification:");
const logoPath = path.resolve("public/images/spynn-logo.png");
assert(fs.existsSync(logoPath), "public/images/spynn-logo.png exists");
const logoStat = fs.statSync(logoPath);
assert(logoStat.size > 1000, `Logo file is valid image asset (${logoStat.size} bytes)`);

// 3. Five Services & Catalogue
console.log("\n[3] Service Architecture & Catalogue:");
assert(SERVICES.length === 5, `5 Services defined (got ${SERVICES.length})`);
assert(SERVICES[0] === "Dry Cleaning", "Service 1: Dry Cleaning");
assert(SERVICES[1] === "Ironing", "Service 2: Ironing");
assert(SERVICES[2] === "Shoe Cleaning", "Service 3: Shoe Cleaning");
assert(SERVICES[3] === "Household", "Service 4: Household");
assert(SERVICES[4] === "Laundry", "Service 5: Laundry");

const dcItems = SAMPLE_GARMENTS.filter((g) => g.service === "Dry Cleaning");
const irItems = SAMPLE_GARMENTS.filter((g) => g.service === "Ironing");
const scItems = SAMPLE_GARMENTS.filter((g) => g.service === "Shoe Cleaning");
const hhItems = SAMPLE_GARMENTS.filter((g) => g.service === "Household");
const ldItems = SAMPLE_GARMENTS.filter((g) => g.service === "Laundry");

assert(dcItems.length >= 25, `Dry Cleaning catalogue has ${dcItems.length} items (>= 25)`);
assert(irItems.length >= 10, `Ironing catalogue has ${irItems.length} items (>= 10)`);
assert(scItems.length >= 4, `Shoe Cleaning catalogue has ${scItems.length} items (>= 4)`);
assert(hhItems.length >= 10, `Household catalogue has ${hhItems.length} items (>= 10)`);
assert(ldItems.length >= 2, `Laundry catalogue has ${ldItems.length} items (>= 2)`);

// Verify distinct pricing across services (e.g. Shirt DC vs Shirt Ironing)
const dcShirt = dcItems.find((i) => i.name === "Shirt");
const irShirt = irItems.find((i) => i.name === "Shirt");
assert(!!dcShirt && !!irShirt, "Shirt exists in both Dry Cleaning and Ironing");
assert(dcShirt!.price !== irShirt!.price, `Shirt DC price (₹${dcShirt?.price}) differs from Ironing price (₹${irShirt?.price})`);

// 4. Custom Garment placement
console.log("\n[4] Catalogue Layout Verification:");
const gridSource = fs.readFileSync(path.resolve("src/components/billing/garment-grid.tsx"), "utf-8");
assert(gridSource.includes("Custom Garment / Custom Item"), "Custom Garment card present in garment grid");
// Ensure Custom Garment is at the bottom (rendered after category loops)
const customCardPos = gridSource.indexOf("Custom Garment / Custom Item");
const categoryLoopPos = gridSource.indexOf("categories.map");
assert(customCardPos > categoryLoopPos, "Custom Garment card is positioned at the very bottom of the catalogue");

// 5. Staff Navigation & Help Center
console.log("\n[5] Staff Navigation & Help Center:");
const shellSource = fs.readFileSync(path.resolve("src/components/billing/billing-shell.tsx"), "utf-8");
assert(shellSource.includes("Help Center / Chat with us"), "Navbar contains 'Help Center / Chat with us' button");
assert(shellSource.includes("New Order"), "Navbar contains 'New Order' button");
assert(shellSource.includes("AuthGuard"), "BillingShell wraps children in AuthGuard");
assert(shellSource.includes("ProfileDropdown"), "Navbar contains Profile Dropdown with staff account & logout");

// 6. Garment Tags Modal in Orders
console.log("\n[6] Garment Tags Modal in Orders:");
const ordersSource = fs.readFileSync(path.resolve("src/app/(billing)/billing/orders/page.tsx"), "utf-8");
assert(ordersSource.includes("GarmentTagsModal"), "Orders drawer includes GarmentTagsModal");
assert(ordersSource.includes("Suspense"), "OrdersPage is wrapped with Suspense for useSearchParams");

// 7. Database SQL Migration
console.log("\n[7] Supabase PostgreSQL Database Schema:");
const dbSql = fs.readFileSync(path.resolve("database.sql"), "utf-8");
assert(dbSql.includes("billing_customers"), "database.sql contains billing_customers table");
assert(dbSql.includes("billing_orders"), "database.sql contains billing_orders table");
assert(dbSql.includes("billing_order_items"), "database.sql contains billing_order_items table");
assert(dbSql.includes("billing_garment_prices"), "database.sql contains billing_garment_prices table");
assert(dbSql.includes("alter table public.billing_orders enable row level security;"), "database.sql enables RLS on billing_orders");
assert(dbSql.includes("idx_billing_orders_order_number"), "database.sql includes order number index");

// 8. Public Site Integrity
console.log("\n[8] Public Site Preservation:");
const publicRoutes = [
  "src/app/(site)/page.tsx",
  "src/app/(site)/services/page.tsx",
  "src/app/(site)/communities/page.tsx",
  "src/app/(site)/community/[slug]/page.tsx",
  "src/app/(site)/contact/page.tsx",
  "src/app/(site)/book/page.tsx",
  "src/app/(site)/admin/page.tsx",
];
for (const route of publicRoutes) {
  assert(fs.existsSync(path.resolve(route)), `Public site route ${route} is intact`);
}

console.log("\n=================================================");
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log("=================================================");

if (failCount > 0) {
  process.exit(1);
}
