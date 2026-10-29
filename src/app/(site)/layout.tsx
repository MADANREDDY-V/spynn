import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { FloatingActions } from "@/components/shared/FloatingActions";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
