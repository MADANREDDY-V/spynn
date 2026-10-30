/**
 * @dev-prototype: NOT SECURE. Auth is localStorage-only. Replace with server-side auth before production.
 *
 * Prototype authentication for the SPYNN billing module.
 * All data is stored in localStorage with no server involvement.
 * Passwords are obfuscated with btoa (NOT cryptographically hashed).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AuthUser = {
  id: string;       // unique userId
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
};

type StoredUser = { passwordHash: string } & AuthUser;
type UsersStore = Record<string, StoredUser>;

// ---------------------------------------------------------------------------
// Key constants
// ---------------------------------------------------------------------------

/** localStorage key for the users store (fallback when Supabase is unconfigured) */
export const AUTH_USERS_KEY = "spynn-billing-users";

/** localStorage key for the active session: userId string (or absent/null) */
export const AUTH_SESSION_KEY = "spynn-billing-session";

/** Custom DOM event name dispatched on auth state changes */
export const AUTH_CHANGE_EVENT = "spynn-auth-change";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function readUsersStore(): UsersStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UsersStore;
  } catch {
    return {};
  }
}

function writeUsersStore(store: UsersStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(store));
}

// ---------------------------------------------------------------------------
// protoHash — NOT cryptographically secure
// ---------------------------------------------------------------------------

/**
 * Obfuscates a password using btoa.
 *
 * ⚠️  NOT cryptographically secure — this is a development prototype only.
 *     Replace with bcrypt / Argon2 (server-side) before production.
 */
export function protoHash(password: string): string {
  return btoa(encodeURIComponent(password + "|spynn-salt"));
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/** Returns the currently logged-in AuthUser, or null if no active session. */
export function getSessionUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const userId = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!userId) return null;
  const store = readUsersStore();
  const stored = store[userId];
  if (!stored) return null;
  // Return only the AuthUser fields (no passwordHash)
  const { passwordHash: _omit, ...user } = stored;
  return user as AuthUser;
}

// ---------------------------------------------------------------------------
// Sign-up
// ---------------------------------------------------------------------------

/**
 * Creates a new user account via Supabase Auth (or local store if Supabase unconfigured).
 * @returns An error string if signup fails, or null on success.
 */
export async function signupUser(
  name: string,
  email: string,
  mobile: string,
  password: string
): Promise<string | null> {
  if (!name.trim()) return "Name is required.";
  if (!email.trim()) return "Email is required.";
  if (!mobile.trim()) return "Mobile number is required.";
  if (!password) return "Password is required.";

  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            mobile: mobile.trim(),
          },
        },
      });

      if (error) return error.message;

      if (data.user) {
        const sessionUser: AuthUser = {
          id: data.user.id,
          name: name.trim(),
          email: normalizedEmail,
          mobile: mobile.trim(),
          createdAt: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(AUTH_SESSION_KEY, data.user.id);
          const store = readUsersStore();
          store[data.user.id] = { passwordHash: "", ...sessionUser };
          writeUsersStore(store);
          emitAuthChange();
        }
      }
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Error creating Supabase user";
    }
  }

  // Fallback local storage auth (no default credentials)
  const store = readUsersStore();
  const duplicate = Object.values(store).find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (duplicate) return "An account with this email already exists.";

  const userId =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const newUser: StoredUser = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    mobile: mobile.trim(),
    createdAt: new Date().toISOString(),
    passwordHash: protoHash(password),
  };

  store[userId] = newUser;
  writeUsersStore(store);
  return null;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Validates credentials and creates a session via Supabase Auth (or local store).
 * @returns An error string if login fails, or null on success.
 */
export async function loginUser(email: string, password: string): Promise<string | null> {
  if (!email.trim()) return "Email is required.";
  if (!password) return "Password is required.";

  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) return error.message;

      if (data.user) {
        const name = (data.user.user_metadata?.full_name as string) || "Staff User";
        const mobile = (data.user.user_metadata?.mobile as string) || "";
        const sessionUser: AuthUser = {
          id: data.user.id,
          name,
          email: normalizedEmail,
          mobile,
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(AUTH_SESSION_KEY, data.user.id);
          const store = readUsersStore();
          store[data.user.id] = { passwordHash: "", ...sessionUser };
          writeUsersStore(store);
          emitAuthChange();
        }
        return null;
      }
      return "Unable to log in to Supabase.";
    } catch (err) {
      return err instanceof Error ? err.message : "Error connecting to Supabase Auth";
    }
  }

  // Fallback local store login
  const store = readUsersStore();
  const match = Object.values(store).find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );

  if (!match) return "No account found with this email.";
  if (match.passwordHash !== protoHash(password)) return "Incorrect password.";

  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_SESSION_KEY, match.id);
    emitAuthChange();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

/** Clears the active session via Supabase Auth (and local storage). */
export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    emitAuthChange();
  }
}

// ---------------------------------------------------------------------------
// Storage namespace
// ---------------------------------------------------------------------------

/**
 * Returns a localStorage key prefix scoped to the current user.
 * Falls back to a shared prefix when no user is logged in (backward-compatible).
 */
export function userStoragePrefix(): string {
  if (typeof window === "undefined") return "spynn-billing-shared-";
  const userId = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!userId) return "spynn-billing-shared-";
  return `spynn-billing-${userId}-`;
}

// ---------------------------------------------------------------------------
// Auth change pub/sub
// ---------------------------------------------------------------------------

const authListeners = new Set<() => void>();

/** Dispatches an auth change event to all subscribers and the window. */
export function emitAuthChange(): void {
  authListeners.forEach((fn) => fn());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

/**
 * Subscribes to auth state changes.
 * @returns An unsubscribe function.
 */
export function subscribeAuthChange(listener: () => void): () => void {
  authListeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener(AUTH_CHANGE_EVENT, listener);
  }
  return () => {
    authListeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    }
  };
}
