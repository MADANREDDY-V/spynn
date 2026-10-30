import type { Metadata } from "next";
import { BillingProvider } from "@/components/billing/billing-store";
import { BillingShell } from "@/components/billing/billing-shell";

export const metadata: Metadata = {
  title: "Billing | SPYNN Dry Cleaning Studio",
  description: "Staff billing counter for SPYNN Dry Cleaning Studio.",
  robots: { index: false, follow: false },
};

export default function BillingGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BillingProvider>
      <BillingShell>{children}</BillingShell>
    </BillingProvider>
  );
}
