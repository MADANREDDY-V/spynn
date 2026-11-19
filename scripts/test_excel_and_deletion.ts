import ExcelJS from "exceljs";
import { SAMPLE_GARMENTS } from "../src/lib/billing/sample-data";
import { calcTotals, orderTotals } from "../src/lib/billing/calculations";
import {
  buildOrdersWorkbook,
  buildCustomerOrdersWorkbook,
  formatExcelDate,
} from "../src/lib/billing/excel-export";
import { deleteOrderFromSupabase } from "../src/lib/billing/supabase-billing";
import type { Customer, Order } from "../src/lib/billing/types";

console.log("=============================================================");
console.log("EXCEL EXPORT & ORDER DELETION VALIDATION SUITE");
console.log("=============================================================");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  // Test 1: Date Formatting
  console.log("\n--- [Test 1] Date formatting check ---");
  const iso = "2026-10-18T14:30:00.000Z";
  const formatted = formatExcelDate(iso);
  assert(formatted === "18-10-2026", `Date formatted as DD-MM-YYYY (got ${formatted})`);

  // Test 2: Sample Orders Generation
  console.log("\n--- [Test 2] Sample Orders Construction ---");
  const customer: Customer = {
    id: "cust-1",
    name: "Aarav Sharma",
    mobile: "9876543210",
    address: "Villa 42, Hallmark Skyrena, Hyderabad",
    createdAt: "2026-10-15T10:00:00.000Z",
  };

  const sampleOrders: Order[] = [
    {
      id: "ord-1",
      orderNumber: "SPYNN-0001",
      customerId: "cust-1",
      customer: { name: customer.name, mobile: customer.mobile, address: customer.address },
      items: [
        {
          id: "item-1",
          garmentId: "shirt",
          garmentName: "Shirt",
          service: "Dry Cleaning",
          illustration: "shirt",
          quantity: 2,
          unitPrice: 100,
        },
        {
          id: "item-2",
          garmentId: "trousers",
          garmentName: "Trousers",
          service: "Dry Cleaning",
          illustration: "trouser",
          quantity: 2,
          unitPrice: 120,
        },
      ],
      notes: "Handle silk collar carefully",
      discount: 44,
      discountPercent: 10,
      amountPaid: 400,
      paymentMethod: "Cash",
      orderStatus: "Received",
      createdAt: "2026-10-18T08:00:00.000Z",
      updatedAt: "2026-10-18T08:00:00.000Z",
    },
    {
      id: "ord-2",
      orderNumber: "SPYNN-0002",
      customerId: "cust-1",
      customer: { name: customer.name, mobile: customer.mobile, address: customer.address },
      items: [
        {
          id: "item-3",
          garmentId: "laundry",
          garmentName: "Wash & Fold",
          service: "Laundry",
          illustration: "wash-fold",
          quantity: 5,
          unitPrice: 80,
          unit: "kg",
        },
      ],
      notes: "",
      discount: 0,
      discountPercent: 0,
      amountPaid: 0,
      paymentMethod: "Online",
      orderStatus: "Ready",
      createdAt: "2026-10-19T09:00:00.000Z",
      updatedAt: "2026-10-19T09:00:00.000Z",
    },
  ];

  // Totals verification
  const t1 = orderTotals(sampleOrders[0]);
  assert(t1.subtotal === 440, "Order 1 subtotal (Actual Amount) is 440");
  assert(t1.discountAmount === 44, "Order 1 discount amount is 44");
  assert(t1.total === 396, "Order 1 final total is 396");
  assert(t1.amountPaid === 400, "Order 1 amount paid is 400");
  assert(t1.itemCount === 4, "Order 1 quantity of items is 4");

  const t2 = orderTotals(sampleOrders[1]);
  assert(t2.subtotal === 400, "Order 2 subtotal (Actual Amount) is 400");
  assert(t2.discountAmount === 0, "Order 2 discount is 0");
  assert(t2.amountPaid === 0, "Order 2 paid amount is 0 (Unpaid)");
  assert(t2.itemCount === 5, "Order 2 quantity of items is 5");

  // Test 3: Build General Orders Workbook
  console.log("\n--- [Test 3] Build General Orders Workbook ---");
  const wb = await buildOrdersWorkbook(sampleOrders, { filterDescription: "Test Batch" });
  assert(wb.worksheets.length === 1, "Workbook has 1 worksheet");
  const ws = wb.getWorksheet("SPYNN Orders")!;
  assert(!!ws, "Worksheet is named 'SPYNN Orders'");

  // Check Title
  assert(ws.getCell("A1").value === "SPYNN DRY CLEANING STUDIO", "Title is 'SPYNN DRY CLEANING STUDIO'");

  // Check Headers at Row 8
  const expectedCols = [
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

  const headerRow = ws.getRow(8);
  expectedCols.forEach((col, idx) => {
    assert(headerRow.getCell(idx + 1).value === col, `Column ${idx + 1} header is '${col}'`);
  });

  // Check Data Rows
  const row1 = ws.getRow(9);
  assert(row1.getCell(1).value === "18-10-2026", "Row 1 date is 18-10-2026");
  assert(row1.getCell(2).value === "SPYNN-0001", "Row 1 order number is SPYNN-0001");
  assert(row1.getCell(3).value === "Aarav Sharma", "Row 1 customer is Aarav Sharma");
  assert(row1.getCell(6).value === 4, "Row 1 quantity of items is 4");
  assert(row1.getCell(7).value === 440, "Row 1 Actual Amount is 440");
  assert(row1.getCell(8).value === 44, "Row 1 Discount Amount is 44");
  assert(row1.getCell(9).value === 400, "Row 1 Paid Amount is 400");

  const row2 = ws.getRow(10);
  assert(row2.getCell(1).value === "19-10-2026", "Row 2 date is 19-10-2026");
  assert(row2.getCell(6).value === 5, "Row 2 quantity of items is 5");
  assert(row2.getCell(7).value === 400, "Row 2 Actual Amount is 400");
  assert(row2.getCell(8).value === 0, "Row 2 Discount Amount is 0");
  assert(row2.getCell(9).value === 0, "Row 2 Paid Amount is 0");

  // Check Totals Row at Row 11
  const totalsRow = ws.getRow(11);
  assert(totalsRow.getCell(1).value === "TOTAL", "Totals row label is TOTAL");
  assert(totalsRow.getCell(6).value === 9, "Total quantity is 4 + 5 = 9");
  assert(totalsRow.getCell(7).value === 840, "Total Actual Amount is 440 + 400 = 840");
  assert(totalsRow.getCell(8).value === 44, "Total Discount Amount is 44 + 0 = 44");
  assert(totalsRow.getCell(9).value === 400, "Total Paid Amount is 400 + 0 = 400");

  // Test buffer write
  const buffer = await wb.xlsx.writeBuffer();
  assert(buffer.byteLength > 2000, `Orders workbook generates valid xlsx buffer (${buffer.byteLength} bytes)`);

  // Test 4: Customer Specific Orders Workbook
  console.log("\n--- [Test 4] Build Customer Specific Orders Workbook ---");
  const custWb = await buildCustomerOrdersWorkbook(customer, sampleOrders);
  const custWs = custWb.getWorksheet("SPYNN Orders")!;
  assert(!!custWs, "Customer worksheet is named 'SPYNN Orders'");

  const expectedCustCols = [
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

  const custHeaderRow = custWs.getRow(8);
  expectedCustCols.forEach((col, idx) => {
    assert(custHeaderRow.getCell(idx + 1).value === col, `Customer Column ${idx + 1} header is '${col}'`);
  });

  const custBuffer = await custWb.xlsx.writeBuffer();
  assert(custBuffer.byteLength > 2000, `Customer workbook generates valid xlsx buffer (${custBuffer.byteLength} bytes)`);

  // Test 5: Delete Order From Supabase function definition
  console.log("\n--- [Test 5] deleteOrderFromSupabase Function ---");
  const deleteRes = await deleteOrderFromSupabase("SPYNN-NONEXISTENT", "ord-nonexistent");
  assert(deleteRes.success, "deleteOrderFromSupabase returns clean success/safe handling");

  console.log("\n=============================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=============================================================");

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
