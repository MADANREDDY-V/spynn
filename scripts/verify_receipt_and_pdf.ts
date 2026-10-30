import fs from "fs";
import path from "path";
import { calcTotals, money, orderTotals } from "../src/lib/billing/calculations";
import { generateReceiptPdf } from "../src/lib/billing/generate-receipt-pdf";
import { buildReceiptText, whatsappShareUrl } from "../src/lib/billing/receipt-text";
import type { CartLine, CustomerSnapshot } from "../src/lib/billing/types";

console.log("============================================================");
console.log("RECEIPT PRINTING & WHATSAPP PDF SHARING VALIDATION SUITE");
console.log("============================================================");

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

async function runTests() {
  // ─── Test 1: Short Order PDF Generation & Data Fidelity ───
  console.log("\n--- [Test 1] Short Order Receipt & PDF Validation ---");
  const shortCustomer: CustomerSnapshot = {
    id: "cust-short",
    name: "Vikram Malhotra",
    mobile: "9876543210",
    address: "Flat 402, Rainbow Vistas, Hitec City, Hyderabad",
  };

  const shortItems: CartLine[] = [
    {
      id: "line-1",
      garmentId: "shirt",
      garmentName: "Shirt",
      service: "Dry Cleaning",
      quantity: 2,
      unitPrice: 100,
    },
    {
      id: "line-2",
      garmentId: "blazer",
      garmentName: "Blazer",
      variant: "Woolen Suit Jacket",
      service: "Dry Cleaning",
      quantity: 1,
      unitPrice: 350,
    },
    {
      id: "line-3",
      garmentId: "wash-fold",
      garmentName: "Wash & Fold",
      service: "Laundry",
      quantity: 3.5,
      unit: "kg",
      unitPrice: 80,
    },
  ];

  const shortTotals = calcTotals(shortItems, 10, 500);
  // Subtotal = (2*100) + (1*350) + (3.5*80) = 200 + 350 + 280 = 830
  // Discount 10% = 83.00
  // Total = 747.00
  // Amount paid = 500.00
  // Balance = 247.00
  assert(shortTotals.subtotal === 830, `Short order subtotal is ₹830.00 (got ${shortTotals.subtotal})`);
  assert(shortTotals.discountAmount === 83, `Short order discount is ₹83.00 (got ${shortTotals.discountAmount})`);
  assert(shortTotals.total === 747, `Short order total is ₹747.00 (got ${shortTotals.total})`);
  assert(shortTotals.balance === 247, `Short order balance is ₹247.00 (got ${shortTotals.balance})`);

  const shortPdf = await generateReceiptPdf({
    orderNumber: "SPY-20261018-001",
    createdAt: new Date().toISOString(),
    customer: shortCustomer,
    items: shortItems,
    notes: "Starch collar lightly.",
    discount: 10,
    amountPaid: 500,
  });

  assert(shortPdf.getNumberOfPages() === 1, "Short order fits on a single A4 page");
  const shortPdfBytes = shortPdf.output("arraybuffer").byteLength;
  assert(shortPdfBytes > 3000, `Short order PDF generated successfully (${shortPdfBytes} bytes)`);

  // ─── Test 2: Long Order Multi-Page PDF & Pagination ───
  console.log("\n--- [Test 2] Long Order Multi-Page Receipt & PDF Validation ---");
  const longCustomer: CustomerSnapshot = {
    id: "cust-long",
    name: "Pooja Hegde",
    mobile: "9123456789",
    address: "Plot 105, Road No. 12, Banjara Hills, Hyderabad",
  };

  const longItems: CartLine[] = [];
  for (let i = 1; i <= 35; i++) {
    longItems.push({
      id: `line-${i}`,
      garmentId: `garment-${i}`,
      garmentName: `Designer Garment Item #${i}`,
      variant: i % 2 === 0 ? "Silk Zari Work" : undefined,
      service: i % 3 === 0 ? "Ironing" : i % 4 === 0 ? "Laundry" : "Dry Cleaning",
      quantity: (i % 3) + 1,
      unit: i % 4 === 0 ? "kg" : "item",
      unitPrice: 150 + i * 5,
    });
  }

  const longTotals = calcTotals(longItems, 15, 2000);
  assert(longItems.length === 35, "Long order has 35 garment items");
  assert(longTotals.subtotal > 10000, `Long order subtotal calculated properly (${longTotals.subtotal})`);
  assert(longTotals.total > 0, `Long order final total calculated (${longTotals.total})`);

  const longPdf = await generateReceiptPdf({
    orderNumber: "SPY-20261018-LONG-35",
    createdAt: new Date().toISOString(),
    customer: longCustomer,
    items: longItems,
    notes: "VIP Customer. Handle with utmost care.",
    discount: 15,
    amountPaid: 2000,
  });

  const pageCount = longPdf.getNumberOfPages();
  assert(pageCount >= 2, `Long order spans multiple pages cleanly (got ${pageCount} pages)`);
  const longPdfBytes = longPdf.output("arraybuffer").byteLength;
  assert(longPdfBytes > 8000, `Long order PDF generated successfully (${longPdfBytes} bytes)`);

  // ─── Test 3: Print CSS Isolation Verification ───
  console.log("\n--- [Test 3] Print CSS Isolation Verification ---");
  const globalsCss = fs.readFileSync(path.resolve("src/app/globals.css"), "utf-8");
  assert(globalsCss.includes("body > *:not(#spynn-print)"), "CSS isolates print by hiding all body direct children except #spynn-print");
  assert(globalsCss.includes("display: none !important"), "CSS hides other content with display: none !important");
  assert(globalsCss.includes("size: A4 portrait"), "CSS enforces A4 portrait page sizing");
  assert(globalsCss.includes("print-color-adjust: exact"), "CSS preserves exact background and border colors for printing");
  assert(globalsCss.includes("thead"), "CSS specifies thead table header display for pagination");
  assert(globalsCss.includes("page-break-inside: avoid"), "CSS prevents awkward page breaks inside table rows");

  // ─── Test 4: Portal Rendering in Receipt Component ───
  console.log("\n--- [Test 4] Receipt Component Portal & Field Verification ---");
  const receiptSource = fs.readFileSync(path.resolve("src/components/billing/receipt.tsx"), "utf-8");
  assert(receiptSource.includes("createPortal"), "Receipt component portals to document.body");
  assert(receiptSource.includes('id="spynn-print"'), "Receipt has id='spynn-print'");
  assert(receiptSource.includes("Customer:"), "Receipt includes Customer field");
  assert(receiptSource.includes("Mobile:"), "Receipt includes Mobile field");
  assert(receiptSource.includes("Address:"), "Receipt includes Address field");
  assert(receiptSource.includes("Garment / Item"), "Receipt table includes Garment / Item column");
  assert(receiptSource.includes("Service"), "Receipt table includes Service column");
  assert(receiptSource.includes("Qty"), "Receipt table includes Qty column");
  assert(receiptSource.includes("Amount"), "Receipt table includes Amount column");
  assert(receiptSource.includes("Subtotal"), "Receipt includes Subtotal");
  assert(receiptSource.includes("Discount"), "Receipt includes Discount");
  assert(receiptSource.includes("Final Total") || receiptSource.includes("Total"), "Receipt includes Total");
  assert(receiptSource.includes("Amount paid"), "Receipt includes Amount paid");
  assert(receiptSource.includes("Balance due"), "Receipt includes Balance due");

  // ─── Test 5: Customer Modal Order Details Integration ───
  console.log("\n--- [Test 5] Customer Order Details Modal Integration ---");
  const customerPageSource = fs.readFileSync(
    path.resolve("src/app/(billing)/billing/customers/[id]/page.tsx"),
    "utf-8"
  );
  assert(customerPageSource.includes("<WhatsAppShare"), "Customer order details modal integrates WhatsAppShare");
  assert(customerPageSource.includes("<Receipt"), "Customer order details modal mounts Receipt for selected order");
  assert(customerPageSource.includes("window.print()"), "Customer order details modal triggers window.print()");

  // ─── Test 6: WhatsApp Share & Attachment Clarity ───
  console.log("\n--- [Test 6] WhatsApp PDF Sharing & Workflow Helper ---");
  const whatsappShareSource = fs.readFileSync(
    path.resolve("src/components/billing/whatsapp-share.tsx"),
    "utf-8"
  );
  assert(whatsappShareSource.includes("Download PDF"), "WhatsAppShare includes 'Download PDF' button");
  assert(whatsappShareSource.includes("Share on WhatsApp"), "WhatsAppShare includes 'Share on WhatsApp' button");
  assert(whatsappShareSource.includes("downloadReceiptPdf"), "WhatsAppShare invokes PDF generator");
  assert(whatsappShareSource.includes("cannot auto-attach files directly") || whatsappShareSource.includes("manually attach"), "UI truthfully clarifies that WhatsApp in browser cannot automatically attach local files");

  console.log("\n============================================================");
  console.log(`VALIDATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
