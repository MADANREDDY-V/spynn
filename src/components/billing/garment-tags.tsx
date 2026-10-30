"use client";

import { useRef } from "react";
import { Printer, X, Tag } from "lucide-react";
import { serviceAbbreviation } from "@/lib/billing/calculations";
import type { CartLine, CustomerSnapshot } from "@/lib/billing/types";

// ─── Garment Tag Data ─────────────────────────────────────────────────────────

type GarmentTag = {
  key: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  serviceAbbr: string;
  garmentName: string;
  variant?: string;
  pieceIndex: number; // 1-based
  totalPieces: number;
  isLaundry: boolean;
  laundryWeight?: number;
  laundryUnit?: string;
  date: string;
};

function buildTags(
  orderNumber: string,
  customer: CustomerSnapshot,
  items: CartLine[],
  createdAt: string
): GarmentTag[] {
  const date = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    weekday: "short",
  });

  const tags: GarmentTag[] = [];

  items.forEach((item) => {
    const isLaundry = item.service === "Laundry";
    const abbr = serviceAbbreviation(item.service);

    if (isLaundry) {
      // For laundry, generate one tag per line (not per piece)
      tags.push({
        key: `${item.id}-laundry`,
        orderNumber,
        customerName: customer.name || "Walk-in Customer",
        customerMobile: customer.mobile || "",
        serviceAbbr: abbr,
        garmentName: item.garmentName,
        variant: item.variant,
        pieceIndex: 1,
        totalPieces: 1,
        isLaundry: true,
        laundryWeight: item.quantity,
        laundryUnit: item.unit === "kg" ? "kg" : "pcs",
        date,
      });
    } else {
      // For regular garments, generate one tag per piece
      const qty = Math.max(1, Math.round(item.quantity));
      for (let i = 1; i <= qty; i++) {
        tags.push({
          key: `${item.id}-${i}`,
          orderNumber,
          customerName: customer.name || "Walk-in Customer",
          customerMobile: customer.mobile || "",
          serviceAbbr: abbr,
          garmentName: item.garmentName,
          variant: item.variant,
          pieceIndex: i,
          totalPieces: qty,
          isLaundry: false,
          date,
        });
      }
    }
  });

  return tags;
}

// ─── Individual Tag Layout ─────────────────────────────────────────────────────

function TagCard({ tag }: { tag: GarmentTag }) {
  return (
    <div className="garment-tag-card mx-auto w-[220px] break-inside-avoid border border-dashed border-slate-400 bg-white p-3 text-center font-mono text-[11px] leading-tight text-slate-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/spynn-logo.png"
        alt="SPYNN STUDIO"
        className="mx-auto h-7 w-7 object-contain mb-1"
      />
      <div className="text-[10px] font-bold tracking-widest text-slate-500">SPYNN STUDIO</div>
      <div className="mt-0.5 text-[13px] font-black tracking-wide">{tag.orderNumber}</div>
      <div className="mt-0.5 font-semibold">{tag.customerName}</div>
      {tag.customerMobile ? (
        <div className="text-[10px] text-slate-500">{tag.customerMobile}</div>
      ) : null}
      <div className="mt-1 text-[10px] text-slate-500">
        {tag.serviceAbbr} &nbsp;|&nbsp; {tag.date}
      </div>
      <div className="mt-1.5 border-t border-dashed border-slate-300 pt-1.5 font-bold">
        {tag.garmentName}
        {tag.variant ? <span className="ml-1 font-normal text-[10px]">({tag.variant})</span> : null}
      </div>
      {tag.isLaundry ? (
        <div className="mt-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold">
          {tag.laundryWeight} {tag.laundryUnit}
        </div>
      ) : (
        <div className="mt-1 text-[13px] font-black text-slate-700">
          {tag.pieceIndex}/{tag.totalPieces}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GarmentTagsModal({
  orderNumber,
  customer,
  items,
  createdAt,
  onClose,
}: {
  orderNumber: string;
  customer: CustomerSnapshot;
  items: CartLine[];
  createdAt: string;
  onClose: () => void;
}) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const tags = buildTags(orderNumber || "DRAFT", customer, items, createdAt);

  function handlePrint() {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    const win = window.open("", "_blank", "width=700,height=900");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Garment Tags - ${orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      line-height: 1.4;
      background: #fff;
      color: #111;
      padding: 8px;
    }
    .tags-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .garment-tag-card {
      width: 200px;
      border: 1px dashed #888;
      padding: 10px;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .garment-tag-card img {
      height: 24px;
      width: 24px;
      object-fit: contain;
      margin: 0 auto 3px;
      display: block;
    }
    @media print {
      body { padding: 4px; }
      @page { margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="tags-grid">${printContent}</div>
</body>
</html>`);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Tag className="size-5 text-emerald-700" />
            <div>
              <div className="text-sm font-bold text-slate-900">Garment Tags</div>
              <div className="text-xs text-slate-500">
                {tags.length} tag{tags.length !== 1 ? "s" : ""} · {items.length} line item{items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex h-8 items-center gap-1.5 rounded bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              <Printer className="size-3.5" />
              Print Tags
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100"
            >
              <X className="size-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          Preview below. One tag is generated per garment piece. Weight-based laundry items get one tag with weight info.
        </div>

        {/* Tag preview area */}
        <div className="flex-1 overflow-y-auto bg-[#f0f0f0] p-4">
          {tags.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No items in the bill. Add garments to generate tags.
            </div>
          ) : (
            <div ref={printAreaRef} className="flex flex-wrap gap-4 justify-center">
              {tags.map((tag) => (
                <TagCard key={tag.key} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
