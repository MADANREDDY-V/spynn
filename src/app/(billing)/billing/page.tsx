"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GarmentGrid } from "@/components/billing/garment-grid";
import { OrderCart } from "@/components/billing/order-cart";
import { Receipt } from "@/components/billing/receipt";
import { useBillingStore } from "@/components/billing/billing-store";
import { calcTotals, newId } from "@/lib/billing/calculations";
import { clearBillingDraft, loadBillingDraft, saveBillingDraft } from "@/lib/billing/storage";
import { fieldClass } from "@/lib/billing/styles";
import {
  SERVICES,
  type CartLine,
  type Customer,
  type CustomerSnapshot,
  type Garment,
  type Service,
} from "@/lib/billing/types";

const EMPTY_CUSTOMER: CustomerSnapshot = { name: "", mobile: "", address: "" };

function NewOrderScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const customerParam = searchParams.get("customer");
  const {
    garments,
    customers,
    orders,
    upsertGarment,
    saveCustomer,
    saveOrder,
  } = useBillingStore();

  const [service, setService] = useState<Service>("Dry Cleaning");
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerSnapshot>(EMPTY_CUSTOMER);
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0); // Discount percentage (0-100)
  const [amountPaid, setAmountPaid] = useState(0);
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());
  const [isInitialized, setIsInitialized] = useState(false);

  const existingOrder = orderId
    ? orders.find((order) => order.id === orderId || order.orderNumber === orderId)
    : undefined;
  const existingCustomer = !orderId && customerParam
    ? customers.find((item) => item.id === customerParam || item.mobile === customerParam)
    : undefined;

  // Initialize from existing order or saved localStorage draft
  useEffect(() => {
    if (orderId && existingOrder) {
      setEditingId(existingOrder.id);
      setOrderNumber(existingOrder.orderNumber);
      setCreatedAt(existingOrder.createdAt);
      setCart(existingOrder.items);
      setCustomerId(existingOrder.customerId);
      setCustomer(existingOrder.customer);
      setNotes(existingOrder.notes);
      setDiscount(
        existingOrder.discountPercent ??
          (existingOrder.items.length
            ? (existingOrder.discount /
                existingOrder.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)) *
              100
            : 0)
      );
      setAmountPaid(existingOrder.amountPaid);
      if (existingOrder.items[0]?.service) setService(existingOrder.items[0].service);
      setIsInitialized(true);
      return;
    }

    if (!orderId) {
      const savedDraft = loadBillingDraft();
      if (savedDraft) {
        setCart(savedDraft.items || []);
        setCustomerId(savedDraft.customerId || null);
        setCustomer(savedDraft.customer || EMPTY_CUSTOMER);
        setNotes(savedDraft.notes || "");
        setDiscount(savedDraft.discountPercent || 0);
        setAmountPaid(savedDraft.amountPaid || 0);
        if (savedDraft.service) setService(savedDraft.service);
        if (savedDraft.createdAt) setCreatedAt(savedDraft.createdAt);
      } else if (existingCustomer) {
        setCustomerId(existingCustomer.id);
        setCustomer({
          name: existingCustomer.name,
          mobile: existingCustomer.mobile,
          address: existingCustomer.address,
        });
      }
      setIsInitialized(true);
    }
  }, [orderId, existingOrder, existingCustomer]);

  // Persist draft to localStorage whenever draft state changes
  useEffect(() => {
    if (!isInitialized || editingId) return;
    saveBillingDraft({
      items: cart,
      customerId,
      customer,
      notes,
      discountPercent: discount,
      amountPaid,
      service,
      createdAt,
    });
  }, [cart, customerId, customer, notes, discount, amountPaid, service, createdAt, isInitialized, editingId]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return garments.filter((garment) => {
      if (garment.service !== service) return false;
      if (!q) return true;
      return (
        garment.name.toLowerCase().includes(q) ||
        (garment.variant && garment.variant.toLowerCase().includes(q)) ||
        garment.barcode.includes(q)
      );
    });
  }, [garments, search, service]);

  function addGarment(garment: Garment, chosenService = garment.service || service) {
    const price = garment.price ?? garment.prices?.[chosenService] ?? 0;
    setNotice(price === 0 ? `${garment.name} added at ₹0.00 — edit the line price if needed.` : "");
    setCart((current) => {
      const existingIdx = current.findIndex(
        (line) => line.garmentId === garment.id && line.service === chosenService
      );
      if (existingIdx >= 0) {
        const next = [...current];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: Number((next[existingIdx].quantity + 1).toFixed(1)),
        };
        return next;
      }
      return [
        ...current,
        {
          id: newId("line"),
          garmentId: garment.id,
          garmentName: garment.name,
          variant: garment.variant,
          unit: garment.unit,
          estimatedCost: garment.estimatedCost,
          illustration: garment.illustration,
          service: chosenService,
          quantity: 1,
          unitPrice: price,
        },
      ];
    });
  }

  function decrementGarment(garment: Garment) {
    setCart((current) => {
      const existingIdx = current.findIndex(
        (line) => line.garmentId === garment.id && line.service === service
      );
      if (existingIdx === -1) return current;
      const next = [...current];
      const currentQty = next[existingIdx].quantity;
      if (currentQty <= 1) {
        return next.filter((_, idx) => idx !== existingIdx);
      }
      next[existingIdx] = {
        ...next[existingIdx],
        quantity: Number((currentQty - 1).toFixed(1)),
      };
      return next;
    });
  }

  function addCustomLine(name: string, quantity: number, unitPrice: number, unit?: import("@/lib/billing/types").GarmentUnit) {
    const trimmed = name.trim() || `Custom ${service} Item`;
    const itemIllustration =
      service === "Shoe Cleaning"
        ? "sneakers"
        : service === "Household"
        ? "bedsheet"
        : service === "Laundry"
        ? "laundry"
        : "custom-item";

    setCart((current) => [
      ...current,
      {
        id: newId("line"),
        garmentId: newId("custom"),
        garmentName: trimmed,
        unit: unit || "item",
        illustration: itemIllustration,
        service: service,
        quantity: Math.max(0.1, Number(quantity) || 1),
        unitPrice: Math.max(0, Number(unitPrice) || 0),
      },
    ]);
    setNotice(`${trimmed} added to bill for ${service}.`);
  }

  function lookupBarcode() {
    const code = barcode.trim();
    if (!code) return;
    const garment =
      garments.find((item) => item.barcode === code && item.service === service) ??
      garments.find((item) => item.barcode === code);
    if (!garment) {
      setNotice(`No garment found for barcode ${code}.`);
      return;
    }
    if (garment.service !== service) {
      setService(garment.service);
    }
    addGarment(garment, garment.service);
    setBarcode("");
  }

  function resetCart() {
    clearBillingDraft();
    setCart([]);
    setCustomerId(null);
    setCustomer(EMPTY_CUSTOMER);
    setNotes("");
    setDiscount(0);
    setAmountPaid(0);
    setNotice("");
    setEditingId(null);
    setOrderNumber("");
    setCreatedAt(new Date().toISOString());
    router.replace("/billing");
  }

  function handleSelectCustomer(next: Customer | null) {
    if (!next) {
      setCustomerId(null);
      setCustomer(EMPTY_CUSTOMER);
      return;
    }
    setCustomerId(next.id);
    setCustomer({ name: next.name, mobile: next.mobile, address: next.address });
  }

  function handleSave() {
    if (!cart.length) return;
    let nextCustomerId = customerId;
    if (!nextCustomerId && customer.name.trim() && customer.mobile.trim()) {
      const savedCustomer = saveCustomer({
        name: customer.name.trim(),
        mobile: customer.mobile.trim(),
        address: customer.address.trim(),
      });
      nextCustomerId = savedCustomer.id;
      setCustomerId(savedCustomer.id);
    }

    const totals = calcTotals(cart, discount, amountPaid);
    const saved = saveOrder({
      id: editingId ?? undefined,
      customerId: nextCustomerId,
      customer: {
        name: customer.name || "Walk-in Customer",
        mobile: customer.mobile,
        address: customer.address,
      },
      items: cart,
      notes,
      discount: totals.discountAmount,
      discountPercent: discount,
      amountPaid,
      orderStatus: orders.find((order) => order.id === editingId)?.orderStatus ?? "Received",
    });

    clearBillingDraft();
    setEditingId(saved.id);
    setOrderNumber(saved.orderNumber);
    setCreatedAt(saved.createdAt);
    setNotice(`Saved ${saved.orderNumber}.`);
    router.replace(`/billing?order=${saved.id}`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_410px]">
      <section className="no-print h-full min-h-0 overflow-y-auto p-3 md:p-4">
        {/* Search bar & Barcode */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(200px,0.7fr)]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="PRODUCT NAME"
            className={fieldClass("h-11 uppercase placeholder:normal-case")}
          />
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") lookupBarcode();
            }}
            placeholder="BARCODE (optional)"
            className={fieldClass("h-11")}
          />
        </div>

        {/* Five main service tabs: Dry Cleaning, Ironing, Shoe Cleaning, Household, Laundry */}
        <div className="mt-3 flex gap-1 overflow-x-auto border-b border-slate-200">
          {SERVICES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setService(item)}
              className={`shrink-0 border-b-[3px] px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                service === item
                  ? "border-green-600 text-green-800"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Catalogue & Custom items & Laundry specialized cards */}
        <GarmentGrid
          garments={visible}
          service={service}
          cart={cart}
          onAdd={addGarment}
          onDecrement={decrementGarment}
          onPriceChange={(garment, price) =>
            upsertGarment({
              ...garment,
              price,
              prices: { ...garment.prices, [service]: price },
            })
          }
          onAddCustom={addCustomLine}
        />
      </section>

      {/* Fabklean-inspired compact fixed scrollable right-side cart */}
      <OrderCart
        customers={customers}
        customerId={customerId}
        customer={customer}
        cart={cart}
        discount={discount}
        orderNumber={orderNumber}
        createdAt={createdAt}
        notice={notice}
        onSelectCustomer={handleSelectCustomer}
        onSaveCustomer={saveCustomer}
        onUpdateLine={(id, patch) =>
          setCart((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)))
        }
        onRemoveLine={(id) => setCart((current) => current.filter((line) => line.id !== id))}
        onDiscount={setDiscount}
        onSave={handleSave}
        onPrint={() => {
          if (!cart.length) return;
          window.print();
        }}
        onReset={resetCart}
      />

      {/* Hidden print receipt (no tax) */}
      <Receipt
        orderNumber={orderNumber || "DRAFT"}
        createdAt={createdAt}
        customer={customer}
        items={cart}
        notes={notes}
        discount={discount}
        amountPaid={amountPaid}
      />
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading billing counter…</div>}>
      <NewOrderScreen />
    </Suspense>
  );
}
