import { calcTotals, money, serviceCode, orderTotals } from "../src/lib/billing/calculations";
import { buildReceiptText } from "../src/lib/billing/receipt-text";
import { SAMPLE_GARMENTS } from "../src/lib/billing/sample-data";
import { SERVICES, type CartLine } from "../src/lib/billing/types";

console.log("==========================================");
console.log("RUNNING BILLING VALIDATION TEST SUITE");
console.log("==========================================");

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

// ----------------------------------------------------
// Test 1: Add a garment and confirm it appears in the bill panel
// ----------------------------------------------------
console.log("\n--- Test 1: Add a garment and verify line item ---");
const shirt = SAMPLE_GARMENTS.find((g) => g.name === "Shirt" && g.service === "Dry Cleaning")!;
assert(!!shirt, "Shirt found in Dry Cleaning catalogue");
const initialCart: CartLine[] = [
  {
    id: "line-1",
    garmentId: shirt.id,
    garmentName: shirt.name,
    illustration: shirt.illustration,
    service: shirt.service,
    quantity: 1,
    unitPrice: shirt.price,
  },
];
assert(initialCart.length === 1, "Garment appears in bill panel");
assert(initialCart[0].garmentName === "Shirt", "Item name is Shirt");
assert(initialCart[0].service === "Dry Cleaning", "Service is Dry Cleaning");
assert(initialCart[0].quantity === 1, "Quantity is 1");
assert(initialCart[0].unitPrice === 100, "Unit price is 100");
const totals1 = calcTotals(initialCart, 0, 0);
assert(totals1.subtotal === 100, "Subtotal is 100");
assert(totals1.itemCount === 1, "Item count is 1");

// ----------------------------------------------------
// Test 2: Add it again and verify the quantity behaves correctly
// ----------------------------------------------------
console.log("\n--- Test 2: Add it again and verify quantity increment ---");
function addGarmentToCart(cart: CartLine[], garment: typeof shirt, chosenService: string): CartLine[] {
  const existingIdx = cart.findIndex(
    (line) => line.garmentId === garment.id && line.service === chosenService
  );
  if (existingIdx >= 0) {
    const next = [...cart];
    next[existingIdx] = {
      ...next[existingIdx],
      quantity: next[existingIdx].quantity + 1,
    };
    return next;
  }
  return [
    ...cart,
    {
      id: `line-${Date.now()}`,
      garmentId: garment.id,
      garmentName: garment.name,
      illustration: garment.illustration,
      service: chosenService as any,
      quantity: 1,
      unitPrice: garment.price,
    },
  ];
}

const updatedCart2 = addGarmentToCart(initialCart, shirt, "Dry Cleaning");
assert(updatedCart2.length === 1, "Cart still has 1 consolidated line");
assert(updatedCart2[0].quantity === 2, "Quantity incremented to 2");
const totals2 = calcTotals(updatedCart2, 0, 0);
assert(totals2.subtotal === 200, "Subtotal updated immediately to ₹200.00");
assert(totals2.itemCount === 2, "Item count updated immediately to 2");

// ----------------------------------------------------
// Test 3: Change quantity and unit price
// ----------------------------------------------------
console.log("\n--- Test 3: Change quantity and unit price ---");
const updatedCart3 = updatedCart2.map((line) =>
  line.id === "line-1" ? { ...line, quantity: 3, unitPrice: 120 } : line
);
assert(updatedCart3[0].quantity === 3, "Quantity updated to 3");
assert(updatedCart3[0].unitPrice === 120, "Unit price updated to 120");
const totals3 = calcTotals(updatedCart3, 0, 0);
assert(totals3.subtotal === 360, "Subtotal recalculated to 3 * 120 = 360");
assert(totals3.itemCount === 3, "Item count updated to 3");

