"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "@/lib/billing/auth";
import { billingInputClass, billingBtnPrimary } from "@/lib/billing/styles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function validateEmail(val: string): boolean {
    const trimmed = val.trim();
    if (!trimmed) {
      setError("Please enter your registered email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) return;

    setLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (result) {
        // Defensive check: guarantee no "{}" or empty string can ever be shown
        const cleanError =
          typeof result === "string" && result.trim() !== "{}" && result.trim() !== ""
            ? result.trim()
            : "Unable to send recovery email. Please try again later or contact support.";
        setError(cleanError);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        err instanceof Error && err.message && err.message !== "{}"
          ? err.message
          : "An unexpected error occurred while requesting password reset. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f3f5] p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* SPYNN Branding matching Login */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/images/spynn-logo.png"
            alt="SPYNN STUDIO"
            width={88}
            height={88}
            className="h-20 w-20 object-contain drop-shadow-xs"
            priority
          />

          <div className="text-center">
            <div className="text-base font-black tracking-wide text-[#0B1F3A]">
              SPYNN STUDIO
            </div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-sky-600">
              DRY CLEANING STUDIO
            </div>
          </div>

          <h2 className="mt-1 text-base font-semibold text-slate-800">
            Forgot Password?
          </h2>
          <p className="text-center text-xs text-slate-500">
            Enter your registered email address. We&apos;ll send you a password
            reset link.
          </p>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="font-semibold text-emerald-800">
              Reset email requested
            </p>
            <p className="mt-2 text-xs leading-relaxed text-emerald-700">
              If an account exists for{" "}
              <strong className="font-semibold text-emerald-900">{email.trim()}</strong>
              , a password reset link has been sent. Please check your inbox and spam folder.
            </p>
            <div className="mt-4 pt-3 border-t border-emerald-200/60">
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setError(null);
                }}
                className="text-xs font-semibold text-sky-700 hover:underline"
              >
                Send to a different email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-slate-600">
                Registered Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="you@example.com"
                className={`${billingInputClass} disabled:bg-slate-100 disabled:cursor-not-allowed`}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1 leading-snug">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${billingBtnPrimary} w-full disabled:opacity-50`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Sending Reset Link...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-slate-600">
          <Link
            href="/billing/login"
            className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
