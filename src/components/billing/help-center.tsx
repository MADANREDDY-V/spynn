"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Search, MessageCircle, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";

// ─── FAQ definitions ────────────────────────────────────────────────────────

type FaqEntry = {
  q: string;
  keywords: string[];
  a: string;
};

const FAQS: FaqEntry[] = [
  {
    q: "How do I create a new bill?",
    keywords: ["create", "new", "bill", "order", "start"],
    a: "Click 'New Order' in the top navigation. Select a service tab (Dry Cleaning, Ironing, Shoe Cleaning, Household, or Laundry), then click any garment card to add it to the bill on the right side.",
  },
  {
    q: "How do I add a garment to the bill?",
    keywords: ["add", "garment", "item", "product", "catalogue"],
    a: "Click the + Add button on any garment card, or click the card itself. The item will appear immediately as a line in the right-side bill panel. You can adjust quantity and price from there.",
  },
  {
    q: "How do I change the price of an item?",
    keywords: ["price", "change", "edit", "update", "rate"],
    a: "On the garment card, edit the 'Rate ₹' field directly. In the bill panel, click the item row to expand it and edit the unit price inline. Price changes on the card update the default price in the catalogue.",
  },
  {
    q: "How do I apply a discount?",
    keywords: ["discount", "offer", "reduce", "deduct"],
    a: "In the draft bill panel on the right, find the '% Discount' field at the bottom. Enter a percentage between 0 and 100. The discount amount and final total update automatically.",
  },
  {
    q: "How do I print a receipt?",
    keywords: ["print", "receipt", "bill", "paper"],
    a: "Click 'Print Bill' in the draft bill panel. Your browser's print dialog will open. The receipt includes order number, customer details, all items, discount, and final total.",
  },
  {
    q: "How do I print garment tags?",
    keywords: ["tag", "label", "garment", "ticket", "print tag"],
    a: "Click the 'Garment Tags' button in the draft bill. A preview will show one tag per garment piece (e.g., 3 shirts = 3 tags numbered 1/3, 2/3, 3/3). Click Print in the preview to print all tags.",
  },
  {
    q: "How do I send the bill via WhatsApp?",
    keywords: ["whatsapp", "share", "mobile", "send", "message"],
    a: "Click the 'WhatsApp' button in the draft bill. This opens WhatsApp Web with a pre-filled receipt message addressed to the customer's mobile number. The message is NOT sent automatically — you confirm and send manually.",
  },
  {
    q: "How do I save an order?",
    keywords: ["save", "order", "confirm", "record"],
    a: "Fill in at least one item, select or add a customer, then click 'Save Order'. A unique order number (e.g., SPYNN-0001) is generated. The draft is cleared and the order is saved to your workspace.",
  },
  {
    q: "How do I search for a customer?",
    keywords: ["customer", "search", "find", "name", "mobile"],
    a: "In the draft bill panel, click 'Select customer'. Type a name or mobile number to search. Existing customers appear in the dropdown. Click '+ Add New' to create a new customer.",
  },
  {
    q: "How do I view order history?",
    keywords: ["history", "orders", "past", "previous", "list"],
    a: "Click 'Orders' in the top navigation. You can search by order number, customer name, or mobile. Filter by status (Received, Processing, Ready, Delivered) and by date range.",
  },
  {
    q: "How do I record a payment?",
    keywords: ["payment", "paid", "cash", "online", "record"],
    a: "In the Orders page, find the order and click the payment button (₹ icon). Enter the amount paid and payment method (Cash, Online, or Split Payment). The payment status updates automatically.",
  },
  {
    q: "How do I add a custom item?",
    keywords: ["custom", "special", "unlisted", "other", "custom item"],
    a: "Scroll to the bottom of the catalogue on any service tab. Fill in the custom item name, quantity, unit, and price, then click '+ Add to Bill'.",
  },
  {
    q: "How do I add laundry services?",
    keywords: ["laundry", "wash", "fold", "iron", "kg", "weight"],
    a: "Click the 'Laundry' service tab. You'll see Wash & Fold and Wash & Iron service cards. Enter the quantity (items or kg) and rate, then click 'Add to Bill'.",
  },
  {
    q: "How do I view analytics?",
    keywords: ["analytics", "revenue", "report", "chart", "stats"],
    a: "Click 'Analytics' in the top navigation. Select a date range (Today, Last 7 Days, This Month, or Custom). Summary cards show total orders, revenue, payments, and service-wise breakdown.",
  },
  {
    q: "How do I manage prices?",
    keywords: ["prices", "catalogue", "manage", "update", "rate list"],
    a: "Click 'Prices' in the top navigation. You can edit the default price, variant, unit, and estimated cost for every catalogue item. Changes take effect immediately in the catalogue.",
  },
  {
    q: "Can multiple staff use the same account?",
    keywords: ["multi", "staff", "user", "account", "login"],
    a: "Each logged-in account has its own separate billing workspace (customers, orders, price overrides). This is a frontend prototype — full multi-user support with server-side isolation will be available in the production version.",
  },
];

