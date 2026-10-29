"use client";

import { useMemo, useState } from "react";
import { useBillingStore } from "@/components/billing/billing-store";
import { money, orderTotals } from "@/lib/billing/calculations";
import { fieldClass } from "@/lib/billing/styles";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SERVICES,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
  type Service,
} from "@/lib/billing/types";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Package,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

type DateRangePreset = "today" | "7days" | "30days" | "thisMonth" | "custom";

export default function AnalyticsDashboardPage() {
  const { orders } = useBillingStore();

  const [preset, setPreset] = useState<DateRangePreset>("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Dimension filters
  const [serviceFilter, setServiceFilter] = useState<Service | "all">("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [payFilter, setPayFilter] = useState<PaymentStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");

  // Determine active date timestamps based on preset or custom range
  const { startMs, endMs } = useMemo(() => {
    const now = new Date();
    if (preset === "today") {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
      return { startMs: s, endMs: e };
    }
    if (preset === "7days") {
      const s = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
      return { startMs: s, endMs: now.getTime() };
    }
    if (preset === "30days") {
      const s = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
      return { startMs: s, endMs: now.getTime() };
    }
    if (preset === "thisMonth") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return { startMs: s, endMs: now.getTime() };
    }
    // Custom
    const s = customStart ? new Date(customStart).setHours(0, 0, 0, 0) : 0;
    const e = customEnd ? new Date(customEnd).setHours(23, 59, 59, 999) : Infinity;
    return { startMs: s, endMs: e };
  }, [preset, customStart, customEnd]);

  // Filter orders according to active date range and dimension filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const t = new Date(order.createdAt).getTime();
      if (t < startMs || t > endMs) return false;

      if (statusFilter !== "all" && order.orderStatus !== statusFilter) return false;
      const totals = orderTotals(order);
      if (payFilter !== "all" && totals.paymentStatus !== payFilter) return false;
      if (methodFilter !== "all" && (order.paymentMethod || "Cash") !== methodFilter) return false;

      if (serviceFilter !== "all") {
        if (!order.items.some((i) => i.service === serviceFilter)) return false;
      }

      return true;
    });
  }, [orders, startMs, endMs, statusFilter, payFilter, methodFilter, serviceFilter]);

  // Key performance metrics across filtered orders
  const metrics = useMemo(() => {
    let gross = 0;
    let discounts = 0;
    let net = 0;
    let collected = 0;
    let balance = 0;
    let itemsProcessed = 0;
    const customerIds = new Set<string>();

    // For estimated profit calculations
    let salesWithCost = 0;
    let totalEstimatedCost = 0;
    let itemsWithCostCount = 0;

    filteredOrders.forEach((order) => {
      const t = orderTotals(order);
      gross += t.subtotal;
      discounts += t.discountAmount;
      net += t.total;
      collected += t.amountPaid;
      balance += t.balance;
      itemsProcessed += t.itemCount;

      const custKey = order.customerId || order.customer.mobile || order.customer.name;
      if (custKey) customerIds.add(custKey);

      // Check item costs
      order.items.forEach((item) => {
        if (item.estimatedCost !== undefined && item.estimatedCost > 0) {
          const lineGross = item.quantity * item.unitPrice;
          const proportionalDiscount = t.subtotal > 0 ? (lineGross / t.subtotal) * t.discountAmount : 0;
          salesWithCost += (lineGross - proportionalDiscount);
          totalEstimatedCost += item.quantity * item.estimatedCost;
          itemsWithCostCount += item.quantity;
        }
      });
    });

    const totalOrders = filteredOrders.length;
    const aov = totalOrders > 0 ? net / totalOrders : 0;
    const costCoveragePercent = net > 0 ? Math.min(100, Math.round((salesWithCost / net) * 100)) : 0;
    const estimatedProfit = salesWithCost - totalEstimatedCost;

    return {
      totalOrders,
      itemsProcessed,
      gross,
      discounts,
      net,
      collected,
      balance,
      aov,
      customersServed: customerIds.size,
      salesWithCost,
      totalEstimatedCost,
      estimatedProfit,
      costCoveragePercent,
      itemsWithCostCount,
    };
  }, [filteredOrders]);

  // Service-wise breakdown with consistent proportional discount allocation
  const serviceStats = useMemo(() => {
    return SERVICES.map((serviceName) => {
      let orderCount = 0;
      let quantity = 0;
      let gross = 0;
      let discountAllocated = 0;

      filteredOrders.forEach((order) => {
        const orderTotalsVal = orderTotals(order);
        const matchingLines = order.items.filter((i) => i.service === serviceName);
        if (matchingLines.length > 0) {
          orderCount += 1;
          const serviceLinesGross = matchingLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
          const serviceQty = matchingLines.reduce((sum, line) => sum + line.quantity, 0);
          gross += serviceLinesGross;
          quantity += serviceQty;

          // Proportional discount allocation
          if (orderTotalsVal.subtotal > 0) {
            discountAllocated += (serviceLinesGross / orderTotalsVal.subtotal) * orderTotalsVal.discountAmount;
          }
        }
      });

      const net = Math.max(0, gross - discountAllocated);
      return {
        service: serviceName,
        orderCount,
        quantity,
        gross,
        discountAllocated,
        net,
      };
    });
  }, [filteredOrders]);

  // Daily Trend calculation for charts
  const dailyTrends = useMemo(() => {
    const map = new Map<string, { date: string; sales: number; count: number }>();
    filteredOrders.forEach((order) => {
      const d = new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const current = map.get(d) || { date: d, sales: 0, count: 0 };
      current.sales += orderTotals(order).total;
      current.count += 1;
      map.set(d, current);
    });
    return Array.from(map.values()).slice(-14);
  }, [filteredOrders]);

  const maxServiceNet = Math.max(...serviceStats.map((s) => s.net), 1);
  const maxDailySales = Math.max(...dailyTrends.map((d) => d.sales), 1);

  function resetAll() {
    setPreset("30days");
    setCustomStart("");
    setCustomEnd("");
    setServiceFilter("all");
    setStatusFilter("all");
    setPayFilter("all");
    setMethodFilter("all");
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#f8fafc]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-green-700" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Business Analytics Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time financial performance, volume statistics, and service breakdowns computed from recorded orders.
          </p>
        </div>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <RotateCcw className="size-3" /> Reset filters
        </button>
      </div>

      {/* Date Range Selector & Dimension Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1">
            <Calendar className="size-3.5" /> Date Range:
          </span>
          {(
            [
              ["today", "Today"],
              ["7days", "Last 7 Days"],
              ["30days", "Last 30 Days"],
              ["thisMonth", "This Month"],
              ["custom", "Custom Range"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setPreset(val)}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                preset === val
                  ? "bg-green-700 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === "custom" ? (
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={fieldClass("h-7 text-xs")}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={fieldClass("h-7 text-xs")}
              />
            </div>
          </div>
        ) : null}

        {/* Secondary Dimension Filters */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Service Filter</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as Service | "all")}
              className={fieldClass("h-8 text-xs mt-0.5")}
            >
              <option value="all">All Services</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              className={fieldClass("h-8 text-xs mt-0.5")}
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Payment Status</label>
            <select
              value={payFilter}
              onChange={(e) => setPayFilter(e.target.value as PaymentStatus | "all")}
              className={fieldClass("h-8 text-xs mt-0.5")}
            >
              <option value="all">All Payments</option>
              {PAYMENT_STATUSES.map((p) => (
                <option key={p} value={p}>{p === "partial" ? "Partially paid" : p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Payment Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | "all")}
              className={fieldClass("h-8 text-xs mt-0.5")}
            >
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 9 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 text-xs">
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase text-[11px]">
            <span>Total Orders</span>
            <ShoppingBag className="size-4 text-slate-400" />
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">{metrics.totalOrders}</div>
          <div className="mt-1 text-[11px] text-slate-500">{metrics.customersServed} customers served</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase text-[11px]">
            <span>Items Processed</span>
            <Package className="size-4 text-slate-400" />
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">{metrics.itemsProcessed}</div>
          <div className="mt-1 text-[11px] text-slate-500">Garments & articles</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase text-[11px]">
            <span>Net Revenue</span>
            <DollarSign className="size-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-700">{money(metrics.net)}</div>
          <div className="mt-1 text-[11px] text-slate-500">Gross: {money(metrics.gross)}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase text-[11px]">
            <span>Discounts Given</span>
            <TrendingUp className="size-4 text-amber-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-700">−{money(metrics.discounts)}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {metrics.gross > 0 ? `${((metrics.discounts / metrics.gross) * 100).toFixed(1)}% of gross` : "0%"}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold uppercase text-[11px]">
            <span>Amount Collected</span>
            <CheckCircle2 className="size-4 text-green-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-800">{money(metrics.collected)}</div>
          <div className="mt-1 text-[11px] font-bold text-red-600">Balance: {money(metrics.balance)}</div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Average Order Value (AOV)</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{money(metrics.aov)}</div>
          </div>
          <Users className="size-6 text-slate-300" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Outstanding Balance</div>
            <div className={`text-xl font-black mt-0.5 ${metrics.balance > 0 ? "text-red-600" : "text-emerald-700"}`}>
              {money(metrics.balance)}
            </div>
          </div>
          <AlertCircle className="size-6 text-slate-300" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Collection Efficiency</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              {metrics.net > 0 ? `${Math.round((metrics.collected / metrics.net) * 100)}%` : "100%"}
            </div>
          </div>
          <CheckCircle2 className="size-6 text-emerald-300" />
        </div>
      </div>

      {/* Service-wise Breakdown & Visual Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Service Bar Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Revenue by Service</h2>
            <span className="text-xs text-slate-400">Net Sales Breakdown</span>
          </div>

          <div className="space-y-3 pt-1">
            {serviceStats.map((stat) => {
              const pct = maxServiceNet > 0 ? (stat.net / maxServiceNet) * 100 : 0;
              return (
                <div key={stat.service} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{stat.service} ({stat.orderCount} orders)</span>
                    <span className="font-bold">{money(stat.net)}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-700 transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Qty: {stat.quantity}</span>
                    <span>Discounts: −{money(stat.discountAllocated)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date-wise Sales Trend Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Sales Trend</h2>
            <span className="text-xs text-slate-400">Recent Order Revenue</span>
          </div>

          {dailyTrends.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No sales activity in this period.
            </div>
          ) : (
            <div className="flex h-44 items-end gap-2 pt-6 pb-2 overflow-x-auto">
              {dailyTrends.map((d) => {
                const heightPct = maxDailySales > 0 ? (d.sales / maxDailySales) * 100 : 0;
                return (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5 min-w-[36px] group">
                    <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {money(d.sales)}
                    </div>
                    <div className="w-full rounded-t bg-sky-600 transition-all group-hover:bg-sky-700" style={{ height: `${Math.max(6, heightPct)}%` }} />
                    <div className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                      {d.date}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Service Comparison Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Service Performance Comparison</h2>
          <p className="text-xs text-slate-500">
            Order volume, quantity, gross sales, proportional discount attribution, and net sales per service.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Service</th>
                <th className="px-4 py-2.5 text-center">Orders</th>
                <th className="px-4 py-2.5 text-center">Volume / Qty</th>
                <th className="px-4 py-2.5 text-right">Gross Sales</th>
                <th className="px-4 py-2.5 text-right">Attributable Discounts</th>
                <th className="px-4 py-2.5 text-right">Net Sales</th>
                <th className="px-4 py-2.5 text-right">% of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {serviceStats.map((s) => {
                const revShare = metrics.net > 0 ? (s.net / metrics.net) * 100 : 0;
                return (
                  <tr key={s.service} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{s.service}</td>
                    <td className="px-4 py-2.5 text-center font-medium text-slate-700">{s.orderCount}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-emerald-600">{s.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{money(s.gross)}</td>
                    <td className="px-4 py-2.5 text-right text-amber-700 font-medium">−{money(s.discountAllocated)}</td>
                    <td className="px-4 py-2.5 text-right font-black text-slate-900">{money(s.net)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-600">{revShare.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estimated Profit Section with Qualification on Cost Data Coverage */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Estimated Profit & Cost Analysis</h2>
            <p className="text-xs text-slate-500">
              Calculated as: <span className="font-semibold text-slate-700">Net Sales − Recorded Estimated Costs</span>. Missing costs are never treated as zero.
            </p>
          </div>
          <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            Cost Coverage: {metrics.costCoveragePercent}%
          </span>
        </div>

        {metrics.costCoveragePercent < 100 ? (
          <div className="rounded border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Partial Cost Information Qualification: </span>
              Unit cost information is currently recorded for {metrics.costCoveragePercent}% of sales in this period ({money(metrics.salesWithCost)} of {money(metrics.net)}). Estimated profit is shown solely for the subset with recorded cost data and should not be treated as total business net profit. Staff can add unit costs under the Prices management tab.
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs pt-1">
          <div className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Sales with Recorded Cost</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{money(metrics.salesWithCost)}</div>
          </div>
          <div className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Estimated Direct Cost</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{money(metrics.totalEstimatedCost)}</div>
          </div>
          <div className="rounded border border-slate-100 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Contribution Margin</div>
            <div className="text-lg font-black text-emerald-700 mt-0.5">
              {metrics.salesWithCost > 0 ? money(metrics.estimatedProfit) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
