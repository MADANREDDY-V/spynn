"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useBillingStore } from "@/components/billing/billing-store";
import { money, orderTotals } from "@/lib/billing/calculations";
import { billingBtnGhost, billingBtnPrimary, fieldClass } from "@/lib/billing/styles";
import { ArrowUpRight } from "lucide-react";
import type { Customer } from "@/lib/billing/types";

const EMPTY = { name: "", mobile: "", address: "" };

export default function CustomersPage() {
  const { customers, orders, saveCustomer } = useBillingStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [savedNote, setSavedNote] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((customer) =>
      !q || [customer.name, customer.mobile, customer.address].some((value) => value.toLowerCase().includes(q)),
    );
  }, [customers, query]);

  const history = useMemo(() => {
    if (!editing) return [];
    return orders.filter((order) => order.customerId === editing.id || order.customer.mobile === editing.mobile);
  }, [editing, orders]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.mobile.trim()) return;
    const saved = saveCustomer({
      id: editing?.id,
      name: draft.name.trim(),
      mobile: draft.mobile.trim(),
      address: draft.address.trim(),
    });
    setEditing(saved);
    setSavedNote(`${saved.name} saved.`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="h-full min-h-0 overflow-y-auto p-3 md:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Customers</h1>
            <p className="text-xs text-slate-500">Manage client directory, billing histories, and account details.</p>
          </div>
          <button
            type="button"
            className={`${billingBtnPrimary} text-xs font-bold`}
            onClick={() => {
              setEditing(null);
              setDraft(EMPTY);
              setSavedNote("");
            }}
          >
            + New customer
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, mobile, address"
          className={`${fieldClass()} mt-3`}
        />
        <div className="mt-3 overflow-hidden border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Name / Address</th>
                <th className="px-3 py-2.5">Mobile</th>
                <th className="px-3 py-2.5 text-center">Orders</th>
                <th className="px-3 py-2.5 text-right">Total Billed</th>
                <th className="px-3 py-2.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((customer) => {
                const customerOrders = orders.filter(
                  (order) => order.customerId === customer.id || order.customer.mobile === customer.mobile
                );
                const count = customerOrders.length;
                const totalBilled = customerOrders.reduce((sum, o) => sum + orderTotals(o).total, 0);
                const isSelected = editing?.id === customer.id;

                return (
                  <tr
                    key={customer.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-amber-50/70" : "hover:bg-slate-50/80"
                    }`}
                    onClick={() => {
                      setEditing(customer);
                      setDraft({ name: customer.name, mobile: customer.mobile, address: customer.address });
                      setSavedNote("");
                    }}
                  >
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900">{customer.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{customer.address || "—"}</div>
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-slate-700">{customer.mobile}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold text-emerald-600">{count}</td>
                    <td className="px-3 py-2 text-right text-xs font-black text-slate-900">{money(totalBilled)}</td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/billing/customers/${customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline"
                        title="View complete customer profile & order history"
                      >
                        Details <ArrowUpRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right-side Customer Editor Panel */}
      <aside className="h-full min-h-0 overflow-y-auto border-t border-slate-200 bg-white p-4 lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900">{editing ? "Edit customer" : "Create customer"}</h2>
          {editing ? (
            <Link
              href={`/billing/customers/${editing.id}`}
              className="text-[11px] font-bold text-sky-700 hover:underline inline-flex items-center gap-0.5"
            >
              Full Profile <ArrowUpRight className="size-3" />
            </Link>
          ) : null}
        </div>

        <form onSubmit={submit} className="mt-3 space-y-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-600">Customer Name</label>
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
              placeholder="Full Name"
              className={fieldClass("mt-0.5")}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600">Mobile Number</label>
            <input
              required
              value={draft.mobile}
              onChange={(e) => setDraft((current) => ({ ...current, mobile: e.target.value }))}
              placeholder="Mobile number"
              inputMode="tel"
              className={fieldClass("mt-0.5")}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600">Delivery Address</label>
            <textarea
              value={draft.address}
              onChange={(e) => setDraft((current) => ({ ...current, address: e.target.value }))}
              placeholder="Complete address (community, tower, flat etc.)"
              rows={3}
              className={fieldClass("mt-0.5 h-auto py-1.5")}
            />
          </div>
          <button type="submit" className={`${billingBtnPrimary} w-full text-xs font-bold py-2`}>
            Save customer
          </button>
          {editing ? (
            <Link
              href={`/billing?customer=${editing.id}`}
              className={`${billingBtnGhost} w-full text-xs font-bold text-center block`}
            >
              New order for this customer
            </Link>
          ) : null}
          {savedNote ? <p className="text-xs font-medium text-green-700">{savedNote}</p> : null}
        </form>

        {editing ? (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">Recent Orders</h3>
              <Link
                href={`/billing/customers/${editing.id}`}
                className="text-[11px] font-bold text-sky-700 hover:underline"
              >
                View all ({history.length})
              </Link>
            </div>
            {history.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">No orders yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {history.slice(0, 5).map((order) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between gap-2 border border-slate-200 rounded p-2 text-xs bg-slate-50/50"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{order.orderNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.orderStatus} · {money(orderTotals(order).total)}
                      </div>
                    </div>
                    <Link
                      href={`/billing?order=${order.id}`}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-sky-700 hover:bg-slate-50"
                    >
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
