import { cn } from "@/lib/utils";

export const billingInputClass =
  "h-9 w-full rounded border border-[#cfd5dc] bg-white px-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100";

export const billingBtnPrimary =
  "inline-flex items-center justify-center rounded bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-40";

export const billingBtnGhost =
  "inline-flex items-center justify-center rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40";

export function fieldClass(className?: string) {
  return cn(billingInputClass, className);
}
