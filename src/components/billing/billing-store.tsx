"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { newId, nextOrderNumber } from "@/lib/billing/calculations";
import {
  clearBillingStore,
  getBillingServerSnapshot,
  loadBillingStore,
  saveBillingStore,
  subscribeBillingStore,
} from "@/lib/billing/storage";
import {
  syncCustomerToSupabase,
  syncGarmentPriceToSupabase,
  syncOrderStatusToSupabase,
  syncOrderToSupabase,
  syncPaymentToSupabase,
} from "@/lib/billing/supabase-billing";
import type { BillingStoreData, Customer, Garment, Order, OrderStatus } from "@/lib/billing/types";

type OrderInput = Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt"> &
  Partial<Pick<Order, "id" | "orderNumber" | "createdAt">>;

type BillingContextValue = BillingStoreData & {
  ready: boolean;
  upsertGarment: (garment: Garment) => void;
  addGarment: (input: Omit<Garment, "id">) => Garment;
  saveCustomer: (input: Omit<Customer, "id" | "createdAt"> & { id?: string }) => Customer;
  saveOrder: (input: OrderInput) => Order;
  updateOrderStatus: (orderId: string, orderStatus: OrderStatus) => void;
  recordPayment: (
    orderId: string,
    amountPaid: number,
    paymentMethod?: import("@/lib/billing/types").PaymentMethod,
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
  const ready = useSyncExternalStore(
    subscribeBillingStore,
    () => true,
    () => false,
  );

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

  const updateOrderStatus = useCallback((orderId: string, orderStatus: OrderStatus) => {
    const current = loadBillingStore();
    const targetOrder = current.orders.find((o) => o.id === orderId);
    if (targetOrder) {
      void syncOrderStatusToSupabase(targetOrder.orderNumber, orderStatus);
    }
    writeStore((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId ? { ...order, orderStatus, updatedAt: new Date().toISOString() } : order,
      ),
    }));
  }, []);

  const recordPayment = useCallback(
    (
      orderId: string,
      amountPaid: number,
      paymentMethod: import("@/lib/billing/types").PaymentMethod = "Cash",
      splitDetails?: { cashAmount?: number; onlineAmount?: number }
    ) => {
      const current = loadBillingStore();
      const targetOrder = current.orders.find((o) => o.id === orderId);
      if (targetOrder) {
        void syncPaymentToSupabase(targetOrder.orderNumber, amountPaid, paymentMethod, splitDetails);
      }
      writeStore((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                amountPaid,
                paymentMethod,
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
      ready,
      upsertGarment,
      addGarment,
      saveCustomer,
      saveOrder,
      updateOrderStatus,
      recordPayment,
      resetSampleData,
    }),
    [data, ready, upsertGarment, addGarment, saveCustomer, saveOrder, updateOrderStatus, recordPayment, resetSampleData],
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
