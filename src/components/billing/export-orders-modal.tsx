"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Loader2, X, Calendar, Filter, Database } from "lucide-react";
import { buildOrdersWorkbook, downloadWorkbook, formatExcelDate } from "@/lib/billing/excel-export";
import { fetchOrdersFromSupabase } from "@/lib/billing/supabase-billing";
import { isSupabaseConfigured } from "@/lib/supabase";
import { billingBtnGhost, billingBtnPrimary, fieldClass } from "@/lib/billing/styles";
import type { Order } from "@/lib/billing/types";

export type ExportScope = "filtered" | "all" | "today" | "single_date" | "date_range";

interface ExportOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredOrders: Order[];
  allOrders: Order[];
  onNotify: (type: "success" | "error" | "info", msg: string) => void;
}

export function ExportOrdersModal({
  isOpen,
  onClose,
  filteredOrders,
  allOrders,
  onNotify,
}: ExportOrdersModalProps) {
  const [scope, setScope] = useState<ExportScope>("filtered");
  const [singleDate, setSingleDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [isExporting, setIsExporting] = useState(false);
  const [fetchFromDb, setFetchFromDb] = useState(isSupabaseConfigured());

  // Filter orders according to selected scope
  const targetOrders = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    switch (scope) {
      case "filtered":
        return filteredOrders;
      case "all":
        return allOrders;
      case "today":
        return allOrders.filter((o) => {
          return o.createdAt.slice(0, 10) === todayStr;
        });
      case "single_date":
        return allOrders.filter((o) => {
          return o.createdAt.slice(0, 10) === singleDate;
        });
      case "date_range": {
        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
        return allOrders.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= start && t <= end;
        });
      }
      default:
        return allOrders;
    }
  }, [scope, filteredOrders, allOrders, singleDate, startDate, endDate]);

  if (!isOpen) return null;

  async function handleExport() {
    if (isExporting) return;
    try {
      setIsExporting(true);

      let ordersToExport = targetOrders;

      // If user enabled direct Supabase fetch and Supabase is configured
      if (fetchFromDb && isSupabaseConfigured()) {
        const dbRes = await fetchOrdersFromSupabase();
        if (dbRes.success && dbRes.orders && dbRes.orders.length > 0) {
          const remoteOrders = dbRes.orders;
          const todayStr = new Date().toISOString().slice(0, 10);

          if (scope === "all") {
            ordersToExport = remoteOrders;
          } else if (scope === "today") {
            ordersToExport = remoteOrders.filter((o) => o.createdAt.slice(0, 10) === todayStr);
          } else if (scope === "single_date") {
            ordersToExport = remoteOrders.filter((o) => o.createdAt.slice(0, 10) === singleDate);
          } else if (scope === "date_range") {
            const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
            const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
            ordersToExport = remoteOrders.filter((o) => {
              const t = new Date(o.createdAt).getTime();
              return t >= start && t <= end;
            });
          }
        }
      }

      if (ordersToExport.length === 0) {
        onNotify("info", "No orders found matching the selected export filter.");
        setIsExporting(false);
        return;
      }

      // Generate description for Excel header
      let filterDesc = "All Orders";
      let fileDateSuffix = "";
      if (scope === "filtered") {
        filterDesc = `Active Screen Filters (${ordersToExport.length} orders)`;
        fileDateSuffix = "Filtered";
      } else if (scope === "today") {
        filterDesc = `Today's Orders (${formatExcelDate(new Date().toISOString())})`;
        fileDateSuffix = formatExcelDate(new Date().toISOString());
      } else if (scope === "single_date") {
        filterDesc = `Date: ${formatExcelDate(singleDate)}`;
        fileDateSuffix = formatExcelDate(singleDate);
      } else if (scope === "date_range") {
        filterDesc = `Range: ${formatExcelDate(startDate)} to ${formatExcelDate(endDate)}`;
        fileDateSuffix = `${formatExcelDate(startDate)}_to_${formatExcelDate(endDate)}`;
      } else {
        filterDesc = `All Orders (${ordersToExport.length} total)`;
        fileDateSuffix = "All";
      }

      const workbook = await buildOrdersWorkbook(ordersToExport, {
        filterDescription: filterDesc,
      });

      const filename = `SPYNN_Orders_${fileDateSuffix || "Report"}.xlsx`;
      await downloadWorkbook(workbook, filename);

      onNotify("success", `Exported ${ordersToExport.length} orders to ${filename}`);
      onClose();
    } catch (err) {
      console.error("Excel export error:", err);
      onNotify("error", err instanceof Error ? err.message : "Failed to generate Excel file.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <FileSpreadsheet className="size-4" />
            </div>
            <div>
              <h2 id="export-dialog-title" className="text-sm font-bold text-slate-900">
                Export Orders to Excel (.xlsx)
              </h2>
              <div className="text-[11px] text-slate-500">
                Generate formatted SPYNN workbook with formulas, filters, and totals
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Export Filter
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Option 1: Current Filtered Results */}
              <label
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                  scope === "filtered"
                    ? "border-sky-600 bg-sky-50/70 text-sky-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="exportScope"
                  value="filtered"
                  checked={scope === "filtered"}
                  onChange={() => setScope("filtered")}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>Current Filtered View</span>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold shadow-2xs">
                      {filteredOrders.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Exports orders matching active search and table filters
                  </div>
                </div>
              </label>

              {/* Option 2: All Orders */}
              <label
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                  scope === "all"
                    ? "border-sky-600 bg-sky-50/70 text-sky-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="exportScope"
                  value="all"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>All Orders</span>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold shadow-2xs">
                      {allOrders.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Complete order history across all dates and statuses
                  </div>
                </div>
              </label>

              {/* Option 3: Today's Orders */}
              <label
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                  scope === "today"
                    ? "border-sky-600 bg-sky-50/70 text-sky-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="exportScope"
                  value="today"
                  checked={scope === "today"}
                  onChange={() => setScope("today")}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>Today's Orders</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Orders generated today ({formatExcelDate(new Date().toISOString())})
                  </div>
                </div>
              </label>

              {/* Option 4: Selected Date */}
              <label
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                  scope === "single_date"
                    ? "border-sky-600 bg-sky-50/70 text-sky-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="exportScope"
                  value="single_date"
                  checked={scope === "single_date"}
                  onChange={() => setScope("single_date")}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <span>Selected Date</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Orders from a specific single date
                  </div>
                </div>
              </label>

              {/* Option 5: Custom Date Range */}
              <label
                className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors sm:col-span-2 ${
                  scope === "date_range"
                    ? "border-sky-600 bg-sky-50/70 text-sky-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="exportScope"
                  value="date_range"
                  checked={scope === "date_range"}
                  onChange={() => setScope("date_range")}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <span>Custom Date Range</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Export orders within an arbitrary start and end date
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Date Pickers */}
          {scope === "single_date" && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Pick Order Date
              </label>
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className={fieldClass("h-8 text-xs bg-white")}
              />
            </div>
          )}

          {scope === "date_range" && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={fieldClass("h-8 text-xs bg-white")}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={fieldClass("h-8 text-xs bg-white")}
                />
              </div>
            </div>
          )}

          {/* Scope Preview Card */}
          <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
            <span className="text-slate-600">Orders to export:</span>
            <span className="font-bold text-slate-900">{targetOrders.length} order{targetOrders.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Database Source Indicator */}
          {isSupabaseConfigured() && (
            <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={fetchFromDb}
                onChange={(e) => setFetchFromDb(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 size-3.5"
              />
              <span className="inline-flex items-center gap-1 font-medium">
                <Database className="size-3 text-sky-600" />
                Query fresh records directly from Supabase PostgreSQL
              </span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className={`${billingBtnGhost} text-xs py-1.5 px-3`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting || targetOrders.length === 0}
            onClick={handleExport}
            className={`${billingBtnPrimary} gap-1.5 text-xs py-1.5 px-4`}
          >
            {isExporting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Generating Excel (.xlsx)…</span>
              </>
            ) : (
              <>
                <Download className="size-3.5" />
                <span>Download Excel Report ({targetOrders.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
