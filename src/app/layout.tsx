import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { FloatingActions } from "@/components/shared/FloatingActions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SPYNN Studio | Premium Dry Cleaning for Gated Communities",
  description: "Professional garment care with FREE Pickup & Doorstep Delivery exclusively for gated communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
        <FloatingActions />
      </body>
    </html>
  );
}
