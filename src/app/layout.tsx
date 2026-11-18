import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spynn.in"),
  title: {
    default: "SPYNN Dry Cleaning Studio | Exceptional Care for Every Fabric",
    template: "%s | SPYNN Dry Cleaning Studio",
  },
  description: "Professional garment care thoughtfully delivered to your residential community across Hyderabad. Doorstep service for Narsingi, Kokapet, and Chandanagar.",
  keywords: [
    "SPYNN",
    "SPYNN Dry Cleaning Studio",
    "Dry Cleaning Hyderabad",
    "Dry Cleaning Narsingi",
    "Dry Cleaning Kokapet",
    "Dry Cleaning Chandanagar",
    "Premium Garment Care",
    "Steam Ironing Hyderabad",
  ],
  authors: [{ name: "SPYNN Dry Cleaning Studio" }],
  creator: "SPYNN",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://spynn.in",
    siteName: "SPYNN Dry Cleaning Studio",
    title: "SPYNN Dry Cleaning Studio | Exceptional Care for Every Fabric",
    description: "Professional garment care, thoughtfully delivered to your community.",
    images: [
      {
        url: "/images/spynn-logo.png",
        width: 1254,
        height: 1254,
        alt: "SPYNN Dry Cleaning Studio",
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#0866C5]/20 selection:text-[#071B49]`}
      >
        {children}
      </body>
    </html>
  );
}
