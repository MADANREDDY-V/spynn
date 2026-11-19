"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { extractAuthErrorMessage } from "@/lib/billing/auth";
import { billingInputClass, billingBtnPrimary } from "@/lib/billing/styles";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const { data, error } = await supabase.auth.getSession();

      if (active && !error && data.session) {
        setValidSession(true);
      }

      if (active) {
        setChecking(false);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setValidSession(true);
        setChecking(false);
      }
    });

    void verifySession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(extractAuthErrorMessage(updateError, "Unable to update password."));
        return;
      }

      setSuccess(true);

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.push("/billing/login");
      }, 2500);
    } catch (err) {
      setError(extractAuthErrorMessage(err, "Unable to update your password."));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f3f5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-sky-700" />
          <p className="text-xs text-slate-600">
            Verifying recovery session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f3f5] p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* SPYNN Branding */}
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
            Set New Password
          </h2>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="font-semibold text-emerald-800">
              Password updated successfully!
            </p>
            <p className="mt-2 text-xs text-emerald-700">
              Redirecting you to the billing login page...
            </p>
          </div>
        ) : !validSession ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Lock className="size-6" />
            </div>
            <p className="text-sm font-semibold text-red-800">
              Link Invalid or Expired
            </p>
            <p className="mt-1 text-xs text-red-700">
              This password reset link is invalid, expired, or has already been used.
            </p>
            <Link
              href="/billing/forgot-password"
              className="mt-4 inline-block rounded bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
            >
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-600"
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={`${billingInputClass} disabled:bg-slate-100 disabled:cursor-not-allowed`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold text-slate-600"
              >
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
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
                  Updating Password...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
