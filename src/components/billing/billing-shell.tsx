"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  HelpCircle,
  LogOut,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Shirt,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBillingStore } from "@/components/billing/billing-store";
import { HelpCenter } from "@/components/billing/help-center";
import { AuthGuard } from "@/components/billing/auth-guard";
import { getSessionUser, logoutUser, AUTH_CHANGE_EVENT } from "@/lib/billing/auth";

const NAV = [
  { href: "/billing", label: "New Order", icon: ReceiptText, exact: true },
  { href: "/billing/orders", label: "Orders", icon: ClipboardList },
  { href: "/billing/customers", label: "Customers", icon: Users },
  { href: "/billing/prices", label: "Prices", icon: Shirt },
  { href: "/billing/analytics", label: "Analytics", icon: BarChart3 },
];

const SECONDARY_NAV = [
  { href: "/billing/orders", label: "Orders" },
  { href: "/billing/customers", label: "Customers" },
  { href: "/billing/prices", label: "Prices" },
  { href: "/billing/analytics", label: "Analytics" },
];

// ─── Profile Dropdown ────────────────────────────────────────────────────────

function ProfileDropdown({
  userName,
  userEmail,
  onClose,
  onLogout,
  onResetSample,
}: {
  userName: string;
  userEmail: string;
  onClose: () => void;
  onLogout: () => void;
  onResetSample: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
    >
      {/* Profile info with SPYNN logo */}
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/images/spynn-logo.png"
            alt="SPYNN Logo"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white p-0.5 object-contain"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900">{userName}</div>
            <div className="truncate text-xs text-slate-500">{userEmail}</div>
          </div>
        </div>
      </div>

      {/* Profile options */}
      <div className="py-1">
        <button
          type="button"
          onClick={() => {
            alert(`Logged in as ${userName} (${userEmail})`);
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <User className="size-4 text-slate-400" />
          <span>Account Profile</span>
        </button>
        <button
          type="button"
          title="Password management requires backend integration (not available in prototype)"
          className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-50 cursor-not-allowed"
        >
          <Settings className="size-4 text-slate-300" />
          <span>Change Password <span className="text-[10px] text-slate-400">(future API)</span></span>
        </button>
      </div>

      {/* Dev tools section */}
      <div className="border-t border-slate-100 py-1">
        <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Developer Tools
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset billing data to sample catalogue, customers, and orders?")) {
              onResetSample();
              onClose();
            }
          }}
          className="flex w-full items-center gap-3 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors"
        >
          <span>⚠ Reset sample data</span>
        </button>
      </div>

      {/* Logout */}
      <div className="border-t border-slate-100 py-1">
        <button
          type="button"
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="size-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// ─── Global Search Bar ────────────────────────────────────────────────────────

function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/billing/orders?q=${encodeURIComponent(q)}`);
    setQuery("");
  }

  return (
    <form onSubmit={handleSearch} className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Order / Customer / Mobile…"
        className="h-8 w-36 lg:w-48 rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
      />
    </form>
  );
}

// ─── Shell Component ──────────────────────────────────────────────────────────

export function BillingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, resetSampleData } = useBillingStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Auth state - read from localStorage on client
  const [userName, setUserName] = useState("Staff User");
  const [userEmail, setUserEmail] = useState("staff@spynn.in");

  // Auth pages should render without the shell
  const isAuthPage =
    pathname === "/billing/login" ||
    pathname === "/billing/signup";

  useEffect(() => {
    function loadUser() {
      const user = getSessionUser();
      if (user) {
        setUserName(user.name || "Staff User");
        setUserEmail(user.email || "staff@spynn.in");
      } else {
        setUserName("Staff User");
        setUserEmail("staff@spynn.in");
      }
    }

    loadUser();
    window.addEventListener(AUTH_CHANGE_EVENT, loadUser);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, loadUser);
  }, [pathname]);

  async function handleLogout() {
    await logoutUser();
    router.push("/billing/login");
  }

  // Render auth pages without shell
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-[#f1f3f5] text-[#20242b]">
      {/* ── Staff Header: Single Compact Row ── */}
      <header className="no-print flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 md:px-5">
        {/* Left: SPYNN Brand Logo & Typography */}
        <Link
          href="/billing"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/images/spynn-logo.png"
            alt="SPYNN STUDIO"
            width={38}
            height={38}
            className="h-9 w-9 shrink-0 object-contain"
            priority
          />
          <div className="flex flex-col justify-center leading-none">
            <span className="text-[14px] font-black tracking-wide text-[#0B1F3A]">SPYNN STUDIO</span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-sky-600">DRY CLEANING STUDIO</span>
          </div>
        </Link>

        {/* Center/Right: Action Links, Help Center & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {/* New Order: Green primary action button styling */}
            <Link
              href="/billing"
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-white shadow-xs transition-colors",
                pathname === "/billing"
                  ? "bg-green-700 ring-2 ring-green-600/30 hover:bg-green-800"
                  : "bg-green-700 hover:bg-green-800"
              )}
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              <span>New Order</span>
            </Link>

            {/* Orders, Customers, Prices, Analytics */}
            {SECONDARY_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "hidden h-8 items-center rounded-md px-2.5 text-xs font-semibold transition-colors md:inline-flex",
                    active
                      ? "bg-sky-50 text-sky-800 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick search input (visible on wider screens) */}
          <GlobalSearch />

          {/* Help Center Button with clearly visible icon AND text */}
          <button
            type="button"
            aria-label="Help Center / Chat with us"
            title="Help Center / Chat with us & FAQs"
            onClick={() => setShowHelp((v) => !v)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors shadow-2xs",
              showHelp
                ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-400"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <HelpCircle className="size-4 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Help Center / Chat with us</span>
          </button>

          {/* Profile button at far right */}
          <div className="relative">
            <button
              type="button"
              aria-label="Staff profile"
              title="Staff profile"
              onClick={() => setShowProfile((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[#0B1F3A] hover:border-slate-300 hover:bg-slate-200 transition-colors shadow-2xs"
            >
              <User className="size-4" />
            </button>
            {showProfile ? (
              <ProfileDropdown
                userName={userName}
                userEmail={userEmail}
                onClose={() => setShowProfile(false)}
                onLogout={handleLogout}
                onResetSample={resetSampleData}
              />
            ) : null}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar icons for quick navigation */}
        <nav className="no-print hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-slate-200 bg-white py-4 lg:flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-100",
                )}
              >
                <Icon className="size-5" />
              </Link>
            );
          })}
        </nav>

        {/* Page content */}
        <div className="min-w-0 flex-1 overflow-hidden">
          {ready ? (
            <AuthGuard>{children}</AuthGuard>
          ) : (
            <div className="p-6 text-sm text-slate-500">Loading billing counter…</div>
          )}
        </div>
      </div>

      {/* ── Bottom Mobile Nav ── */}
      <nav className="no-print grid grid-cols-5 border-t border-slate-200 bg-white lg:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-sky-800 font-bold" : "text-slate-500",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Help Center Slide-in Panel ── */}
      {showHelp ? (
        <HelpCenter onClose={() => setShowHelp(false)} />
      ) : null}
    </div>
  );
}
