"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { newId, nextOrderNumber } from "@/lib/billing/calculations";
import {
  clearBillingStore,
  getBillingServerSnapshot,
  loadBillingStore,
  saveBillingStore,
  subscribeBillingStore,
} from "@/lib/billing/storage";
import {
  deleteOrderFromSupabase,
  fetchBillingStoreFromSupabase,
  syncCustomerToSupabase,
  syncGarmentPriceToSupabase,
  syncOrderStatusToSupabase,
  syncOrderToSupabase,
  syncPaymentToSupabase,
} from "@/lib/billing/supabase-billing";
import { getSessionUser, subscribeAuthChange } from "@/lib/billing/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { BillingStoreData, Customer, Garment, Order, OrderStatus, PaymentMethod } from "@/lib/billing/types";

type OrderInput = Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt"> &
  Partial<Pick<Order, "id" | "orderNumber" | "createdAt">>;

type BillingContextValue = BillingStoreData & {
  ready: boolean;
  isLoading: boolean;
  error: string | null;
  refreshFromSupabase: () => Promise<void>;
  upsertGarment: (garment: Garment) => void;
  addGarment: (input: Omit<Garment, "id">) => Garment;
  saveCustomer: (input: Omit<Customer, "id" | "createdAt"> & { id?: string }) => Customer;
  saveOrder: (input: OrderInput) => Order;
  deleteOrder: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (orderId: string, orderStatus: OrderStatus) => void;
  recordPayment: (
    orderId: string,
    amountPaid: number,
    paymentMethod?: PaymentMethod,
    splitDetails?: { cashAmount?: number; onlineAmount?: number }
  ) => void;
  resetSampleData: () => void;
};

const BillingContext = createContext<BillingContextValue | null>(null);

