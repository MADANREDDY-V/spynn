import { DEFAULT_STORE, SAMPLE_GARMENTS } from "./sample-data";
import type { BillingStoreData, Customer, DraftBill, Garment, Order, Service } from "./types";
import { userStoragePrefix } from "./auth";

// Legacy / backward-compat constants (kept for external consumers)
export const BILLING_STORAGE_KEY = "spynn-billing-store-v2";
export const BILLING_DRAFT_KEY = "spynn-billing-draft-v1";
const LEGACY_STORAGE_KEY = "spynn-billing-store-v1";
const BILLING_EVENT = "spynn-billing-store";

/** Returns the user-namespaced localStorage key for the billing store. */
export function getBillingStorageKey(): string {
  return userStoragePrefix() + "store-v2";
}

/** Returns the user-namespaced localStorage key for the billing draft. */
export function getBillingDraftKey(): string {
  return userStoragePrefix() + "draft-v1";
}

const SERVER_STORE: BillingStoreData = structuredClone(DEFAULT_STORE);
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedData: BillingStoreData = SERVER_STORE;

function isGarment(value: unknown): value is Garment {
  if (!value || typeof value !== "object") return false;
  const item = value as Garment;
  return typeof item.id === "string" && typeof item.name === "string" && typeof item.service === "string";
}

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") return false;
  const item = value as Customer;
  return typeof item.id === "string" && typeof item.name === "string" && typeof item.mobile === "string";
}

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") return false;
  const item = value as Order;
  return typeof item.id === "string" && typeof item.orderNumber === "string" && Array.isArray(item.items);
}

function mapLegacyService(svc: string): Service {
  if (svc === "Dry Clean" || svc === "Dry Cleaning") return "Dry Cleaning";
  if (svc === "Ironing") return "Ironing";
  if (svc === "Shoe Cleaning") return "Shoe Cleaning";
  if (svc === "Household") return "Household";
  if (svc === "Laundry") return "Laundry";
  return "Dry Cleaning";
}

function mergeGarments(stored: Garment[]): Garment[] {
  const byId = new Map(stored.map((garment) => [garment.id, garment]));
  const mergedDefaults = SAMPLE_GARMENTS.map((garment) => {
    const existing = byId.get(garment.id);
    if (!existing) return garment;
    return {
      ...garment,
      ...existing,
      service: garment.service,
      prices: { ...garment.prices, ...existing.prices },
    };
  });
  const extras = stored.filter((garment) => !SAMPLE_GARMENTS.some((sample) => sample.id === garment.id));
  return [...mergedDefaults, ...extras];
}

export function emptyBillingStore(): BillingStoreData {
  return structuredClone(DEFAULT_STORE);
}

function parseStore(raw: string | null): BillingStoreData {
  if (!raw) return emptyBillingStore();
  try {
    const parsed = JSON.parse(raw) as Partial<BillingStoreData>;
    const garments = Array.isArray(parsed.garments) ? parsed.garments.filter(isGarment) : [];
    const customers = Array.isArray(parsed.customers) ? parsed.customers.filter(isCustomer) : emptyBillingStore().customers;
    const orders = Array.isArray(parsed.orders)
      ? parsed.orders.filter(isOrder).map((order) => ({
          ...order,
          items: order.items.map((line) => ({
            ...line,
            service: mapLegacyService(line.service as string),
          })),
        }))
      : emptyBillingStore().orders;

    return {
      garments: garments.length ? mergeGarments(garments) : emptyBillingStore().garments,
      customers,
      orders,
    };
  } catch {
    return emptyBillingStore();
  }
}

function emit() {
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BILLING_EVENT));
  }
}

export function loadBillingStore(): BillingStoreData {
  if (typeof window === "undefined") {
    return SERVER_STORE;
  }
  const dynamicKey = getBillingStorageKey();
  let raw = window.localStorage.getItem(dynamicKey);

  // When no user is logged in (shared prefix), also check the old static key as a legacy fallback
  if (!raw && dynamicKey.includes("shared-")) {
    raw = window.localStorage.getItem(BILLING_STORAGE_KEY);
  }

  if (!raw) {
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      try {
        const legacy = JSON.parse(legacyRaw);
        const migrated: BillingStoreData = {
          garments: emptyBillingStore().garments,
          customers: Array.isArray(legacy.customers) ? legacy.customers.filter(isCustomer) : emptyBillingStore().customers,
          orders: Array.isArray(legacy.orders)
            ? legacy.orders.filter(isOrder).map((order: Order) => ({
                ...order,
                items: order.items.map((line) => ({
                  ...line,
                  service: mapLegacyService(line.service as string),
                })),
              }))
            : emptyBillingStore().orders,
        };
        saveBillingStore(migrated);
        return migrated;
      } catch {
        // ignore legacy parse error
      }
    }
  }

  if (raw === cachedRaw) return cachedData;
  cachedRaw = raw;
  cachedData = parseStore(raw);
  return cachedData;
}

export function saveBillingStore(data: BillingStoreData): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(data);
  window.localStorage.setItem(getBillingStorageKey(), raw);
  cachedRaw = raw;
  cachedData = data;
  emit();
}

export function clearBillingStore(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getBillingStorageKey());
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  clearBillingDraft();
  cachedRaw = null;
  cachedData = emptyBillingStore();
  emit();
}

export function loadBillingDraft(): DraftBill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getBillingDraftKey());
    if (!raw) return null;
    return JSON.parse(raw) as DraftBill;
  } catch {
    return null;
  }
}

export function saveBillingDraft(draft: DraftBill): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getBillingDraftKey(), JSON.stringify(draft));
  } catch {}
}

export function clearBillingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getBillingDraftKey());
  } catch {}
}

export function subscribeBillingStore(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
    window.addEventListener(BILLING_EVENT, listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
      window.removeEventListener(BILLING_EVENT, listener);
    }
  };
}

export function getBillingServerSnapshot(): BillingStoreData {
  return SERVER_STORE;
}
