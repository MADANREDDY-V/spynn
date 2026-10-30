import type { CartLine, Order, OrderTotals, PaymentStatus } from "./types";

export function money(n: number): string {
  const value = Number.isFinite(n) ? n : 0;
  return `₹${value.toFixed(2)}`;
}

export function serviceCode(service: CartLine["service"]): string {
  switch (service) {
    case "Dry Cleaning":
      return "Dry Cleaning";
    case "Ironing":
      return "Ironing";
    case "Shoe Cleaning":
      return "Shoe Cleaning";
    case "Household":
      return "Household";
    case "Laundry":
      return "Laundry";
    default:
      return String(service);
  }
}

export function serviceAbbreviation(service: CartLine["service"]): string {
  switch (service) {
    case "Dry Cleaning":
      return "DC";
    case "Ironing":
      return "IR";
    case "Shoe Cleaning":
      return "SC";
    case "Household":
      return "HH";
    case "Laundry":
      return "L";
    default:
      return String(service);
  }
}


export function paymentStatus(total: number, amountPaid: number): PaymentStatus {
  if (amountPaid <= 0) return "unpaid";
  if (amountPaid + 0.001 >= total) return "paid";
  return "partial";
}

export function calcTotals(
  items: CartLine[],
  discountPercent: number = 0,
  amountPaid: number = 0,
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const safeDiscountPercent = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const discountAmount = Math.round(((subtotal * safeDiscountPercent) / 100) * 100) / 100;
  const total = Math.max(0, subtotal - discountAmount);
  const paid = Math.max(0, Number(amountPaid) || 0);

  return {
    subtotal,
    discountPercent: safeDiscountPercent,
    discountAmount,
    total,
    amountPaid: paid,
    balance: Math.max(0, total - paid),
    paymentStatus: paymentStatus(total, paid),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    // Backward compatibility aliases
    discount: discountAmount,
    taxable: subtotal - discountAmount,
    tax: 0,
  };
}

export function orderTotals(order: Order): OrderTotals {
  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  let pct = order.discountPercent;
  if (pct === undefined) {
    pct = subtotal > 0 && order.discount ? (order.discount / subtotal) * 100 : 0;
  }
  return calcTotals(order.items, pct, order.amountPaid);
}

export function nextOrderNumber(existing: Order[]): string {
  const max = existing.reduce((highest, order) => {
    const match = /^SPYNN-(\d+)$/.exec(order.orderNumber);
    const n = match ? Number(match[1]) : 0;
    return Number.isFinite(n) ? Math.max(highest, n) : highest;
  }, 0);
  return `SPYNN-${String(max + 1).padStart(4, "0")}`;
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
