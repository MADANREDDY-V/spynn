"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useBillingStore } from "@/components/billing/billing-store";
import { Receipt } from "@/components/billing/receipt";
import { WhatsAppShare } from "@/components/billing/whatsapp-share";
import { money, orderTotals, serviceAbbreviation } from "@/lib/billing/calculations";
import { billingBtnGhost, billingBtnPrimary, fieldClass } from "@/lib/billing/styles";
import { ArrowLeft, Edit2, Plus, Printer, X } from "lucide-react";
import type { Order } from "@/lib/billing/types";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = typeof params.id === "string" ? params.id : "";
  const { customers, orders, saveCustomer } = useBillingStore();

  const customer = customers.find((c) => c.id === customerId);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(customer?.name || "");
  const [mobile, setMobile] = useState(customer?.mobile || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Customer orders calculated directly from saved orders
  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return orders.filter(
      (order) => order.customerId === customer.id || order.customer.mobile === customer.mobile
    );
  }, [customer, orders]);

  // Customer metrics calculated directly from saved orders
  const stats = useMemo(() => {
    return customerOrders.reduce(
      (acc, order) => {
        const t = orderTotals(order);
        acc.totalOrders += 1;
        acc.totalBilled += t.total;
        acc.totalPaid += t.amountPaid;
        acc.totalBalance += t.balance;
        return acc;
      },
      { totalOrders: 0, totalBilled: 0, totalPaid: 0, totalBalance: 0 }
    );
  }, [customerOrders]);

  if (!customer) {
    return (
      <div className="p-6">
        <Link href="/billing/customers" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline">
          <ArrowLeft className="size-4" /> Back to Customers
        </Link>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          Customer not found or has been removed.
        </div>
      </div>
    );
  }

  function handleSaveCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;
    saveCustomer({
      id: customer?.id,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
    });
    setIsEditing(false);
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Top Bar with Back Link & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/billing/customers"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Customers
        </Link>
        <button
          type="button"
          onClick={() => router.push(`/billing?customer=${customer.id}`)}
          className={`${billingBtnPrimary} gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wide`}
        >
          <Plus className="size-4" /> New Order for This Customer
        </button>
      </div>

      {/* Customer Header Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs">
        {!isEditing ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{customer.name}</h1>
                <button
                  type="button"
                  onClick={() => {
                    setName(customer.name);
                    setMobile(customer.mobile);
                    setAddress(customer.address);
                    setIsEditing(true);
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="Edit customer details"
                >
                  <Edit2 className="size-4" />
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                <div>Mobile: <span className="font-bold text-slate-900">{customer.mobile}</span></div>
                <div>Address: <span className="font-semibold text-slate-800">{customer.address || "—"}</span></div>
                <div className="text-slate-400">Created: {new Date(customer.createdAt).toLocaleDateString("en-IN")}</div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveCustomer} className="space-y-3">
            <div className="text-sm font-bold text-slate-900">Edit Customer Information</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass("mt-1")}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={fieldClass("mt-1")}
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Full Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={fieldClass("mt-1 h-auto py-1.5")}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className={`${billingBtnPrimary} text-xs font-bold px-4 py-1.5`}>
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`${billingBtnGhost} text-xs px-3 py-1.5`}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* 4 Key Performance Metric Cards */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div className="rounded border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Total Orders</div>
            <div className="mt-0.5 text-lg font-black text-slate-900">{stats.totalOrders}</div>
          </div>
          <div className="rounded border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Total Billed</div>
            <div className="mt-0.5 text-lg font-black text-slate-900">{money(stats.totalBilled)}</div>
          </div>
          <div className="rounded border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Total Collected</div>
            <div className="mt-0.5 text-lg font-black text-emerald-700">{money(stats.totalPaid)}</div>
          </div>
          <div className="rounded border border-slate-100 bg-slate-50/70 p-3">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Outstanding Balance</div>
            <div className={`mt-0.5 text-lg font-black ${stats.totalBalance > 0 ? "text-red-600" : "text-slate-800"}`}>
              {money(stats.totalBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Complete Order History Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Order History</h2>
            <div className="text-xs text-slate-500">Complete historical records for {customer.name}</div>
          </div>
          <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
            {customerOrders.length} {customerOrders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        {customerOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No orders found for this customer. Click &quot;New Order for This Customer&quot; to begin billing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/70 font-semibold text-slate-600">
                <tr>
                  <th className="px-3 py-2.5">Order #</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Products / Variants</th>
                  <th className="px-3 py-2.5 text-center">Lines</th>
                  <th className="px-3 py-2.5 text-center">Qty</th>
                  <th className="px-3 py-2.5">Services</th>
                  <th className="px-3 py-2.5 text-right">Bill Total</th>
                  <th className="px-3 py-2.5 text-right">Paid</th>
                  <th className="px-3 py-2.5 text-right">Balance</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-center">Payment</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerOrders.map((order) => {
                  const totals = orderTotals(order);
                  const distinctServices = Array.from(new Set(order.items.map((i) => i.service)));
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-slate-900">{order.orderNumber}</td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2.5 max-w-[200px] truncate text-slate-800" title={order.items.map(i => `${i.garmentName}${i.variant ? ` (${i.variant})` : ''}`).join(', ')}>
                        {order.items.map((i) => `${i.garmentName}${i.variant ? ` (${i.variant})` : ""}`).join(", ")}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium text-slate-700">{order.items.length}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-emerald-600">{totals.itemCount}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {distinctServices.map((svc) => (
                            <span key={svc} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {serviceAbbreviation(svc)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-black text-slate-900">{money(totals.total)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">{money(totals.amountPaid)}</td>
                      <td className="px-3 py-2.5 text-right font-bold">
                        <span className={totals.balance > 0 ? "text-red-600" : "text-slate-500"}>
                          {money(totals.balance)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`rounded px-2 py-0.5 text-[11px] font-bold capitalize ${
                          totals.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-800"
                            : totals.paymentStatus === "partial"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {totals.paymentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-lg bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Order {selectedOrder.orderNumber}</h3>
                <div className="text-xs text-slate-500">
                  {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Bill Line Items</div>
                <div className="mt-2 divide-y divide-slate-100 border border-slate-200 rounded">
                  {selectedOrder.items.map((line) => (
                    <div key={line.id} className="flex items-center justify-between p-2.5">
                      <div>
                        <div className="font-semibold text-slate-900">{line.garmentName}</div>
                        {line.variant ? (
                          <div className="text-[11px] text-emerald-700 font-medium">Variant: {line.variant}</div>
                        ) : null}
                        <div className="text-[10px] text-slate-500">
                          Service: {line.service} · {line.quantity} {line.unit || "item"} @ {money(line.unitPrice)}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900">
                        {money(line.quantity * line.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              {(() => {
                const t = orderTotals(selectedOrder);
                return (
                  <div className="rounded border border-slate-100 bg-slate-50 p-3 space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">{money(t.subtotal)}</span>
                    </div>
                    {t.discountPercent > 0 ? (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Discount ({t.discountPercent}%)</span>
                        <span>−{money(t.discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900 text-sm">
                      <span>Final Total</span>
                      <span>{money(t.total)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Amount Paid ({selectedOrder.paymentMethod || "Direct"})</span>
                      <span className="font-semibold">{money(t.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Balance Due</span>
                      <span className={t.balance > 0 ? "text-red-600" : "text-slate-900"}>{money(t.balance)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* WhatsApp & PDF Sharing */}
              <div className="pt-1">
                <WhatsAppShare
                  disabled={false}
                  orderNumber={selectedOrder.orderNumber}
                  createdAt={selectedOrder.createdAt}
                  customer={selectedOrder.customer}
                  items={selectedOrder.items}
                  notes={selectedOrder.notes || ""}
                  discount={selectedOrder.discountPercent ?? orderTotals(selectedOrder).discountPercent}
                  amountPaid={selectedOrder.amountPaid}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-3 bg-slate-50">
              <button
                type="button"
                onClick={() => window.print()}
                className={`${billingBtnPrimary} gap-1.5 text-xs py-1.5`}
              >
                <Printer className="size-3.5" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className={`${billingBtnGhost} text-xs py-1.5`}
              >
                Close
              </button>
            </div>

            {/* Hidden Print Receipt */}
            <Receipt
              orderNumber={selectedOrder.orderNumber}
              createdAt={selectedOrder.createdAt}
              customer={selectedOrder.customer}
              items={selectedOrder.items}
              notes={selectedOrder.notes}
              discount={selectedOrder.discountPercent ?? orderTotals(selectedOrder).discountPercent}
              amountPaid={selectedOrder.amountPaid}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
