import { jsPDF } from "jspdf";
import { calcTotals, serviceCode } from "./calculations";
import type { CartLine, CustomerSnapshot } from "./types";

export interface ReceiptPdfData {
  orderNumber: string;
  createdAt: string;
  customer: CustomerSnapshot;
  items: CartLine[];
  notes?: string;
  discount: number; // Discount percentage (0-100)
  amountPaid: number;
  logoDataUrl?: string;
}

function formatInvoiceDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, "0");
    const secs = String(d.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${day}/${month}/${year}, ${hours}:${mins}:${secs} ${ampm}`;
  } catch {
    return iso;
  }
}

async function fetchLogoDataUrl(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/images/spynn-logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Generates an A4 PDF receipt matching the SPYNN billing receipt component.
 */
export async function generateReceiptPdf(data: ReceiptPdfData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const totals = calcTotals(data.items, data.discount, data.amountPaid);
  const formattedDate = formatInvoiceDate(data.createdAt || new Date().toISOString());

  const logoSrc = data.logoDataUrl || (await fetchLogoDataUrl());

  let y = 14;

  // SPYNN Logo
  if (logoSrc) {
    try {
      doc.addImage(logoSrc, "PNG", 97, y, 16, 16);
      y += 18;
    } catch {
      y += 2;
    }
  }

  // Header Typography
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(11, 31, 58); // #0B1F3A
  doc.text("SPYNN DRY CLEANING STUDIO", 105, y, { align: "center" });
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // #475569
  doc.text("DRY CLEANING STUDIO · ORDER RECEIPT", 105, y, { align: "center" });
  y += 5;

  // Order Details Bar
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(15, y, 195, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Order: ${data.orderNumber}`, 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(formattedDate, 195, y, { align: "right" });
  y += 2;
  doc.line(15, y, 195, y);
  y += 5;

  // Customer Information
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Customer: ", 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.customer.name || "Walk-in Customer", 32, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.text("Mobile: ", 15, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.customer.mobile || "—", 32, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.text("Address: ", 15, y);
  doc.setFont("helvetica", "normal");
  const addr = data.customer.address || "—";
  const splitAddr = doc.splitTextToSize(addr, 155);
  doc.text(splitAddr, 32, y);
  y += splitAddr.length * 3.8 + 3;

  function renderTableHeader(currentY: number): number {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(15, currentY, 195, currentY);
    currentY += 3.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Garment / Item", 15, currentY);
    doc.text("Service", 75, currentY);
    doc.text("Qty", 125, currentY, { align: "right" });
    doc.text("Unit Price", 160, currentY, { align: "right" });
    doc.text("Amount", 195, currentY, { align: "right" });
    currentY += 2;

    doc.setLineWidth(0.3);
    doc.line(15, currentY, 195, currentY);
    currentY += 4;
    return currentY;
  }

  y = renderTableHeader(y);

  // Table items
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  for (const item of data.items) {
    if (y > 270) {
      doc.addPage();
      y = 15;
      y = renderTableHeader(y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }

    const itemLabel = item.garmentName + (item.variant ? ` (${item.variant})` : "");
    const splitLabel = doc.splitTextToSize(itemLabel, 58);
    doc.text(splitLabel, 15, y);

    doc.text(serviceCode(item.service), 75, y);

    const unitSuffix =
      item.unit === "sqft"
        ? " sft"
        : item.unit === "pair"
        ? " pr"
        : item.unit === "kg"
        ? " kg"
        : " pcs";
    doc.text(`${item.quantity}${unitSuffix}`, 125, y, { align: "right" });
    doc.text(`Rs. ${item.unitPrice.toFixed(2)}`, 160, y, { align: "right" });
    doc.text(`Rs. ${(item.quantity * item.unitPrice).toFixed(2)}`, 195, y, { align: "right" });

    const rowHeight = Math.max(splitLabel.length * 3.6, 4.5);
    y += rowHeight;

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.15);
    doc.line(15, y, 195, y);
    y += 3;
  }

  // Divider after table
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(15, y, 195, y);
  y += 4;

  // Check room for totals
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Totals box (right aligned from x: 125 to 195)
  const totalsLeft = 125;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  doc.text("Subtotal", totalsLeft, y);
  doc.text(`Rs. ${totals.subtotal.toFixed(2)}`, 195, y, { align: "right" });
  y += 4;

  if (totals.discountPercent > 0) {
    doc.text(`Discount (${totals.discountPercent}%)`, totalsLeft, y);
    doc.text(`-Rs. ${totals.discountAmount.toFixed(2)}`, 195, y, { align: "right" });
    y += 4;
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(totalsLeft, y, 195, y);
  y += 3.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Final Total", totalsLeft, y);
  doc.text(`Rs. ${totals.total.toFixed(2)}`, 195, y, { align: "right" });
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Amount Paid", totalsLeft, y);
  doc.text(`Rs. ${totals.amountPaid.toFixed(2)}`, 195, y, { align: "right" });
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.text("Balance Due", totalsLeft, y);
  doc.text(`Rs. ${totals.balance.toFixed(2)}`, 195, y, { align: "right" });
  y += 6;

  // Notes
  if (data.notes && data.notes.trim()) {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(`Notes: ${data.notes.trim()}`, 180);
    doc.text(splitNotes, 15, y);
    y += splitNotes.length * 3.5 + 4;
  }

  // Footer
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  y += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(15, y, 195, y);
  y += 4;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Thank you for choosing SPYNN Studio.", 105, y, { align: "center" });
  y += 3.5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("+91 98666 35661 · spynndrycleaning@gmail.com", 105, y, { align: "center" });

  return doc;
}

/**
 * Generates and downloads the receipt PDF directly to the user's browser.
 */
export async function downloadReceiptPdf(data: ReceiptPdfData, filename?: string): Promise<void> {
  const doc = await generateReceiptPdf(data);
  const cleanOrderNum = (data.orderNumber || "ORDER").replace(/[^a-zA-Z0-9_-]/g, "_");
  const saveName = filename || `SPYNN-Receipt-${cleanOrderNum}.pdf`;
  doc.save(saveName);
}
