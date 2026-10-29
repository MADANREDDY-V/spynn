"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { loginUser } from "@/lib/billing/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { billingInputClass, billingBtnPrimary } from "@/lib/billing/styles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const supabaseActive = isSupabaseConfigured();

  function validate(): boolean {
    let valid = true;
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else {
      setEmailError(null);
    }
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError(null);
    }
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const err = await loginUser(email, password);
      if (err) {
        setError(err);
      } else {
        router.push("/billing");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f3f5] p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Branding with official SPYNN Logo */}
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
          <p className="mt-1 text-sm font-semibold text-slate-700">
            Sign in to Billing
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-slate-600"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={billingInputClass}
            />
            {emailError && (
              <p className="text-xs text-red-600">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-slate-600"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${billingInputClass} pr-9`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-600">{passwordError}</p>
            )}
          </div>

          {/* General error */}
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`${billingBtnPrimary} w-full disabled:opacity-50`}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/billing/signup"
            className="font-semibold text-sky-700 hover:underline"
          >
            Create one
          </Link>
        </p>

        {/* Supabase backend status banner */}
        <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-2.5 text-center text-[11px]">
          {supabaseActive ? (
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="size-3.5" />
              <span>Supabase Cloud Auth Active</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-slate-600">
              <div className="flex items-center gap-1 font-semibold text-amber-700">
                <AlertCircle className="size-3.5" />
                <span>Supabase Cloud Pending</span>
              </div>
              <span className="text-[10px] text-slate-500">
                To connect Supabase Auth, add URL & Key in <code>.env.local</code>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
