"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signupUser, loginUser } from "@/lib/billing/auth";
import { billingInputClass, billingBtnPrimary } from "@/lib/billing/styles";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  function validate(): boolean {
    let valid = true;

    if (!name.trim()) {
      setNameError("Full name is required.");
      valid = false;
    } else {
      setNameError(null);
    }

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else {
      setEmailError(null);
    }

    const digitsOnly = mobile.replace(/\D/g, "");
    if (!mobile.trim()) {
      setMobileError("Mobile number is required.");
      valid = false;
    } else if (digitsOnly.length < 10) {
      setMobileError("Mobile number must be at least 10 digits.");
      valid = false;
    } else {
      setMobileError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your password.");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      valid = false;
    } else {
      setConfirmError(null);
    }

    return valid;
  }

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const signupErr = await signupUser(name, email, mobile, password);
      if (signupErr) {
        setError(signupErr);
        return;
      }

      const loginErr = await loginUser(email, password);
      if (loginErr) {
        setError(loginErr);
        return;
      }

      router.push("/billing");
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
            Create a Billing Account
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="text-xs font-semibold text-slate-600"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className={billingInputClass}
            />
            {nameError && (
              <p className="text-xs text-red-600">{nameError}</p>
            )}
          </div>

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

          {/* Mobile */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="mobile"
              className="text-xs font-semibold text-slate-600"
            >
              Mobile Number
            </label>
            <input
              id="mobile"
              type="tel"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876543210"
              className={billingInputClass}
            />
            {mobileError && (
              <p className="text-xs text-red-600">{mobileError}</p>
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
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirm-password"
              className="text-xs font-semibold text-slate-600"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`${billingInputClass} pr-9`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {confirmError && (
              <p className="text-xs text-red-600">{confirmError}</p>
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
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/billing/login"
            className="font-semibold text-sky-700 hover:underline"
          >
            Sign in
          </Link>
        </p>

        {/* Supabase backend status banner */}
        <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-2.5 text-center text-[11px] text-slate-600">
          <span className="font-semibold text-emerald-800">Supabase Cloud Ready:</span> Accounts are registered via Supabase Auth when configured.
        </div>
      </div>
    </div>
  );
}
