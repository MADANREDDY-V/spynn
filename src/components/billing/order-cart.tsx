"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, MessageSquare, Plus, Tag, Trash2 } from "lucide-react";
import { CustomerPicker } from "@/components/billing/customer-picker";
import { GarmentTagsModal } from "@/components/billing/garment-tags";
import { calcTotals, money, serviceAbbreviation } from "@/lib/billing/calculations";
import { buildReceiptText, whatsappShareUrl } from "@/lib/billing/receipt-text";
import { downloadReceiptPdf } from "@/lib/billing/generate-receipt-pdf";
import { billingBtnGhost, billingBtnPrimary } from "@/lib/billing/styles";
import type { CartLine, Customer, CustomerSnapshot } from "@/lib/billing/types";

export function OrderCart({
  customers,
  customerId,
  customer,
  cart,
  discount,
  orderNumber = "",
  createdAt,
  notice = "",
  onSelectCustomer,
  onSaveCustomer,
  onUpdateLine,
  onRemoveLine,
  onDiscount,
  onSave,
  onPrint,
  onReset,
}: {
  customers: Customer[];
  customerId: string | null;
  customer: CustomerSnapshot;
  cart: CartLine[];
  discount: number; // Discount percentage (0-100)
  orderNumber?: string;
  createdAt?: string;
  notice?: string;
  onSelectCustomer: (customer: Customer | null) => void;
  onSaveCustomer: (draft: { id?: string; name: string; mobile: string; address: string }) => Customer;
  onUpdateLine: (id: string, patch: Partial<CartLine>) => void;
  onRemoveLine: (id: string) => void;
  onDiscount: (value: number) => void;
  onSave: () => void;
  onPrint: () => void;
  onReset: () => void;
  // Optional for backward compatibility
  notes?: string;
  amountPaid?: number;
  onNotes?: (value: string) => void;
  onAmountPaid?: (value: number) => void;
}) {
  const totals = calcTotals(cart, discount, 0);
  const [activeId, setActiveId] = useState<string | null>(() => cart[cart.length - 1]?.id ?? null);
  const [showTags, setShowTags] = useState(false);

  // Keep activeId pointing to an existing item or the latest added item
  useEffect(() => {
    if (cart.length > 0) {
      if (!activeId || !cart.some((l) => l.id === activeId)) {
        setActiveId(cart[cart.length - 1].id);
      }
    } else {
      setActiveId(null);
    }
  }, [cart, activeId]);

  // WhatsApp share handler
  function handleWhatsApp() {
    const text = buildReceiptText({
      orderNumber: orderNumber || "DRAFT",
      createdAt: createdAt || new Date().toISOString(),
      customer,
      items: cart,
      notes: "",
      discount,
      amountPaid: 0,
    });
    const url = whatsappShareUrl(customer.mobile, text);
    if (!url) {
      alert("Please add a valid mobile number for the customer to use WhatsApp sharing.");
      return;
    }
    downloadReceiptPdf({
      orderNumber: orderNumber || "DRAFT",
      createdAt: createdAt || new Date().toISOString(),
      customer,
      items: cart,
      notes: "",
      discount,
      amountPaid: 0,
    }).catch(console.error);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <aside className="no-print flex h-full max-h-full min-h-0 min-w-0 flex-col overflow-hidden border-t border-slate-200 bg-white lg:border-t-0 lg:border-l">
        {/* Red bill header matching Fabklean reference */}
        <div className="flex shrink-0 items-center justify-between bg-[#f00008] px-3 py-2 text-white">
          <div className="flex items-center gap-2">
            <Image
              src="/images/spynn-logo.png"
              alt="SPYNN"
              width={26}
              height={26}
              className="h-6.5 w-6.5 shrink-0 rounded-full bg-white p-0.5 object-contain"
            />
            <div>
              <div className="text-[14px] font-bold tracking-wide">SPYNN STUDIO</div>
              <div className="text-[11px] opacity-90">Current bill · {orderNumber || "Draft"}</div>
            </div>
          </div>
          <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold">Q:{totals.itemCount}</span>
        </div>

        {/* Customer Picker */}
        <div className="shrink-0">
          <CustomerPicker
            customers={customers}
            selectedId={customerId}
            selected={customer}
            onSelect={onSelectCustomer}
            onSave={onSaveCustomer}
          />
        </div>

        {/* PRICE LIST / BILL Heading */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">PRICE LIST / BILL</h2>
          <span className="text-[11px] font-semibold capitalize text-slate-500">{totals.paymentStatus}</span>
        </div>

        {/* Vertically scrollable item list container */}
        <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
              <div className="font-semibold text-slate-700">Cart is empty</div>
              <p className="mt-1 text-slate-400">Click any catalogue garment or custom item to start your bill.</p>
            </div>
          ) : (
            cart.map((item) => {
              const isSelected = item.id === activeId;
              return (
                <article
                  key={item.id}
                  className={`transition-colors ${
                    isSelected
                      ? "bg-[#fffbeb] border-y border-amber-200/80 px-3 py-2 shadow-xs"
                      : "px-3 py-2 hover:bg-slate-50/80 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isSelected) setActiveId(item.id);
                  }}
                >
                  {/* Top line: Item Name (Variant) (Service Abbr) on left; Qty, Unit Price, Line Total on right */}
                  <div className="flex items-center justify-between gap-1 select-none text-xs">
                    <div className="min-w-0 flex-1 truncate font-medium text-slate-900">
                      <span>{item.garmentName}</span>
                      {item.variant ? (
                        <span className="ml-1 text-[11px] font-semibold text-emerald-700">· {item.variant}</span>
                      ) : null}
                      <span className="text-[11px] text-slate-500 font-normal"> ({serviceAbbreviation(item.service)})</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="min-w-5 text-center font-bold text-emerald-600">
                        {item.quantity}{item.unit === "sqft" ? " sft" : item.unit === "pair" ? " pr" : item.unit === "kg" ? " kg" : ""}
                      </span>
                      <span className="w-14 text-right text-slate-500">{money(item.unitPrice)}</span>
                      <span className="w-16 text-right font-bold text-slate-900">{money(item.quantity * item.unitPrice)}</span>
                    </div>
                  </div>

                  {/* Fabklean-style inline controls row when active */}
                  {isSelected ? (
                    <div
                      className="mt-2 flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Red circular delete button */}
                      <button
                        type="button"
                        aria-label="Remove item"
                        title="Remove item"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-300 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                        onClick={() => {
                          onRemoveLine(item.id);
                          const remaining = cart.filter((l) => l.id !== item.id);
                          setActiveId(remaining.length ? remaining[remaining.length - 1].id : null);
                        }}
                      >
                        <Trash2 className="size-3" />
                      </button>

                      {/* Green circular decrement button */}
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        title="Decrease"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        onClick={() => {
                          const step = item.quantity % 1 === 0 ? 1 : 0.5;
                          const nextQty = Math.max(0.1, Number((item.quantity - step).toFixed(1)));
                          onUpdateLine(item.id, { quantity: nextQty });
                        }}
                      >
                        <Minus className="size-3 stroke-[2.5]" />
                      </button>

                      {/* Quantity input */}
                      <input
                        aria-label="Quantity"
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateLine(item.id, { quantity: Math.max(0.1, Number(e.target.value) || 1) })
                        }
                        className="h-6 w-11 shrink-0 rounded border border-slate-300 bg-white text-center text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />

                      {/* Green circular increment button */}
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        title="Increase"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        onClick={() => {
                          const step = item.quantity % 1 === 0 ? 1 : 0.5;
                          const nextQty = Number((item.quantity + step).toFixed(1));
                          onUpdateLine(item.id, { quantity: nextQty });
                        }}
                      >
                        <Plus className="size-3 stroke-[2.5]" />
                      </button>

                      {/* Unit price input */}
                      <input
                        aria-label="Unit price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          onUpdateLine(item.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })
                        }
                        className="h-6 w-16 shrink-0 rounded border border-slate-300 bg-white px-1 text-right text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />

                      {/* Line total grey box */}
                      <div className="flex h-6 min-w-[62px] flex-1 items-center justify-end rounded border border-slate-200 bg-slate-100 px-1.5 text-xs font-bold text-slate-800">
                        {money(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>

        {/* Fixed bottom totals and actions area */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-3 space-y-2">
          {notice ? (
            <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
              {notice}
            </div>
          ) : null}

          {/* Subtotal row */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Sub Total</span>
            <span className="font-semibold text-slate-800">{money(totals.subtotal)}</span>
          </div>

          {/* Compact Discount (%) row matching Fabklean reference */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[11px] font-bold text-slate-600">
                %
              </span>
              <span className="text-[11px] font-semibold text-slate-600">Discount</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={discount === 0 ? "" : discount}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    onDiscount(0);
                    return;
                  }
                  const parsed = Number(raw);
                  onDiscount(Math.max(0, Math.min(100, Number.isFinite(parsed) ? parsed : 0)));
                }}
                placeholder="0"
                className="h-6 w-16 rounded border border-slate-300 px-1.5 text-center text-xs font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <span className={totals.discountPercent > 0 ? "font-bold text-emerald-700" : "font-medium text-slate-400"}>
              {totals.discountPercent > 0 ? `−${money(totals.discountAmount)}` : money(0)}
            </span>
          </div>

          {/* Final Total row */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Final Total</span>
            <span className="text-[17px] font-black text-slate-900">{money(totals.total)}</span>
          </div>

          {/* Action buttons */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              disabled={!cart.length}
              onClick={onSave}
              className={`${billingBtnPrimary} w-full py-2 text-xs font-bold uppercase tracking-wide shadow-xs`}
            >
              Save order
            </button>

            {/* Row: Print Bill + Garment Tags */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={!cart.length}
                onClick={onPrint}
                className={`${billingBtnPrimary} py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 shadow-xs`}
              >
                Print bill
              </button>
              <button
                type="button"
                disabled={!cart.length}
                onClick={() => setShowTags(true)}
                className="inline-flex items-center justify-center gap-1 rounded border border-slate-300 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <Tag className="size-3" />
                Garment Tags
              </button>
            </div>

            {/* Row: WhatsApp + Reset */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={!cart.length || !customer.mobile}
                onClick={handleWhatsApp}
                title={!customer.mobile ? "Add customer mobile to share via WhatsApp" : "Open WhatsApp with bill"}
                className="inline-flex items-center justify-center gap-1 rounded border border-emerald-300 bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40"
              >
                <MessageSquare className="size-3" />
                WhatsApp
              </button>
              <button
                type="button"
                disabled={!cart.length}
                onClick={onReset}
                className={`${billingBtnGhost} py-1 text-xs`}
              >
                Reset cart
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Garment Tags Modal */}
      {showTags ? (
        <GarmentTagsModal
          orderNumber={orderNumber || "DRAFT"}
          customer={customer}
          items={cart}
          createdAt={createdAt || new Date().toISOString()}
          onClose={() => setShowTags(false)}
        />
      ) : null}
    </>
  );
}
