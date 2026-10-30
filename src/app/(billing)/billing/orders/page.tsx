"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBillingStore } from "@/components/billing/billing-store";
import { Receipt } from "@/components/billing/receipt";
import { WhatsAppShare } from "@/components/billing/whatsapp-share";
import { GarmentTagsModal } from "@/components/billing/garment-tags";
import { money, orderTotals, serviceAbbreviation } from "@/lib/billing/calculations";
import { billingBtnGhost, billingBtnPrimary, fieldClass } from "@/lib/billing/styles";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/billing/types";
import { ArrowUpRight, RotateCcw, Tag } from "lucide-react";

function OrdersContent() {
  const searchParams = useSearchParams();
  const { orders, updateOrderStatus, recordPayment } = useBillingStore();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [payFilter, setPayFilter] = useState<PaymentStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setQuery(q);
    }
  }, [searchParams]);

  // Payment Recording State
  const [paidDraft, setPaidDraft] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("Cash");
  const [cashSplit, setCashSplit] = useState("");
  const [onlineSplit, setOnlineSplit] = useState("");

  const selected = orders.find((order) => order.id === selectedId) ?? null;

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setPayFilter("all");
    setMethodFilter("all");
    setStartDate("");
    setEndDate("");
  }

  // Filtered orders responding to all filters
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    return orders.filter((order) => {
      const totals = orderTotals(order);
      const matchesQuery =
        !q ||
        [order.orderNumber, order.customer.name, order.customer.mobile, ...order.items.map((i) => i.garmentName)].some(
          (value) => value.toLowerCase().includes(q)
        );
      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
      const matchesPay = payFilter === "all" || totals.paymentStatus === payFilter;
      const matchesMethod = methodFilter === "all" || (order.paymentMethod || "Cash") === methodFilter;

      const orderTime = new Date(order.createdAt).getTime();
      const matchesStart = start === null || orderTime >= start;
      const matchesEnd = end === null || orderTime <= end;

      return matchesQuery && matchesStatus && matchesPay && matchesMethod && matchesStart && matchesEnd;
    });
  }, [orders, query, statusFilter, payFilter, methodFilter, startDate, endDate]);

  // Date-range & active-filter KPI Summary calculations
  const summary = useMemo(() => {
    return rows.reduce(
      (acc, order) => {
        const totals = orderTotals(order);
        acc.count += 1;
        acc.gross += totals.subtotal;
        acc.discounts += totals.discountAmount;
        acc.net += totals.total;
        acc.collected += totals.amountPaid;
        acc.balance += totals.balance;
        if (totals.paymentStatus === "unpaid") acc.unpaid += 1;
        if (order.orderStatus !== "Delivered") acc.open += 1;

        if (order.paymentMethod === "Cash") {
          acc.cashCollections += totals.amountPaid;
        } else if (order.paymentMethod === "Online") {
          acc.onlineCollections += totals.amountPaid;
        } else if (order.paymentMethod === "Split Payment") {
          acc.cashCollections += order.cashAmount || 0;
          acc.onlineCollections += order.onlineAmount || 0;
          acc.splitCollections += totals.amountPaid;
        } else {
          acc.cashCollections += totals.amountPaid;
        }

        return acc;
      },
      {
        count: 0,
        gross: 0,
        discounts: 0,
        net: 0,
        collected: 0,
        balance: 0,
        unpaid: 0,
        open: 0,
        cashCollections: 0,
        onlineCollections: 0,
        splitCollections: 0,
      }
    );
  }, [rows]);

  function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const totals = orderTotals(selected);
    const amount = Math.max(0, Number(paidDraft) || 0);
    if (amount > totals.total) {
      alert(`Amount paid cannot exceed total order amount (${money(totals.total)}).`);
      return;
    }

    if (payMethod === "Split Payment") {
      const c = Number(cashSplit) || 0;
      const o = Number(onlineSplit) || 0;
      if (Math.abs(c + o - amount) > 0.01) {
        alert(`Cash portion (${money(c)}) + Online portion (${money(o)}) must equal total paid (${money(amount)}).`);
        return;
      }
      recordPayment(selected.id, amount, payMethod, { cashAmount: c, onlineAmount: o });
    } else {
      recordPayment(selected.id, amount, payMethod);
    }
    setPaidDraft("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_390px]">
      <section className="h-full min-h-0 overflow-y-auto p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Orders & Payment Tracking</h1>
            <p className="text-xs text-slate-500">
              Manage order lifecycles, record customer payments, and track balances.
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="size-3" /> Clear filters
          </button>
        </div>

        {/* Dynamic Summary KPI Cards matching Image 3 */}
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="border border-slate-200 bg-white p-2.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Orders</div>
            <div className="text-base font-black text-slate-900">{summary.count}</div>
          </div>
          <div className="border border-slate-200 bg-white p-2.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Open Orders</div>
            <div className="text-base font-black text-sky-800">{summary.open}</div>
          </div>
          <div className="border border-slate-200 bg-white p-2.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Unpaid Orders</div>
            <div className="text-base font-black text-amber-700">{summary.unpaid}</div>
          </div>
          <div className="border border-slate-200 bg-white p-2.5 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Balance Due</div>
            <div className={`text-base font-black ${summary.balance > 0 ? "text-red-600" : "text-slate-900"}`}>
              {money(summary.balance)}
            </div>
          </div>
        </div>

        {/* Date-range Financial Summary Row */}
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 bg-slate-50 p-2 border border-slate-200 rounded">
          <div>
            <span className="text-slate-500">Gross Sales: </span>
            <span className="font-bold text-slate-800">{money(summary.gross)}</span>
          </div>
          <div>
            <span className="text-slate-500">Discounts: </span>
            <span className="font-bold text-emerald-700">−{money(summary.discounts)}</span>
          </div>
          <div>
            <span className="text-slate-500">Net Sales: </span>
            <span className="font-black text-slate-900">{money(summary.net)}</span>
          </div>
          <div>
            <span className="text-slate-500">Collected: </span>
            <span className="font-bold text-emerald-800">{money(summary.collected)}</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 text-xs">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, customer, mobile"
            className={fieldClass("h-8 text-xs")}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className={fieldClass("h-8 text-xs")}
          >
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={payFilter}
            onChange={(e) => setPayFilter(e.target.value as PaymentStatus | "all")}
            className={fieldClass("h-8 text-xs")}
          >
            <option value="all">All payments</option>
            {PAYMENT_STATUSES.map((p) => (
              <option key={p} value={p}>{p === "partial" ? "Partially paid" : p}</option>
            ))}
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | "all")}
            className={fieldClass("h-8 text-xs")}
          >
            <option value="all">All methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={fieldClass("h-8 text-xs")}
            title="Start date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={fieldClass("h-8 text-xs")}
            title="End date"
          />
        </div>

        {/* Orders Table matching Image 3 */}
        <div className="overflow-x-auto border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Order</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5 text-center">Items</th>
                <th className="px-3 py-2.5">Services</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3 py-2.5 text-center">Payment</th>
                <th className="px-3 py-2.5 text-center">Method</th>
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right">Balance</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No orders found matching the active filters.
                  </td>
                </tr>
              ) : (
                rows.map((order) => {
                  const totals = orderTotals(order);
                  const isSelected = selectedId === order.id;
                  const services = Array.from(new Set(order.items.map((i) => i.service)));

                  return (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setSelectedId(order.id);
                        setPaidDraft(totals.balance > 0 ? String(totals.balance) : "");
                        setPayMethod(order.paymentMethod || "Cash");
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-amber-50/80 font-medium" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="px-3 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-slate-900">{order.customer.name}</div>
                        <div className="text-[11px] text-slate-500">{order.customer.mobile}</div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-emerald-600">
                        {totals.itemCount}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {services.map((svc) => (
                            <span key={svc} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {serviceAbbreviation(svc)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          order.orderStatus === "Delivered"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : order.orderStatus === "Ready"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-sky-50 text-sky-800 border border-sky-200"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                          totals.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : totals.paymentStatus === "partial"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {totals.paymentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600">
                        {order.paymentMethod || "Cash"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-black text-slate-900 whitespace-nowrap">
                        {money(totals.total)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold whitespace-nowrap">
                        <span className={totals.balance > 0 ? "text-red-600" : "text-slate-500"}>
                          {money(totals.balance)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(order.id);
                          }}
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Side Order Details & Payment Recording Drawer */}
      <aside className="h-full min-h-0 overflow-y-auto border-t border-slate-200 bg-white p-4 lg:border-t-0 lg:border-l space-y-4">
        {selected ? (
          (() => {
            const totals = orderTotals(selected);
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selected.orderNumber}</h2>
                    <div className="text-xs text-slate-500">
                      {new Date(selected.createdAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-xs font-bold capitalize ${
                    totals.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                  }`}>
                    {totals.paymentStatus}
                  </span>
                </div>

                {/* Customer Information */}
                <div className="rounded border border-slate-100 bg-slate-50 p-2.5 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{selected.customer.name}</span>
                    {selected.customerId ? (
                      <Link
                        href={`/billing/customers/${selected.customerId}`}
                        className="text-[11px] font-bold text-sky-700 hover:underline inline-flex items-center gap-0.5"
                      >
                        Profile <ArrowUpRight className="size-3" />
                      </Link>
                    ) : null}
                  </div>
                  <div className="text-slate-600">{selected.customer.mobile}</div>
                  {selected.customer.address ? (
                    <div className="text-slate-500 text-[11px]">{selected.customer.address}</div>
                  ) : null}
                </div>

                {/* Order Items List */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Items on Bill ({selected.items.length})
                  </h3>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded max-h-48 overflow-y-auto">
                    {selected.items.map((line) => (
                      <div key={line.id} className="p-2 text-xs flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900">{line.garmentName}</div>
                          {line.variant ? (
                            <div className="text-[10px] text-emerald-700 font-medium">· {line.variant}</div>
                          ) : null}
                          <div className="text-[10px] text-slate-500">
                            {line.quantity} {line.unit || "item"} @ {money(line.unitPrice)} ({serviceAbbreviation(line.service)})
                          </div>
                        </div>
                        <div className="font-bold text-slate-800">{money(line.quantity * line.unitPrice)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals Summary */}
                <div className="rounded border border-slate-100 bg-slate-50 p-2.5 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{money(totals.subtotal)}</span>
                  </div>
                  {totals.discountPercent > 0 ? (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({totals.discountPercent}%)</span>
                      <span>−{money(totals.discountAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                    <span>Final Total</span>
                    <span>{money(totals.total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Amount Paid</span>
                    <span className="font-semibold">{money(totals.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm">
                    <span>Balance Due</span>
                    <span className={totals.balance > 0 ? "text-red-600" : "text-emerald-700"}>
                      {money(totals.balance)}
                    </span>
                  </div>
                </div>

                {/* Order Status Controller */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Update Status</label>
                  <select
                    value={selected.orderStatus}
                    onChange={(e) => updateOrderStatus(selected.id, e.target.value as OrderStatus)}
                    className={fieldClass("h-8 text-xs font-semibold")}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Recording Form */}
                <form onSubmit={handleRecordPayment} className="rounded border border-slate-200 p-3 bg-slate-50/70 space-y-2">
                  <div className="text-xs font-bold uppercase text-slate-700">Record Payment</div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Amount Received (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paidDraft}
                      onChange={(e) => setPaidDraft(e.target.value)}
                      placeholder="0.00"
                      className={fieldClass("h-8 text-xs font-bold")}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Payment Method</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                      className={fieldClass("h-8 text-xs")}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {payMethod === "Split Payment" ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Cash Amount (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={cashSplit}
                          onChange={(e) => setCashSplit(e.target.value)}
                          placeholder="0.00"
                          className={fieldClass("h-7 text-xs")}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-600">Online Amount (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={onlineSplit}
                          onChange={(e) => setOnlineSplit(e.target.value)}
                          placeholder="0.00"
                          className={fieldClass("h-7 text-xs")}
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className={`${billingBtnPrimary} w-full text-xs font-bold py-2 mt-1`}
                  >
                    Record Payment
                  </button>
                </form>

                {/* Actions & WhatsApp Sharing */}
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <Link
                      href={`/billing?order=${selected.id}`}
                      className={`${billingBtnGhost} flex-1 text-xs text-center py-1.5`}
                    >
                      Open in counter
                    </Link>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className={`${billingBtnGhost} flex-1 text-xs py-1.5`}
                    >
                      Print bill
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTags(true)}
                      className={`${billingBtnGhost} flex-1 text-xs py-1.5 inline-flex items-center justify-center gap-1`}
                    >
                      <Tag className="size-3" />
                      Tags
                    </button>
                  </div>
                  <WhatsAppShare
                    disabled={false}
                    orderNumber={selected.orderNumber}
                    createdAt={selected.createdAt}
                    customer={selected.customer}
                    items={selected.items}
                    notes={selected.notes}
                    discount={selected.discountPercent ?? totals.discountPercent}
                    amountPaid={selected.amountPaid}
                  />
                </div>

                <Receipt
                  orderNumber={selected.orderNumber}
                  createdAt={selected.createdAt}
                  customer={selected.customer}
                  items={selected.items}
                  notes={selected.notes}
                  discount={selected.discountPercent ?? totals.discountPercent}
                  amountPaid={selected.amountPaid}
                />

                {showTags ? (
                  <GarmentTagsModal
                    orderNumber={selected.orderNumber}
                    customer={selected.customer}
                    items={selected.items}
                    createdAt={selected.createdAt}
                    onClose={() => setShowTags(false)}
                  />
                ) : null}
              </div>
            );
          })()
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Select an order from the table to view details, update status, and record payments.
          </div>
        )}
      </aside>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading orders…</div>}>
      <OrdersContent />
    </Suspense>
  );
}