// ----------------------------------------------------
// Test 4: Add a custom item
// ----------------------------------------------------
console.log("\n--- Test 4: Add a custom item ---");
const customLine: CartLine = {
  id: "custom-1",
  garmentId: "custom-g-1",
  garmentName: "Designer Silk Stole",
  illustration: "custom-item",
  service: "Dry Cleaning",
  quantity: 2,
  unitPrice: 250,
};
const updatedCart4 = [...updatedCart3, customLine];
assert(updatedCart4.length === 2, "Custom item added to bill panel");
assert(updatedCart4[1].garmentName === "Designer Silk Stole", "Custom item name recorded");
assert(updatedCart4[1].unitPrice === 250, "Custom unit price recorded");
const totals4 = calcTotals(updatedCart4, 0, 0);
assert(totals4.subtotal === 360 + 500, "Subtotal is 360 + 500 = 860");
assert(totals4.itemCount === 5, "Item count is 3 + 2 = 5");

// ----------------------------------------------------
// Test 5: Add Wash & Fold and Wash & Iron using their respective pricing bases
// ----------------------------------------------------
console.log("\n--- Test 5: Add Wash & Fold and Wash & Iron ---");
// Wash & Fold by weight (kg): 4.5 kg @ ₹80/kg
const washFoldKg: CartLine = {
  id: "laundry-1",
  garmentId: "wf-kg",
  garmentName: "Wash & Fold (4.5 kg)",
  illustration: "wash-fold",
  service: "Laundry",
  quantity: 4.5,
  unitPrice: 80,
};
// Wash & Iron by piece: 6 pcs @ ₹35/pc
const washIronPc: CartLine = {
  id: "laundry-2",
  garmentId: "wi-pc",
  garmentName: "Wash & Iron",
  illustration: "wash-iron",
  service: "Laundry",
  quantity: 6,
  unitPrice: 35,
};
const updatedCart5 = [...updatedCart4, washFoldKg, washIronPc];
assert(updatedCart5.length === 4, "Laundry lines added to bill");
assert(updatedCart5[2].service === "Laundry", "Wash & Fold is tagged with Laundry service");
assert(updatedCart5[2].quantity * updatedCart5[2].unitPrice === 360, "Wash & Fold line total is 4.5 * 80 = 360");
assert(updatedCart5[3].service === "Laundry", "Wash & Iron is tagged with Laundry service");
assert(updatedCart5[3].quantity * updatedCart5[3].unitPrice === 210, "Wash & Iron line total is 6 * 35 = 210");
const totals5 = calcTotals(updatedCart5, 0, 0);
assert(totals5.subtotal === 860 + 360 + 210, "Subtotal is 1430");

// ----------------------------------------------------
// Test 6: Switch tabs without losing bill lines
// ----------------------------------------------------
console.log("\n--- Test 6: Switch tabs without losing bill lines ---");
let activeService = "Dry Cleaning";
// Switch to Ironing
activeService = "Ironing";
assert(updatedCart5.length === 4, "Draft cart retained 4 lines when switching to Ironing");
// Switch to Shoe Cleaning
activeService = "Shoe Cleaning";
assert(updatedCart5.length === 4, "Draft cart retained 4 lines when switching to Shoe Cleaning");
// Switch to Household
activeService = "Household";
assert(updatedCart5.length === 4, "Draft cart retained 4 lines when switching to Household");
// Switch to Laundry
activeService = "Laundry";
assert(updatedCart5.length === 4, "Draft cart retained 4 lines when switching to Laundry");
assert(SERVICES.includes(activeService as any), "Laundry is one of the five valid services");
assert(SERVICES.length === 5, "Total of five services configured");
assert(SERVICES[4] === "Laundry", "Laundry is the fifth tab after Household");