// ─── Search FAQ ──────────────────────────────────────────────────────────────

function searchFaqs(query: string): FaqEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return FAQS.slice(0, 6);
  return FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(q) ||
      faq.keywords.some((k) => k.includes(q) || q.includes(k)) ||
      faq.a.toLowerCase().includes(q)
  ).slice(0, 8);
}

// ─── Chat message ─────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text: string;
};

function botReply(userText: string): string {
  const results = searchFaqs(userText);
  if (results.length === 0) {
    return "I couldn't find an answer for that. Please contact SPYNN support or email us at contact@spynn.in for assistance.";
  }
  const top = results[0];
  return top.a;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HelpCenter({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [tab, setTab] = useState<"faq" | "chat">("faq");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "bot-0",
      from: "bot",
      text: "Hi there! 👋 I'm the SPYNN billing assistant. Ask me anything about creating bills, printing tags, recording payments, or using any feature.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filtered = searchFaqs(searchQuery);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleChatSend() {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      from: "user",
      text,
    };
    const reply = botReply(text);
    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      from: "bot",
      text: reply,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setChatInput("");
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl sm:inset-y-auto sm:bottom-4 sm:right-4 sm:top-auto sm:h-[calc(100vh-80px)] sm:max-h-[600px] sm:rounded-xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-emerald-700 px-4 py-3 text-white sm:rounded-t-xl">
        <div className="flex items-center gap-2">
          <Image
            src="/images/spynn-logo.png"
            alt="SPYNN"
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full bg-white p-0.5 object-contain"
          />
          <span className="text-sm font-bold">SPYNN Help Center</span>
        </div>
        <button
          type="button"
          aria-label="Close help center"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/20"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Greeting */}
      <div className="shrink-0 border-b border-slate-100 bg-emerald-50 px-4 py-3">
        <p className="text-sm font-semibold text-emerald-900">Hi there 👋</p>
        <p className="text-xs text-emerald-700 mt-0.5">
          Search our help center for answers or start a conversation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setTab("faq")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            tab === "faq"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Search className="size-3.5" />
          Help Center
        </button>
        <button
          type="button"
          onClick={() => setTab("chat")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            tab === "chat"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <MessageCircle className="size-3.5" />
          Chat with Us
        </button>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === "faq" ? (
          <>
            {/* Search */}
            <div className="shrink-0 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for answers…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  autoFocus
                />
              </div>
            </div>

            {/* FAQ list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
              {filtered.map((faq) => (
                <div key={faq.q} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left text-xs font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                  >
                    <span>{faq.q}</span>
                    {openFaq === faq.q ? (
                      <ChevronDown className="mt-0.5 size-3.5 shrink-0 text-slate-500" />
                    ) : (
                      <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-slate-500" />
                    )}
                  </button>
                  {openFaq === faq.q ? (
                    <div className="border-t border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 leading-relaxed">
                      {faq.a}
                    </div>
                  ) : null}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  <p className="font-medium">No results found</p>
                  <p className="mt-1">Try the Chat tab to ask your question directly.</p>
                </div>
              )}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setTab("chat")}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  Can't find an answer? Start a conversation →
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.from === "user"
                        ? "bg-emerald-700 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Note about chatbot */}
            <div className="shrink-0 border-t border-slate-100 bg-amber-50 px-3 py-1.5">
              <p className="text-[10px] text-amber-700">
                ⚠ This is an instant FAQ chatbot. For assistance, reach us at spynndrycleaning@gmail.com or +91 98666 35661.
              </p>
            </div>

            {/* Chat input */}
            <div className="shrink-0 border-t border-slate-200 bg-white p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleChatSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your question…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40"
                >
                  <MessageCircle className="size-3.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
