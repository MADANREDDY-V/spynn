"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

export type ToastMessage = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border p-3 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${
        isSuccess
          ? "border-emerald-200 bg-white text-emerald-900"
          : isError
          ? "border-red-200 bg-white text-red-900"
          : "border-sky-200 bg-white text-slate-900"
      }`}
    >
      {isSuccess && <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />}
      {isError && <AlertCircle className="size-5 shrink-0 text-red-600 mt-0.5" />}
      {!isSuccess && !isError && <Info className="size-5 shrink-0 text-sky-600 mt-0.5" />}

      <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