function writeStore(updater: (current: BillingStoreData) => BillingStoreData) {
  saveBillingStore(updater(loadBillingStore()));
}

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const data = useSyncExternalStore(subscribeBillingStore, loadBillingStore, getBillingServerSnapshot);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const loadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchBillingStoreFromSupabase();
      if (res.success && res.store) {
        saveBillingStore(res.store);
      } else if (res.error) {
        console.warn("Failed to load billing data from Supabase:", res.error);
        setError(res.error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load data from Supabase";
      console.warn("Error loading from Supabase:", msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFromSupabase();

    // Re-fetch when auth state changes (login / switch user)
    const unsub = subscribeAuthChange(() => {
      void loadFromSupabase();
    });
    return unsub;
  }, [loadFromSupabase]);

  const upsertGarment = useCallback((garment: Garment) => {
    writeStore((current) => ({
      ...current,
      garments: current.garments.some((item) => item.id === garment.id)
        ? current.garments.map((item) => (item.id === garment.id ? garment : item))
        : [...current.garments, garment],
    }));
    void syncGarmentPriceToSupabase(garment);
  }, []);

  const addGarment = useCallback((input: Omit<Garment, "id">) => {
    const garment: Garment = { ...input, id: newId("g") };
    writeStore((current) => ({ ...current, garments: [...current.garments, garment] }));
    void syncGarmentPriceToSupabase(garment);
    return garment;
  }, []);

  const saveCustomer = useCallback((input: Omit<Customer, "id" | "createdAt"> & { id?: string }) => {
    const id = input.id ?? newId("c");
    const current = loadBillingStore();
    const previous = current.customers.find((item) => item.id === id);
    const customer: Customer = {
      id,
      name: input.name,
      mobile: input.mobile,
      address: input.address,
      createdAt: previous?.createdAt ?? new Date().toISOString(),
    };
    writeStore((latest) => ({
      ...latest,
      customers: latest.customers.some((item) => item.id === id)
        ? latest.customers.map((item) => (item.id === id ? customer : item))
        : [...latest.customers, customer],
    }));
    void syncCustomerToSupabase(customer);
    return customer;
  }, []);

  const saveOrder = useCallback((input: OrderInput) => {
    const now = new Date().toISOString();
    const current = loadBillingStore();
    const existing = input.id ? current.orders.find((item) => item.id === input.id) : undefined;
    const order: Order = {
      id: existing?.id ?? newId("o"),
      orderNumber: existing?.orderNumber ?? nextOrderNumber(current.orders),
      customerId: input.customerId,
      customer: input.customer,
      items: input.items,
      notes: input.notes,
      discount: input.discount,
      discountPercent: input.discountPercent,
      taxPercent: input.taxPercent ?? 0,
      amountPaid: input.amountPaid,
      paymentMethod: input.paymentMethod || "Cash",
      cashAmount: input.cashAmount,
      onlineAmount: input.onlineAmount,
      orderStatus: input.orderStatus,
      createdAt: existing?.createdAt ?? input.createdAt ?? now,
      updatedAt: now,
    };
    writeStore((latest) => ({
      ...latest,
      orders: latest.orders.some((item) => item.id === order.id)
        ? latest.orders.map((item) => (item.id === order.id ? order : item))
        : [order, ...latest.orders],
    }));
    void syncOrderToSupabase(order);
    return order;
  }, []);

  const deleteOrder = useCallback(
    async (orderId: string): Promise<{ success: boolean; error?: string }> => {
      const current = loadBillingStore();
      const target = current.orders.find((item) => item.id === orderId);
      if (!target) {
        return { success: false, error: "Order not found" };
      }

      const sessionUser = getSessionUser();
      const performedBy = sessionUser?.email || sessionUser?.name || "staff";

      // 1. Delete from Supabase
      const res = await deleteOrderFromSupabase(target.orderNumber, target.id, performedBy);
      if (!res.success) {
        return { success: false, error: res.error || "Failed to delete order from database" };
      }

      // 2. Remove order from local store
      writeStore((prev) => ({
        ...prev,
        orders: prev.orders.filter((item) => item.id !== orderId),
      }));

      return { success: true };
    },
    []
  );

  const updateOrderStatus = useCallback((orderId: string, orderStatus: OrderStatus) => {
    let targetOrderNumber: string | null = null;
    writeStore((current) => ({
      ...current,
      orders: current.orders.map((order) => {
        if (order.id === orderId) {
          targetOrderNumber = order.orderNumber;
          return { ...order, orderStatus, updatedAt: new Date().toISOString() };
        }
        return order;
      }),
    }));
    if (targetOrderNumber) {
      void syncOrderStatusToSupabase(targetOrderNumber, orderStatus);
    }
  }, []);

  const recordPayment = useCallback(
    (
      orderId: string,
      amountPaid: number,
      paymentMethod?: PaymentMethod,
      splitDetails?: { cashAmount?: number; onlineAmount?: number }
    ) => {
      const current = loadBillingStore();
      const target = current.orders.find((o) => o.id === orderId);
      if (target) {
        void syncPaymentToSupabase(target.orderNumber, amountPaid, paymentMethod || "Cash", splitDetails);
      }

      writeStore((curr) => ({
        ...curr,
        orders: curr.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                amountPaid,
                paymentMethod: paymentMethod || order.paymentMethod,
                cashAmount: splitDetails?.cashAmount ?? (paymentMethod === "Cash" ? amountPaid : 0),
                onlineAmount: splitDetails?.onlineAmount ?? (paymentMethod === "Online" ? amountPaid : 0),
                updatedAt: new Date().toISOString(),
              }
            : order,
        ),
      }));
    },
    []
  );

  const resetSampleData = useCallback(() => {
    clearBillingStore();
  }, []);

  const value = useMemo<BillingContextValue>(
    () => ({
      ...data,
      ready: !isLoading,
      isLoading,
      error,
      refreshFromSupabase: loadFromSupabase,
      upsertGarment,
      addGarment,
      saveCustomer,
      saveOrder,
      deleteOrder,
      updateOrderStatus,
      recordPayment,
      resetSampleData,
    }),
    [
      data,
      isLoading,
      error,
      loadFromSupabase,
      upsertGarment,
      addGarment,
      saveCustomer,
      saveOrder,
      deleteOrder,
      updateOrderStatus,
      recordPayment,
      resetSampleData,
    ]
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBillingStore() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBillingStore must be used within BillingProvider");
  }
  return context;
}
