"use client";

import { useState } from "react";
import { GarmentIllustration } from "@/components/billing/garment-illustration";
import { money } from "@/lib/billing/calculations";
import { fieldClass } from "@/lib/billing/styles";

interface LaundryServiceCardProps {
  title: string;
  illustration: "wash-fold" | "wash-iron";
  description: string;
  defaultKgRate: number;
  defaultItemRate: number;
  onAdd: (data: { name: string; quantity: number; unitPrice: number; basis: "kg" | "item" }) => void;
}

function LaundryServiceCard({
  title,
  illustration,
  description,
  defaultKgRate,
  defaultItemRate,
  onAdd,
}: LaundryServiceCardProps) {
  const [basis, setBasis] = useState<"kg" | "item">("kg");
  const [weightKg, setWeightKg] = useState("3.0");
  const [kgRate, setKgRate] = useState(String(defaultKgRate));
  const [itemQty, setItemQty] = useState("5");
  const [itemRate, setItemRate] = useState(String(defaultItemRate));

  const isKg = basis === "kg";
  const currentQuantity = isKg ? Math.max(0.1, Number(weightKg) || 1) : Math.max(1, Number(itemQty) || 1);
  const currentRate = isKg ? Math.max(0, Number(kgRate) || 0) : Math.max(0, Number(itemRate) || 0);
  const lineTotal = currentQuantity * currentRate;

  function handleAdd() {
    const formattedName = isKg
      ? `${title} (${currentQuantity} kg)`
      : `${title}`;
    onAdd({
      name: formattedName,
      quantity: currentQuantity,
      unitPrice: currentRate,
      basis,
    });
  }

  return (
    <article className="flex flex-col justify-between overflow-hidden rounded-md border border-[#dce2e8] bg-white p-3.5 shadow-xs transition-all hover:border-slate-400">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-[#d8fbfa] text-slate-700">
            <GarmentIllustration name={illustration} className="h-10 w-10" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>

        {/* Pricing Basis Selector */}
        <div className="mt-3">
          <label className="text-[11px] font-semibold text-slate-600">Pricing Basis</label>
          <div className="mt-1 grid grid-cols-2 gap-1 rounded bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setBasis("kg")}
              className={`rounded py-1.5 font-medium transition-colors ${
                isKg
                  ? "bg-white font-bold text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              By Weight (₹/kg)
            </button>
            <button
              type="button"
              onClick={() => setBasis("item")}
              className={`rounded py-1.5 font-medium transition-colors ${
                !isKg
                  ? "bg-white font-bold text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              By Piece (₹/item)
            </button>
          </div>
        </div>

        {/* Inputs based on selected basis */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {isKg ? (
            <>
              <label className="text-[11px] text-slate-600">
                Weight (kg)
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className={fieldClass("mt-1 h-8 text-center")}
                />
              </label>
              <label className="text-[11px] text-slate-600">
                Rate (₹ per kg)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={kgRate}
                  onChange={(e) => setKgRate(e.target.value)}
                  className={fieldClass("mt-1 h-8 text-right")}
                />
              </label>
            </>
          ) : (
            <>
              <label className="text-[11px] text-slate-600">
                Quantity (pcs)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  className={fieldClass("mt-1 h-8 text-center")}
                />
              </label>
              <label className="text-[11px] text-slate-600">
                Rate (₹ per pc)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={itemRate}
                  onChange={(e) => setItemRate(e.target.value)}
                  className={fieldClass("mt-1 h-8 text-right")}
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Footer with subtotal preview and Add to Bill */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <div className="text-[11px] text-slate-500">Calculated Line Total</div>
          <div className="text-sm font-bold text-slate-900">{money(lineTotal)}</div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-8 items-center justify-center rounded bg-green-600 px-4 text-xs font-bold text-white shadow-xs transition-colors hover:bg-green-700 active:scale-95"
        >
          + Add to Bill
        </button>
      </div>
    </article>
  );
}

export function LaundryCards({
  onAddLaundry,
}: {
  onAddLaundry: (data: { name: string; quantity: number; unitPrice: number; basis: "kg" | "item" }) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      <LaundryServiceCard
        title="Wash & Fold"
        illustration="wash-fold"
        description="Everyday washing, tumble drying, and neat folding."
        defaultKgRate={80}
        defaultItemRate={25}
        onAdd={onAddLaundry}
      />
      <LaundryServiceCard
        title="Wash & Iron"
        illustration="wash-iron"
        description="Complete washing, drying, and crisp steam ironing."
        defaultKgRate={120}
        defaultItemRate={35}
        onAdd={onAddLaundry}
      />
    </div>
  );
}
