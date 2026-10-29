"use client";

import { useState } from "react";
import { GarmentCard } from "@/components/billing/garment-card";
import { GarmentIllustration } from "@/components/billing/garment-illustration";
import { LaundryCards } from "@/components/billing/laundry-cards";
import { fieldClass } from "@/lib/billing/styles";
import type { CartLine, Garment, GarmentUnit, Service } from "@/lib/billing/types";

const PREFERRED_CATEGORY_ORDER = [
  "Upper Wear",
  "Bottom Wear",
  "Full Body",
  "Winter Wear",
  "Starch",
  "Kids",
  "Designer Wear",
  "Bedding & Linen",
  "Curtains & Living",
  "Household",
  "Footwear",
  "Bags",
  "Wash & Fold",
  "Wash & Iron",
  "Men",
  "Women",
];

export function GarmentGrid({
  garments,
  service,
  cart,
  onAdd,
  onDecrement,
  onPriceChange,
  onAddCustom,
}: {
  garments: Garment[];
  service: Service;
  cart: CartLine[];
  onAdd: (garment: Garment) => void;
  onDecrement?: (garment: Garment) => void;
  onPriceChange: (garment: Garment, price: number) => void;
  onAddCustom?: (name: string, quantity: number, unitPrice: number, unit?: GarmentUnit) => void;
}) {
  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [customPrice, setCustomPrice] = useState("");
  const [customUnit, setCustomUnit] = useState<GarmentUnit>("item");

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) return;
    const priceNum = Math.max(0, Number(customPrice) || 0);
    const qtyNum = Math.max(0.1, Number(customQty) || 1);
    onAddCustom?.(trimmed, qtyNum, priceNum, customUnit);
    setCustomName("");
    setCustomQty(1);
    setCustomPrice("");
    setCustomUnit("item");
  }

  // Get distinct categories in the current garments, ordered logically
  const categories = Array.from(new Set(garments.map((g) => g.category))).sort((a, b) => {
    const ia = PREFERRED_CATEGORY_ORDER.indexOf(a);
    const ib = PREFERRED_CATEGORY_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div>
      {/* If Laundry is selected, show dedicated service cards for Wash & Fold and Wash & Iron */}
      {service === "Laundry" ? (
        <section className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-900">Laundry Services</h2>
            <span className="text-xs text-slate-500">Per-kg & Per-item pricing</span>
          </div>
          <LaundryCards
            onAddLaundry={(data) => {
              onAddCustom?.(data.name, data.quantity, data.unitPrice, data.basis === "kg" ? "kg" : "item");
            }}
          />
        </section>
      ) : null}

      {categories.length === 0 && service !== "Laundry" ? (
        <div className="py-10 text-center text-sm text-slate-500">
          No garments found for <span className="font-semibold">{service}</span> matching your search.
        </div>
      ) : (
        categories.map((category) => {
          const items = garments.filter((garment) => garment.category === category);
          if (!items.length) return null;
          return (
            <section key={category} className="mt-5">
              <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1">
                <h2 className="text-[14px] font-bold text-slate-800 tracking-wide">{category}</h2>
                <span className="text-xs text-slate-400">
                  {items.length} {items.length === 1 ? "item" : "items / variants"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {items.map((garment) => (
                  <GarmentCard
                    key={garment.id}
                    garment={garment}
                    service={service}
                    quantityOnBill={cart
                      .filter((line) => line.garmentId === garment.id && line.service === service)
                      .reduce((sum, line) => sum + line.quantity, 0)}
                    onAdd={() => onAdd(garment)}
                    onDecrement={() => onDecrement?.(garment)}
                    onPriceChange={(price) => onPriceChange(garment, price)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      {/* Clearly visible Custom Garment / Custom Item card at the very bottom for every service */}
      <div className="mt-8 mb-6 rounded-lg border-2 border-dashed border-sky-400 bg-sky-50/70 p-3.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-200/80 text-sky-800">
            <GarmentIllustration name="custom-item" className="h-6 w-6 text-sky-800" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Custom Garment / Custom Item</h3>
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                {service}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Enter custom item name, quantity, unit and price to add directly to this bill
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCustomSubmit}
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1.8fr)_70px_80px_100px_auto]"
        >
          <input
            type="text"
            required
            placeholder={`Custom ${service} item name…`}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className={fieldClass("h-9 text-xs")}
          />
          <input
            type="number"
            min="0.1"
            step="any"
            placeholder="Qty"
            value={customQty}
            onChange={(e) => setCustomQty(Math.max(0.1, Number(e.target.value) || 1))}
            className={fieldClass("h-9 text-center text-xs")}
            title="Quantity"
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as GarmentUnit)}
            className={fieldClass("h-9 text-xs")}
            title="Unit"
          >
            <option value="item">Item</option>
            <option value="pair">Pair</option>
            <option value="sqft">Sq. ft</option>
            <option value="kg">Kg</option>
          </select>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-2 text-xs font-medium text-slate-400">₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className={fieldClass("h-9 pl-6 text-right text-xs")}
              title="Unit price in rupees"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded bg-sky-700 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-sky-800 transition-colors"
          >
            + Add to Bill
          </button>
        </form>
      </div>
    </div>
  );
}
