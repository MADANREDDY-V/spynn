"use client";

import { useMemo, useState } from "react";
import { billingBtnGhost, billingBtnPrimary, fieldClass } from "@/lib/billing/styles";
import type { Customer } from "@/lib/billing/types";

type Draft = {
  name: string;
  mobile: string;
  address: string;
};

export function CustomerPicker({
  customers,
  selectedId,
  selected,
  onSelect,
  onSave,
}: {
  customers: Customer[];
  selectedId: string | null;
  selected: Draft;
  onSelect: (customer: Customer | null) => void;
  onSave: (draft: Draft & { id?: string }) => Customer;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "form">("search");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(selected);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter((customer) =>
        [customer.name, customer.mobile, customer.address].some((value) =>
          value.toLowerCase().includes(q),
        ),
      )
      .slice(0, 8);
  }, [customers, query]);

  function startCreate() {
    setMode("form");
    setEditingId(null);
    setDraft({ name: "", mobile: "", address: "" });
  }

  function startEdit() {
    setMode("form");
    setEditingId(selectedId);
    setDraft(selected);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.mobile.trim()) return;
    const saved = onSave({
      id: editingId ?? undefined,
      name: draft.name.trim(),
      mobile: draft.mobile.trim(),
      address: draft.address.trim(),
    });
    onSelect(saved);
    setOpen(false);
    setMode("search");
  }

  return (
    <div className="border-b border-slate-200 px-3 py-2.5">
      {!open ? (
        <div className="flex w-full items-center justify-between gap-2">
          <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-medium">
              {selected.name || "Select customer"}
            </span>
            {selected.mobile ? (
              <span className="block truncate text-xs text-slate-500">{selected.mobile}</span>
            ) : null}
          </button>
          <button
            type="button"
            className={billingBtnPrimary}
            onClick={() => {
              setOpen(true);
              if (selected.name) startEdit();
              else startCreate();
            }}
          >
            {selected.name ? "Edit" : "+ Add New"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Customer</div>
            <button type="button" className="text-xs font-semibold text-sky-700" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
          {mode === "search" ? (
            <>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or mobile"
                className={fieldClass()}
              />
              <div className="max-h-36 overflow-y-auto rounded border border-slate-200 bg-slate-50">
                {matches.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-slate-500">No customers match.</p>
                ) : (
                  matches.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        onSelect(customer);
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex w-full flex-col items-start border-b border-slate-200 px-2 py-1.5 text-left last:border-0 hover:bg-white"
                    >
                      <span className="text-sm font-medium">{customer.name}</span>
                      <span className="text-xs text-slate-500">{customer.mobile}</span>
                    </button>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" className={billingBtnGhost} onClick={() => onSelect(null)}>
                  Walk-in
                </button>
                <button type="button" className={billingBtnPrimary} onClick={startCreate}>
                  + New customer
                </button>
                {selectedId ? (
                  <button type="button" className={billingBtnGhost} onClick={startEdit}>
                    Edit
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-2">
              <input
                required
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Customer name"
                className={fieldClass()}
              />
              <input
                required
                value={draft.mobile}
                onChange={(e) => setDraft((d) => ({ ...d, mobile: e.target.value }))}
                placeholder="Mobile number"
                inputMode="tel"
                className={fieldClass()}
              />
              <textarea
                value={draft.address}
                onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                placeholder="Address"
                rows={2}
                className={fieldClass("h-auto py-1.5")}
              />
              <div className="flex gap-2">
                <button type="submit" className={billingBtnPrimary}>Save customer</button>
                <button type="button" className={billingBtnGhost} onClick={() => setMode("search")}>
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
