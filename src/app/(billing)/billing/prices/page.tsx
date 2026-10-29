"use client";

import { useMemo, useState } from "react";
import { useBillingStore } from "@/components/billing/billing-store";
import { GarmentIllustration } from "@/components/billing/garment-illustration";
import { money } from "@/lib/billing/calculations";
import { billingBtnGhost, billingBtnPrimary, fieldClass } from "@/lib/billing/styles";
import {
  GARMENT_CATEGORIES,
  GARMENT_UNITS,
  ILLUSTRATION_KEYS,
  SERVICES,
  type Garment,
  type GarmentCategory,
  type GarmentUnit,
  type IllustrationKey,
  type Service,
} from "@/lib/billing/types";
import { Edit2, Plus, Search, Tag } from "lucide-react";

export default function PricesPage() {
  const { garments, upsertGarment, addGarment } = useBillingStore();
  const [service, setService] = useState<Service>("Dry Cleaning");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  // Edit / Add Item state
  const [editingGarment, setEditingGarment] = useState<Garment | null>(null);
  const [name, setName] = useState("");
  const [variant, setVariant] = useState("");
  const [category, setCategory] = useState<GarmentCategory>("Upper Wear");
  const [illustration, setIllustration] = useState<IllustrationKey>("shirt");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("100");
  const [unit, setUnit] = useState<GarmentUnit>("item");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startingPriceIndicator, setStartingPriceIndicator] = useState(false);
  const [note, setNote] = useState("");

  // Categories available in current service
  const serviceCategories = useMemo(() => {
    return Array.from(new Set(garments.filter((g) => g.service === service).map((g) => g.category)));
  }, [garments, service]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return garments.filter((garment) => {
      if (garment.service !== service) return false;
      if (categoryFilter !== "all" && garment.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        garment.name.toLowerCase().includes(q) ||
        (garment.variant && garment.variant.toLowerCase().includes(q)) ||
        garment.barcode.includes(q)
      );
    });
  }, [garments, query, service, categoryFilter]);

  function startEdit(g: Garment) {
    setEditingGarment(g);
    setName(g.name);
    setVariant(g.variant || "");
    setCategory(g.category);
    setIllustration(g.illustration);
    setBarcode(g.barcode);
    setPrice(String(g.price));
    setUnit(g.unit || "item");
    setEstimatedCost(g.estimatedCost !== undefined ? String(g.estimatedCost) : "");
    setIsActive(g.isActive ?? true);
    setStartingPriceIndicator(g.startingPriceIndicator ?? false);
    setNote("");
  }

  function startCreate() {
    setEditingGarment(null);
    setName("");
    setVariant("");
    setCategory(service === "Shoe Cleaning" ? "Footwear" : service === "Household" ? "Bedding & Linen" : "Upper Wear");
    setIllustration(service === "Shoe Cleaning" ? "sneakers" : service === "Household" ? "bedsheet" : "shirt");
    setBarcode("");
    setPrice("100");
    setUnit(service === "Shoe Cleaning" ? "pair" : "item");
    setEstimatedCost("");
    setIsActive(true);
    setStartingPriceIndicator(false);
    setNote("");
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextPrice = Number(price);
    if (!name.trim() || !Number.isFinite(nextPrice) || nextPrice < 0) return;

    const costNum = estimatedCost.trim() ? Math.max(0, Number(estimatedCost)) : undefined;

    if (editingGarment) {
      upsertGarment({
        ...editingGarment,
        name: name.trim(),
        variant: variant.trim() || undefined,
        category,
        illustration,
        barcode: barcode.trim() || editingGarment.barcode,
        price: nextPrice,
        prices: { ...editingGarment.prices, [service]: nextPrice },
        unit,
        estimatedCost: costNum,
        isActive,
        startingPriceIndicator,
      });
      setNote(`Updated ${name.trim()}${variant ? ` (${variant.trim()})` : ""} successfully.`);
    } else {
      addGarment({
        name: name.trim(),
        variant: variant.trim() || undefined,
        category,
        service,
        illustration,
        barcode: barcode.trim() || `89${Date.now().toString().slice(-6)}`,
        price: nextPrice,
        prices: {
          "Dry Cleaning": service === "Dry Cleaning" ? nextPrice : 0,
          Ironing: service === "Ironing" ? nextPrice : 0,
          "Shoe Cleaning": service === "Shoe Cleaning" ? nextPrice : 0,
          Household: service === "Household" ? nextPrice : 0,
          Laundry: service === "Laundry" ? nextPrice : 0,
        },
        unit,
        estimatedCost: costNum,
        isActive,
        startingPriceIndicator,
      });
      setNote(`Added ${name.trim()} to ${service} catalogue.`);
      startCreate();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="h-full min-h-0 overflow-y-auto p-3 md:p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Catalogue & Price Management</h1>
            <p className="text-xs text-slate-500">
              Manage authoritative rates, variants, measurement units, and optional estimated costs.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className={`${billingBtnPrimary} text-xs font-bold gap-1`}
          >
            <Plus className="size-3.5" /> Add New Item
          </button>
        </div>

        {/* Five Main Service Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
          {SERVICES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setService(item);
                setCategoryFilter("all");
              }}
              className={`shrink-0 border-b-[3px] px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                service === item
                  ? "border-green-600 text-green-800 font-bold"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Filters Bar: Search & Category */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_200px]">
          <div className="relative">
            <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by garment name, variant, or barcode…"
              className={fieldClass("h-9 pl-8 text-xs")}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={fieldClass("h-9 text-xs")}
          >
            <option value="all">All categories ({rows.length})</option>
            {serviceCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Prices Table */}
        <div className="overflow-x-auto border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 w-10">Icon</th>
                <th className="px-3 py-2.5">Garment Name & Variant</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5 text-center">Unit</th>
                <th className="px-3 py-2.5 text-right">Default Rate</th>
                <th className="px-3 py-2.5 text-right">Est. Cost</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3 py-2.5 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((garment) => {
                const isSelected = editingGarment?.id === garment.id;
                return (
                  <tr
                    key={garment.id}
                    onClick={() => startEdit(garment)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-amber-50/80 font-medium" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-[#c8f2e7]/80">
                        <GarmentIllustration name={garment.illustration} className="h-5 w-5" />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900">{garment.name}</div>
                      {garment.variant ? (
                        <div className="text-[11px] font-medium text-emerald-700">· {garment.variant}</div>
                      ) : null}
                      <div className="text-[10px] text-slate-400">Barcode: {garment.barcode}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{garment.category}</td>
                    <td className="px-3 py-2 text-center text-slate-600 uppercase font-medium">
                      {garment.unit || "item"}
                    </td>
                    <td className="px-3 py-2 text-right font-black text-slate-900">
                      {money(garment.price)}{garment.startingPriceIndicator ? "+" : ""}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {garment.estimatedCost !== undefined ? money(garment.estimatedCost) : "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        garment.isActive !== false ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {garment.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(garment);
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                        title="Edit item"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Side Item & Variant Editor Drawer */}
      <aside className="h-full min-h-0 overflow-y-auto border-t border-slate-200 bg-white p-4 lg:border-t-0 lg:border-l space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5">
            <Tag className="size-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {editingGarment ? "Edit Catalogue Item" : `Add Item to ${service}`}
            </h2>
          </div>
          {editingGarment ? (
            <button
              type="button"
              onClick={startCreate}
              className="text-xs font-semibold text-sky-700 hover:underline"
            >
              + Add New
            </button>
          ) : null}
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600">Garment / Item Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saree, Kurta, Bedsheet"
              className={fieldClass("mt-0.5 text-xs font-semibold")}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600">Price Tier / Variant Name</label>
            <input
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="e.g. Plain, Heavy, Very Heavy, Weight upto 2.5Kgs"
              className={fieldClass("mt-0.5 text-xs")}
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Leave blank if this item does not have multiple price tiers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                className={fieldClass("mt-0.5 text-xs")}
              >
                {GARMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Measurement Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as GarmentUnit)}
                className={fieldClass("mt-0.5 text-xs")}
              >
                {GARMENT_UNITS.map((u) => (
                  <option key={u} value={u}>{u === "sqft" ? "Sq. ft" : u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Default Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={fieldClass("mt-0.5 text-xs font-bold")}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Est. Cost (₹) (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="Optional"
                className={fieldClass("mt-0.5 text-xs")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Barcode</label>
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Auto-generated if empty"
                className={fieldClass("mt-0.5 text-xs")}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Illustration Icon</label>
              <select
                value={illustration}
                onChange={(e) => setIllustration(e.target.value as IllustrationKey)}
                className={fieldClass("mt-0.5 text-xs")}
              >
                {ILLUSTRATION_KEYS.map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={startingPriceIndicator}
                onChange={(e) => setStartingPriceIndicator(e.target.checked)}
                className="rounded border-slate-300"
              />
              Starting rate (&quot;+&quot;)
            </label>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300"
              />
              Active in counter
            </label>
          </div>

          <button
            type="submit"
            className={`${billingBtnPrimary} w-full text-xs font-bold py-2 mt-2`}
          >
            {editingGarment ? "Save Item Changes" : "Add to Catalogue"}
          </button>

          {note ? <p className="text-xs font-semibold text-emerald-700 mt-2">{note}</p> : null}
        </form>
      </aside>
    </div>
  );
}
