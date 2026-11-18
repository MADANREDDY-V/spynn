
"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/billing/auth";
import { billingInputClass, billingBtnPrimary } from "@/lib/billing/styles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (result) {
        setError(result);
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f3f5] p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-black text-[#0B1F3A]">
            SPYNN STUDIO
          </h1>
          <p className="mt-1 text-xs font-bold tracking-widest text-sky-600">
            DRY CLEANING STUDIO
          </p>
          <h2 className="mt-6 text-lg font-semibold text-slate-800">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your registered email address. We'll send you a password
            reset link.
          </p>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="font-semibold text-emerald-800">
              Reset email requested
            </p>
            <p className="mt-2 text-sm text-emerald-700">
              If an account exists for this email, a password reset link will
              be sent. Please check your inbox and spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-slate-600">
                Registered Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={billingInputClass}
              />
            </div>

            {error && (
              <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${billingBtnPrimary} w-full disabled:opacity-50`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-600">
          <Link href="/billing/login" className="font-semibold text-sky-700 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
