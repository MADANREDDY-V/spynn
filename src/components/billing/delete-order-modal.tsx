"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { money, orderTotals } from "@/lib/billing/calculations";
import { billingBtnDanger, billingBtnGhost } from "@/lib/billing/styles";
import type { Order } from "@/lib/billing/types";

interface DeleteOrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (order: Order) => Promise<void>;
}

export function DeleteOrderModal({
  order,
  isOpen,
  onClose,
  onConfirmDelete,
}: DeleteOrderModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const totals = orderTotals(order);

  async function handleDelete() {
    if (!confirmed || isDeleting) return;
    try {
      setIsDeleting(true);
      await onConfirmDelete(order);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-red-100 bg-red-50/70 px-4 py-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="size-5 shrink-0 text-red-600" />
            <h2 id="delete-dialog-title" className="text-sm font-bold tracking-tight text-red-950">
              Confirm Order Deletion
            </h2>
          </div>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            You are about to permanently delete this order from the system. This action removes all associated garment items, payment records, and receipts from both local records and the Supabase database.
          </p>

          {/* Highlighted Order Summary Card */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Order Number</span>
              <span className="font-mono text-sm font-bold text-slate-900">{order.orderNumber}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium text-slate-500">Customer Name:</span>
              <span className="font-bold text-slate-900">{order.customer.name || "Walk-in Customer"}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium text-slate-500">Mobile:</span>
              <span className="font-medium text-slate-800">{order.customer.mobile || "—"}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium text-slate-500">Garment Items:</span>
              <span className="font-semibold text-emerald-700">{totals.itemCount} items ({order.items.length} lines)</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-slate-900">
              <span className="font-bold text-slate-700">Order Amount (Total):</span>
              <span className="text-base font-black text-slate-900">{money(totals.total)}</span>
            </div>
          </div>

          {/* Double-Confirmation Safeguard Checkbox */}
          <label className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50/70 p-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={isDeleting}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 size-4 rounded border-amber-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-[11px] font-semibold text-amber-950 leading-tight">
              I understand that deleting order <strong className="font-bold">{order.orderNumber}</strong> ({money(totals.total)}) is permanent and cannot be undone.
            </span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className={`${billingBtnGhost} text-xs py-1.5 px-3`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!confirmed || isDeleting}
            onClick={handleDelete}
            className={`${billingBtnDanger} gap-1.5 text-xs py-1.5 px-3.5`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deleting Order…</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Delete Order Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
