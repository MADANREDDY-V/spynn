import {
  buildOrdersWorkbook,
  buildCustomerOrdersWorkbook,
  formatExcelDate,
  calculateOrdersSummary,
} from "../src/lib/billing/excel-export";
import { orderTotals } from "../src/lib/billing/calculations";
import type { Order, Customer, CartLine } from "../src/lib/billing/types";
import fs from "fs";
import path from "path";

console.log("==================================================================");
console.log("SPYNN BILLING — COMPLETE VERIFICATION: CUSTOMER & GLOBAL EXPORT");
console.log("==================================================================");

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`✓ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${desc}`);
    failed++;
  }
}

async function runVerification() {
  const sampleCustomer1: Customer = {
    id: "cust-1",
    name: "Arjun Reddy",
    mobile: "9876543210",
    address: "Plot 42, Jubilee Hills, Hyderabad",
    createdAt: "2026-10-01T10:00:00Z",
  };

  const sampleCustomer2: Customer = {
    id: "cust-2",
    name: "Deepika Sharma",
    mobile: "9123456780",
    address: "Flat 304, Cyber Towers Road, Madhapur",
    createdAt: "2026-10-05T14:30:00Z",
  };

  const sampleOrders: Order[] = [
    {
      id: "ord-1",
      orderNumber: "SPY-20261101-001",
      customerId: "cust-1",
      customer: {
        name: sampleCustomer1.name,
        mobile: sampleCustomer1.mobile,
        address: sampleCustomer1.address,
      },
      items: [
        {
          id: "item-1",
          garmentId: "suit",
          garmentName: "2-Piece Suit",
          variant: "Italian Wool",
          illustration: "suit",
          service: "Dry Cleaning",
          quantity: 2,
          unitPrice: 500,
          unit: "item",
        },
        {
          id: "item-2",
          garmentId: "shirt",
          garmentName: "Formal Shirt",
          illustration: "shirt",
          service: "Ironing",
          quantity: 3,
          unitPrice: 50,
          unit: "item",
        },
      ],
      orderStatus: "Ready",
      paymentStatus: "paid",
      paymentMethod: "Online",
      amountPaid: 1035, // Subtotal 1150 - 10% (115) = 1035. Fully paid.
      discountPercent: 10,
      createdAt: "2026-11-01T10:15:00Z",
      updatedAt: "2026-11-01T10:15:00Z",
    },
    {
      id: "ord-2",
      orderNumber: "SPY-20261102-002",
      customerId: "cust-1",
      customer: {
        name: sampleCustomer1.name,
        mobile: sampleCustomer1.mobile,
        address: sampleCustomer1.address,
      },
      items: [
        {
          id: "item-3",
          garmentId: "blanket",
          garmentName: "Heavy Mink Blanket",
          illustration: "blanket",
          service: "Dry Cleaning",
          quantity: 1,
          unitPrice: 400,
          unit: "item",
        },
      ],
      orderStatus: "Processing",
      paymentStatus: "partial",
      paymentMethod: "Cash",
      amountPaid: 200, // Subtotal 400, no discount, 200 paid, 200 balance.
      discountPercent: 0,
      createdAt: "2026-11-02T11:00:00Z",
      updatedAt: "2026-11-02T11:00:00Z",
    },
    {
      id: "ord-3",
      orderNumber: "SPY-20261103-003",
      customerId: "cust-2",
      customer: {
        name: sampleCustomer2.name,
        mobile: sampleCustomer2.mobile,
        address: sampleCustomer2.address,
      },
      items: [
        {
          id: "item-4",
          garmentId: "saree",
          garmentName: "Kanchipuram Silk Saree",
          illustration: "saree",
          service: "Dry Cleaning",
          quantity: 4,
          unitPrice: 350,
          unit: "item",
        },
      ],
      orderStatus: "Received",
      paymentStatus: "unpaid",
      amountPaid: 0, // Subtotal 1400, unpaid.
      discountPercent: 5, // Discount 70, final total 1330.
      createdAt: "2026-11-03T16:20:00Z",
      updatedAt: "2026-11-03T16:20:00Z",
    },
  ];

  // ─── Test 1: Customer-Wise Export Specifications ───
  console.log("\n--- [Section 1] Customer-Wise Export Validation ---");
  const cust1Orders = sampleOrders.filter((o) => o.customerId === sampleCustomer1.id);
  const custWorkbook = await buildCustomerOrdersWorkbook(sampleCustomer1, cust1Orders, {
    generatedBy: "Manager Venna",
  });

  const custSheet = custWorkbook.getWorksheet("SPYNN Orders");
  assert(custSheet !== undefined, "Customer sheet named 'SPYNN Orders' exists");
  if (!custSheet) return;

  assert(custSheet.getCell("A1").value === "SPYNN DRY CLEANING STUDIO", "Customer title row matches SPYNN DRY CLEANING STUDIO");
  assert(String(custSheet.getCell("A2").value).includes("ARJUN REDDY"), "Customer statement subtitle displays customer name");
  assert(String(custSheet.getCell("A3").value).includes(sampleCustomer1.mobile), "Customer metadata row displays phone number");
  assert(String(custSheet.getCell("A3").value).includes(sampleCustomer1.address), "Customer metadata row displays address");

  // Check required customer columns:
  // 1. Customer Name, 2. Phone Number, 3. Address, 4. Order Date, 5. Order Number,
  // 6. Quantity of Items, 7. Actual Amount, 8. Discount Amount, 9. Paid Amount
  const expectedCustHeaders = [
    "Customer Name",
    "Phone Number",
    "Address",
    "Order Date",
    "Order Number",
    "Quantity of Items",
    "Actual Amount",
    "Discount Amount",
    "Paid Amount",
  ];

  const custHdrRow = custSheet.getRow(8);
  expectedCustHeaders.forEach((hdr, idx) => {
    assert(
      custHdrRow.getCell(idx + 1).value === hdr,
      `Customer column ${idx + 1} is exactly '${hdr}' (got: '${custHdrRow.getCell(idx + 1).value}')`
    );
  });

  // Verify Row 9: First order for Arjun
  // Actual Amount: 1150 (not final total!), Discount: 115, Paid: 1035, Items: 5 (2 suits + 3 shirts)
  const custRow1 = custSheet.getRow(9);
  assert(custRow1.getCell(1).value === "Arjun Reddy", "Customer Row 1: Name is Arjun Reddy");
  assert(custRow1.getCell(2).value === "9876543210", "Customer Row 1: Phone is 9876543210");
  assert(custRow1.getCell(4).value === "01-11-2026", "Customer Row 1: Date is 01-11-2026");
  assert(custRow1.getCell(5).value === "SPY-20261101-001", "Customer Row 1: Order number is SPY-20261101-001");
  assert(custRow1.getCell(6).value === 5, "Customer Row 1: Item quantity is 5 (2 + 3)");
  assert(custRow1.getCell(7).value === 1150, "Customer Row 1: Actual Amount is ₹1150");
  assert(custRow1.getCell(8).value === 115, "Customer Row 1: Discount Amount is ₹115");
  assert(custRow1.getCell(9).value === 1035, "Customer Row 1: Paid Amount is ₹1035");

  // Verify Row 10: Second order for Arjun (partially paid)
  // Actual Amount: 400, Discount: 0, Paid: 200, Items: 1
  const custRow2 = custSheet.getRow(10);
  assert(custRow2.getCell(5).value === "SPY-20261102-002", "Customer Row 2: Order number is SPY-20261102-002");
  assert(custRow2.getCell(6).value === 1, "Customer Row 2: Item quantity is 1");
  assert(custRow2.getCell(7).value === 400, "Customer Row 2: Actual Amount is ₹400");
  assert(custRow2.getCell(8).value === 0, "Customer Row 2: Discount Amount is ₹0");
  assert(custRow2.getCell(9).value === 200, "Customer Row 2: Paid Amount is ₹200");

  // Verify Totals Row: Row 11
  const custTotalsRow = custSheet.getRow(11);
  assert(String(custTotalsRow.getCell(1).value).includes("TOTAL"), "Customer Totals Row label present");
  assert(custTotalsRow.getCell(6).value === 6, "Customer Totals: Total items = 6 (5 + 1)");
  assert(custTotalsRow.getCell(7).value === 1550, "Customer Totals: Total actual amount = ₹1550");
  assert(custTotalsRow.getCell(8).value === 115, "Customer Totals: Total discount amount = ₹115");
  assert(custTotalsRow.getCell(9).value === 1235, "Customer Totals: Total paid amount = ₹1235");

  // ─── Test 2: Global Orders Export Specifications ───
  console.log("\n--- [Section 2] Global Orders Export Validation ---");
  const globalWorkbook = await buildOrdersWorkbook(sampleOrders, {
    filterDescription: "Custom Range (All 3 Orders)",
    generatedBy: "SPYNN Billing Admin",
  });

  const globalSheet = globalWorkbook.getWorksheet("SPYNN Orders");
  assert(globalSheet !== undefined, "Global sheet named 'SPYNN Orders' exists");
  if (!globalSheet) return;

  assert(globalSheet.getCell("A1").value === "SPYNN DRY CLEANING STUDIO", "Global Title is SPYNN DRY CLEANING STUDIO");
  assert(String(globalSheet.getCell("A3").value).includes("Total Orders: 3"), "Global metadata shows Total Orders: 3");

  // Check required global columns:
  // 1. Date, 2. Order Number, 3. Customer Name, 4. Phone Number, 5. Address,
  // 6. Quantity of Items, 7. Actual Amount, 8. Discount Amount, 9. Paid Amount
  const expectedGlobalHeaders = [
    "Date",
    "Order Number",
    "Customer Name",
    "Phone Number",
    "Address",
    "Quantity of Items",
    "Actual Amount",
    "Discount Amount",
    "Paid Amount",
  ];

  const globalHdrRow = globalSheet.getRow(8);
  expectedGlobalHeaders.forEach((hdr, idx) => {
    assert(
      globalHdrRow.getCell(idx + 1).value === hdr,
      `Global column ${idx + 1} is exactly '${hdr}' (got: '${globalHdrRow.getCell(idx + 1).value}')`
    );
  });

  // Verify Row 11 (Third order: unpaid)
  // Subtotal: 1400, Discount: 70, Paid: 0
  const globalRow3 = globalSheet.getRow(11);
  assert(globalRow3.getCell(2).value === "SPY-20261103-003", "Global Row 3: Order number SPY-20261103-003");
  assert(globalRow3.getCell(3).value === "Deepika Sharma", "Global Row 3: Customer Deepika Sharma");
  assert(globalRow3.getCell(6).value === 4, "Global Row 3: Items quantity 4");
  assert(globalRow3.getCell(7).value === 1400, "Global Row 3: Actual Amount is ₹1400");
  assert(globalRow3.getCell(8).value === 70, "Global Row 3: Discount Amount is ₹70");
  assert(globalRow3.getCell(9).value === 0, "Global Row 3: Paid Amount is ₹0 (unpaid order handled properly)");

  // Verify Global Summary & Totals Row (Row 12)
  const globalTotalsRow = globalSheet.getRow(12);
  assert(String(globalTotalsRow.getCell(1).value).includes("TOTAL"), "Global Totals Row label present");
  assert(globalTotalsRow.getCell(6).value === 10, "Global Totals: Total items = 10 (5 + 1 + 4)");
  assert(globalTotalsRow.getCell(7).value === 2950, "Global Totals: Total actual amount = ₹2950 (1150+400+1400)");
  assert(globalTotalsRow.getCell(8).value === 185, "Global Totals: Total discount amount = ₹185 (115+0+70)");
  assert(globalTotalsRow.getCell(9).value === 1235, "Global Totals: Total paid amount = ₹1235 (1035+200+0)");

  // ─── Test 3: UI Files Verification ───
  console.log("\n--- [Section 3] UI Code & Components Integrity ---");
  const ordersPageCode = fs.readFileSync(path.resolve("src/app/(billing)/billing/orders/page.tsx"), "utf-8");
  assert(ordersPageCode.includes("ExportOrdersModal"), "/billing/orders mounts ExportOrdersModal");
  assert(ordersPageCode.includes("DeleteOrderModal"), "/billing/orders mounts DeleteOrderModal");
  assert(ordersPageCode.includes("ToastContainer"), "/billing/orders mounts ToastContainer");
  assert(ordersPageCode.includes("Trash2"), "/billing/orders includes Trash2 delete button icon");
  assert(ordersPageCode.includes("FileSpreadsheet"), "/billing/orders includes FileSpreadsheet export icon");
  assert(ordersPageCode.includes("deleteOrder"), "/billing/orders connects deleteOrder from billing-store");

  const customerPageCode = fs.readFileSync(path.resolve("src/app/(billing)/billing/customers/[id]/page.tsx"), "utf-8");
  assert(customerPageCode.includes("buildCustomerOrdersWorkbook"), "Customer details imports buildCustomerOrdersWorkbook");
  assert(customerPageCode.includes("downloadWorkbook"), "Customer details imports downloadWorkbook");
  assert(customerPageCode.includes("DeleteOrderModal"), "Customer details mounts DeleteOrderModal");
  assert(customerPageCode.includes("ToastContainer"), "Customer details mounts ToastContainer");
  assert(customerPageCode.includes("Trash2"), "Customer details includes Trash2 delete action");
  assert(customerPageCode.includes("FileSpreadsheet"), "Customer details includes FileSpreadsheet export button");
  assert(customerPageCode.includes("handleExportExcel"), "Customer details has handleExportExcel handler");
  assert(customerPageCode.includes("handleConfirmDelete"), "Customer details has handleConfirmDelete handler");

  const databaseSql = fs.readFileSync(path.resolve("database.sql"), "utf-8");
  assert(databaseSql.includes("delete_billing_order_by_number"), "database.sql defines atomic function delete_billing_order_by_number");
  assert(databaseSql.includes("billing_audit_logs"), "database.sql defines billing_audit_logs table");
  assert(databaseSql.includes("on delete cascade"), "database.sql ensures on delete cascade on billing_order_items");
  assert(databaseSql.includes("enable row level security"), "database.sql enables RLS on billing tables");

  console.log("\n==================================================================");
  console.log(`ALL VERIFICATION TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("FATAL ERROR IN VERIFICATION:", err);
  process.exit(1);
});
