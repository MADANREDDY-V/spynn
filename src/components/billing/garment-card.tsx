"use client";

import { GarmentIllustration } from "@/components/billing/garment-illustration";
import { money } from "@/lib/billing/calculations";
import { fieldClass } from "@/lib/billing/styles";
import type { Garment, Service } from "@/lib/billing/types";

export function GarmentCard({
  garment,
  service,
  quantityOnBill,
  onAdd,
  onDecrement,
  onPriceChange,
}: {
  garment: Garment;
  service: Service;
  quantityOnBill: number;
  onAdd: () => void;
  onDecrement?: () => void;
  onPriceChange: (price: number) => void;
}) {
  const price = garment.price ?? garment.prices?.[service] ?? 0;
  const unitSuffix = garment.unit === "sqft" ? "/sft" : garment.unit === "pair" ? "/pair" : garment.unit === "kg" ? "/kg" : "";
  const plusSuffix = garment.startingPriceIndicator ? "+" : "";

  return (
    <article
      onClick={onAdd}
      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-sm border border-[#dce2e8] bg-white transition-all hover:border-green-600 hover:shadow-xs"
    >
      {/* Pale-teal garment illustration panel matching Fabklean reference */}
      <div className="relative flex h-[100px] w-full flex-col items-center justify-between bg-[#c8f2e7] p-1.5 transition-colors group-hover:bg-[#bcf0e3]">
        <div className="flex flex-1 items-center justify-center">
          <GarmentIllustration name={garment.illustration} className="h-16 w-16" />
        </div>

        {/* Bottom bar inside teal area matching Image 1 */}
        <div className="flex w-full items-center justify-between">
          {/* Quantity in cart (defaults to 0) */}
          <span className="flex h-5 min-w-[28px] items-center justify-center bg-white px-1.5 text-xs font-bold text-slate-800 shadow-2xs">
            {quantityOnBill}
          </span>

          {/* Decrement button */}
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantityOnBill <= 0}
            onClick={(e) => {
              e.stopPropagation();
              onDecrement?.();
            }}
            className="flex h-5 w-6 items-center justify-center bg-[#b1e8dc] text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
          >
            −
          </button>
        </div>
      </div>

      {/* Item info & pricing */}
      <div className="flex flex-1 flex-col justify-between p-2">
        <div className="text-center">
          <div className="text-[13px] font-black text-slate-900">
            {money(price)}{plusSuffix}{unitSuffix}
          </div>
          <div className="line-clamp-2 text-[12px] font-semibold text-slate-800" title={garment.name}>
            {garment.name}
          </div>
          {garment.variant ? (
            <div className="text-[11px] font-medium text-emerald-700 truncate" title={garment.variant}>
              {garment.variant}
            </div>
          ) : null}
        </div>

        {/* Quick editable default price & Add button */}
        <div
          className="mt-2 flex items-center justify-between gap-1 border-t border-slate-100 pt-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="shrink-0">Rate ₹</span>
            <input
              aria-label={`${garment.name} ${service} default price`}
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => onPriceChange(Math.max(0, Number(e.target.value) || 0))}
              className={fieldClass("h-6 w-14 px-1 text-right text-xs")}
            />
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            title={`Add ${garment.name} to bill`}
            className="flex h-6 items-center justify-center rounded bg-green-700 px-2 text-[11px] font-bold text-white shadow-2xs transition-colors hover:bg-green-800 active:scale-95"
          >
            + Add
          </button>
        </div>
      </div>
    </article>
  );
}
