import { siteConfig } from "@/config/site";
import { calcTotals, money, serviceCode } from "./calculations";
import type { CartLine, CustomerSnapshot } from "./types";

export function buildReceiptText(input: {
  orderNumber: string;
  createdAt: string;
  customer: CustomerSnapshot;
  items: CartLine[];
  notes: string;
  discount: number; // Discount percentage (0-100)
  amountPaid: number;
}): string {
  const totals = calcTotals(input.items, input.discount, input.amountPaid);
  const date = new Date(input.createdAt).toLocaleString("en-IN");
  const lines = [
    "SPYNN DRY CLEANING STUDIO",
    "DRY CLEANING STUDIO · ORDER RECEIPT",
    `Order: ${input.orderNumber}`,
    `Date: ${date}`,
    "",
    `Customer: ${input.customer.name || "Walk-in"}`,
    `Mobile: ${input.customer.mobile || "—"}`,
    input.customer.address ? `Address: ${input.customer.address}` : "",
    "",
    "Items:",
    ...input.items.map((item) => {
      const amount = money(item.quantity * item.unitPrice);
      const variantSuffix = item.variant ? ` (${item.variant})` : "";
      return `• ${item.garmentName}${variantSuffix} (${serviceCode(item.service)}) x${item.quantity} @ ${money(item.unitPrice)} = ${amount}`;
    }),
    "",
    `Subtotal: ${money(totals.subtotal)}`,
    totals.discountPercent > 0
      ? `Discount (${totals.discountPercent}%): −${money(totals.discountAmount)}`
      : "",
    `Final Total: ${money(totals.total)}`,
    `Amount Paid: ${money(totals.amountPaid)}`,
    `Balance Due: ${money(totals.balance)}`,
  ];
  if (input.notes.trim()) {
    lines.push("", `Notes: ${input.notes.trim()}`);
  }
  lines.push(
    "",
    "Thank you for choosing SPYNN Studio.",
    "+91 98666 35661 · spynndrycleaning@gmail.com"
  );
  return lines.filter((line) => line !== "").join("\n");
}

export function whatsappShareUrl(mobile: string, text: string): string | null {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}
