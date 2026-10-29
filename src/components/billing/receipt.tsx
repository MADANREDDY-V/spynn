"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { calcTotals, money, serviceCode } from "@/lib/billing/calculations";
import type { CartLine, CustomerSnapshot } from "@/lib/billing/types";

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

export function Receipt({
  orderNumber,
  createdAt,
  customer,
  items,
  notes,
  discount,
  amountPaid,
}: {
  orderNumber: string;
  createdAt: string;
  customer: CustomerSnapshot;
  items: CartLine[];
  notes?: string;
  discount: number; // Discount percentage (0-100)
  amountPaid: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totals = calcTotals(items, discount, amountPaid);
  const formattedDate = formatInvoiceDate(createdAt || new Date().toISOString());

  const receiptContent = (
    <section id="spynn-print" className="hidden print:block">
      <div className="mx-auto w-full max-w-[190mm] p-6 text-black bg-white font-sans text-sm leading-normal">
        {/* Centered SPYNN Logo */}
        <div className="text-center mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/spynn-logo.png"
            alt="SPYNN Logo"
            className="mx-auto h-12 w-12 object-contain"
          />
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-center text-lg font-bold tracking-wide text-slate-900">
          SPYNN DRY CLEANING STUDIO
        </h1>
        <p className="text-center text-[11px] tracking-widest text-slate-700 uppercase mt-0.5">
          DRY CLEANING STUDIO · ORDER RECEIPT
        </p>

        {/* Order Bar with Top & Bottom Divider Line */}
        <div className="mt-4 flex justify-between border-y border-black py-1.5 text-sm font-medium">
          <span>Order: {orderNumber}</span>
          <span>{formattedDate}</span>
        </div>

        {/* Customer Information */}
        <div className="mt-3 text-sm space-y-1">
          <div>
            <span className="font-semibold text-black">Customer: </span>
            <span>{customer.name || "Walk-in Customer"}</span>
          </div>
          <div>
            <span className="font-semibold text-black">Mobile: </span>
            <span>{customer.mobile || "—"}</span>
          </div>
          <div>
            <span className="font-semibold text-black">Address: </span>
            <span>{customer.address || "—"}</span>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="mt-4 w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-2 pr-3 font-semibold text-black">Garment / Item</th>
              <th className="py-2 pr-3 font-semibold text-black">Service</th>
              <th className="py-2 pr-3 text-right font-semibold text-black">Qty</th>
              <th className="py-2 pr-3 text-right font-semibold text-black">Unit</th>
              <th className="py-2 text-right font-semibold text-black">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.id} className="text-slate-900 break-inside-avoid">
                <td className="py-2 pr-3">
                  <span className="font-medium">{item.garmentName}</span>
                  {item.variant ? (
                    <span className="ml-1 text-xs text-slate-600 font-normal">
                      ({item.variant})
                    </span>
                  ) : null}
                </td>
                <td className="py-2 pr-3">{serviceCode(item.service)}</td>
                <td className="py-2 pr-3 text-right">
                  {item.quantity}
                  {item.unit === "sqft"
                    ? " sft"
                    : item.unit === "pair"
                    ? " pr"
                    : item.unit === "kg"
                    ? " kg"
                    : " pcs"}
                </td>
                <td className="py-2 pr-3 text-right">{money(item.unitPrice)}</td>
                <td className="py-2 text-right font-medium">
                  {money(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom border line for items table */}
        <div className="border-b border-black w-full" />

        {/* Totals Section */}
        <div className="mt-4 ml-auto w-64 space-y-1 text-sm break-inside-avoid">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          {totals.discountPercent > 0 ? (
            <div className="flex justify-between font-medium">
              <span>Discount ({totals.discountPercent}%)</span>
              <span>−{money(totals.discountAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-black pt-1 text-base font-bold">
            <span>Total</span>
            <span>{money(totals.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount paid</span>
            <span>{money(totals.amountPaid)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Balance due</span>
            <span>{money(totals.balance)}</span>
          </div>
        </div>

        {/* Notes (if provided) */}
        {notes && notes.trim() ? (
          <p className="mt-4 text-xs text-slate-700 break-inside-avoid">
            <span className="font-semibold">Notes: </span>
            {notes.trim()}
          </p>
        ) : null}

        {/* Footer */}
        <div className="mt-8 border-t border-slate-300 pt-3 text-xs text-slate-800 break-inside-avoid">
          <p className="font-normal">Thank you for choosing SPYNN Studio.</p>
          <p className="mt-0.5 text-slate-900 font-medium">
            +91 98666 35661 · spynndrycleaning@gmail.com
          </p>
        </div>
      </div>
    </section>
  );

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(receiptContent, document.body);
}