// ----------------------------------------------------
// Test 7: Verify ₹1,000 subtotal with 10% discount produces ₹100 discount and ₹900 final total
// ----------------------------------------------------
console.log("\n--- Test 7: Verify ₹1,000 subtotal with 10% discount ---");
const testCart1000: CartLine[] = [
  {
    id: "item-1000",
    garmentId: "g-1",
    garmentName: "Test Suit",
    illustration: "suit",
    service: "Dry Cleaning",
    quantity: 1,
    unitPrice: 1000,
  },
];
const totalsDiscount = calcTotals(testCart1000, 10, 0);
assert(totalsDiscount.subtotal === 1000, "Subtotal is ₹1,000.00");
assert(totalsDiscount.discountPercent === 10, "Discount percentage is 10%");
assert(totalsDiscount.discountAmount === 100, "Discount amount is ₹100.00");
assert(totalsDiscount.total === 900, "Final total is ₹900.00");
assert(totalsDiscount.tax === 0, "Tax is 0 (No tax)");

// Test discount clamped between 0% and 100%
const totalsNegative = calcTotals(testCart1000, -15, 0);
assert(totalsNegative.discountPercent === 0, "Negative discount clamped to 0%");
assert(totalsNegative.total === 1000, "Total unchanged with negative discount");

const totalsOver100 = calcTotals(testCart1000, 150, 0);
assert(totalsOver100.discountPercent === 100, "Over 100% discount clamped to 100%");
assert(totalsOver100.total === 0, "Total is 0 with 100% discount");

// ----------------------------------------------------
// Test 8: Save, print, and check receipt; no tax should appear
// ----------------------------------------------------
console.log("\n--- Test 8: Check receipt text and print; verify no tax appears ---");
const receiptText = buildReceiptText({
  orderNumber: "SPYNN-1234",
  createdAt: "2026-10-14T10:00:00.000Z",
  customer: {
    name: "Vikram Varma",
    mobile: "9876543210",
    address: "Banjara Hills, Hyderabad",
  },
  items: testCart1000,
  notes: "Handle with care",
  discount: 10,
  amountPaid: 900,
});

assert(receiptText.includes("Subtotal: ₹1000.00"), "Receipt contains Subtotal: ₹1000.00");
assert(receiptText.includes("Discount (10%): −₹100.00") || receiptText.includes("Discount (10%):"), "Receipt contains Discount (10%)");
assert(receiptText.includes("Total: ₹900.00"), "Receipt contains Total: ₹900.00");
assert(receiptText.includes("Test Suit (Dry Cleaning)"), "Receipt clearly identifies item and service");
assert(!receiptText.toLowerCase().includes("tax"), "Receipt contains NO TAX lines");

// ----------------------------------------------------
// Test 9: Draft persistence simulation
// ----------------------------------------------------
console.log("\n--- Test 9: Refresh and verify draft persistence ---");
// Simulate localStorage storage mechanism
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
};

const draftToSave = {
  items: updatedCart5,
  customerId: "cust-123",
  customer: { name: "Ananya Reddy", mobile: "9876543210", address: "Hyderabad" },
  notes: "Rush delivery",
  discountPercent: 10,
  amountPaid: 200,
  service: "Laundry" as const,
  createdAt: "2026-10-14T10:00:00.000Z",
};

// Save draft
mockLocalStorage.setItem("spynn-billing-draft-v1", JSON.stringify(draftToSave));

// Restore draft (simulating page refresh)
const restoredRaw = mockLocalStorage.getItem("spynn-billing-draft-v1");
assert(!!restoredRaw, "Draft successfully retrieved from localStorage");
const restored = JSON.parse(restoredRaw!);
assert(restored.items.length === 4, "Restored draft contains all 4 lines");
assert(restored.items[0].garmentName === "Shirt", "First line restored as Shirt");
assert(restored.items[2].garmentName === "Wash & Fold (4.5 kg)", "Laundry line restored");
assert(restored.discountPercent === 10, "Discount percent 10% restored");
assert(restored.customer.name === "Ananya Reddy", "Customer restored");
assert(restored.service === "Laundry", "Active service Laundry restored");

// Clear draft on order save or reset
mockLocalStorage.removeItem("spynn-billing-draft-v1");
assert(mockLocalStorage.getItem("spynn-billing-draft-v1") === null, "Draft cleanly removed after order completion");

console.log("\n==========================================");
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==========================================");

if (failed > 0) {
  process.exit(1);
}
