"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser, AUTH_CHANGE_EVENT } from "@/lib/billing/auth";

/**
 * Client-only auth guard for the billing module.
 * Redirects unauthenticated users to /billing/login.
 * Subscribes to auth change events for reactive updates.
 *
 * @dev-prototype: uses localStorage-only auth. Replace with server-side session checks before production.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // null = still checking, true = authenticated, false = not authenticated
  const [authState, setAuthState] = useState<boolean | null>(null);

  useEffect(() => {
    function checkAuth() {
      const user = getSessionUser();
      if (user) {
        setAuthState(true);
      } else {
        setAuthState(false);
        router.replace("/billing/login");
      }
    }

    checkAuth();

    window.addEventListener(AUTH_CHANGE_EVENT, checkAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, checkAuth);
    };
  }, [router]);

  if (authState === null) {
    // SSR hydration / initial auth check — show spinner
    return (
      <div className="flex h-dvh items-center justify-center bg-[#f1f3f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-700" />
          <span className="text-xs text-slate-500">Checking session…</span>
        </div>
      </div>
    );
  }

  if (!authState) {
    // Redirect in progress — render nothing to avoid flash
    return null;
  }

  return <>{children}</>;
}
