"use client";

import { useState } from "react";
import { Download, MessageSquare, Copy, Check, Loader2 } from "lucide-react";
import { billingBtnGhost } from "@/lib/billing/styles";
import { buildReceiptText, whatsappShareUrl } from "@/lib/billing/receipt-text";
import { downloadReceiptPdf, generateReceiptPdf } from "@/lib/billing/generate-receipt-pdf";
import type { CartLine, CustomerSnapshot } from "@/lib/billing/types";

export function WhatsAppShare({
  disabled,
  orderNumber,
  createdAt,
  customer,
  items,
  notes = "",
  discount,
  amountPaid,
}: {
  disabled: boolean;
  orderNumber: string;
  createdAt: string;
  customer: CustomerSnapshot;
  items: CartLine[];
  notes?: string;
  discount: number; // Discount percentage (0-100)
  amountPaid: number;
}) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const text = buildReceiptText({
    orderNumber,
    createdAt,
    customer,
    items,
    notes,
    discount,
    amountPaid,
  });

  const url = whatsappShareUrl(customer.mobile, text);

  async function handleDownloadPdf() {
    if (disabled || isDownloading) return;
    try {
      setIsDownloading(true);
      await downloadReceiptPdf({
        orderNumber,
        createdAt,
        customer,
        items,
        notes,
        discount,
        amountPaid,
      });
      setDownloadSuccess(true);
      window.setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Unable to generate PDF receipt. Please use Print Bill -> Save as PDF.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleWhatsAppShare() {
    if (!url) return;

    // Check if browser supports Web Share API with files (e.g. Chrome on Android, Safari on iOS)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const doc = await generateReceiptPdf({
          orderNumber,
          createdAt,
          customer,
          items,
          notes,
          discount,
          amountPaid,
        });
        const blob = doc.output("blob");
        const cleanOrderNum = (orderNumber || "ORDER").replace(/[^a-zA-Z0-9_-]/g, "_");
        const file = new File([blob], `SPYNN-Receipt-${cleanOrderNum}.pdf`, {
          type: "application/pdf",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Receipt ${orderNumber}`,
            text,
          });
          return;
        }
      } catch (e) {
        // Fall back to opening WhatsApp URL
        console.warn("Native file share fallback:", e);
      }
    }

    // On standard desktop browsers: download the PDF automatically so the user has the file ready to attach, then open WhatsApp Web
    handleDownloadPdf();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-2">
        {/* Download PDF Button */}
        <button
          type="button"
          disabled={disabled || isDownloading}
          onClick={handleDownloadPdf}
          title="Download official SPYNN receipt PDF"
          className={`${billingBtnGhost} flex-1 min-w-[120px] text-xs py-1.5 inline-flex items-center justify-center gap-1.5`}
        >
          {isDownloading ? (
            <>
              <Loader2 className="size-3.5 animate-spin text-sky-600" />
              <span>Generating…</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="size-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Downloaded</span>
            </>
          ) : (
            <>
              <Download className="size-3.5 text-slate-600" />
              <span>Download PDF</span>
            </>
          )}
        </button>

        {/* Share on WhatsApp Button */}
        {url ? (
          <button
            type="button"
            disabled={disabled}
            onClick={handleWhatsAppShare}
            title="Opens WhatsApp Web/App with pre-filled bill message and downloads receipt PDF to attach"
            className={`${billingBtnGhost} flex-1 min-w-[130px] text-xs py-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 inline-flex items-center justify-center gap-1.5 ${
              disabled ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <MessageSquare className="size-3.5 text-emerald-700" />
            <span>Share on WhatsApp</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className={`${billingBtnGhost} flex-1 min-w-[130px] text-xs py-1.5`}
          >
            Add mobile to share
          </button>
        )}

        {/* Copy Text Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={copyText}
          title="Copy bill text to clipboard"
          className={`${billingBtnGhost} text-xs py-1.5 px-2.5 inline-flex items-center gap-1`}
        >
          {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div className="rounded bg-slate-50 border border-slate-200/60 p-1.5 text-[10px] text-slate-500 space-y-0.5">
        <p>
          💡 To send invoice PDF: Click &quot;Download PDF&quot; (or &quot;Save as PDF&quot;) → Click &quot;Share on WhatsApp&quot; → Attach the downloaded receipt PDF in chat.
        </p>
        <p className="text-[9.5px] text-slate-400">
          WhatsApp Web/browser sharing cannot auto-attach files directly. Please manually attach the downloaded PDF receipt.
        </p>
      </div>
    </div>
  );
}
