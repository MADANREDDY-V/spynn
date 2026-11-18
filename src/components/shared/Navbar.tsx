'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 py-3.5"
          : "bg-white/90 backdrop-blur-xs py-5 border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          
          {/* Logo on the left */}
          <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="SPYNN Home">
            <div className="relative h-11 w-11 md:h-12 md:w-12 shrink-0">
              <Image
                src="/logo_icon.png"
                alt="SPYNN Logo"
                width={48}
                height={48}
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl md:text-2xl font-black tracking-tight text-[#071B49] leading-none font-heading">
                SPYNN
              </span>
              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.22em] text-[#0866C5] uppercase leading-tight mt-0.5">
                Dry Cleaning Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {siteConfig.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors relative ${
                    isActive
                      ? "text-[#0866C5] font-semibold bg-[#F3F7FC]"
                      : "text-[#071B49]/80 hover:text-[#0866C5] hover:bg-slate-50"
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/communities">
              <Button
                className="rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white shadow-sm hover:shadow-md px-5 h-10 font-semibold text-sm transition-all"
              >
                Find Your Community
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link href="/communities">
              <Button
                size="sm"
                className="rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white text-xs px-3.5 h-9 font-medium"
              >
                Find Community
              </Button>
            </Link>
            <button
              type="button"
              className="p-2 rounded-lg text-[#071B49] hover:bg-[#F3F7FC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0866C5]"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close main menu" : "Open main menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Dropdown — pure CSS transition, no framer-motion */}
      <div
        className={`lg:hidden border-b border-slate-100 bg-white shadow-xl overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="container mx-auto px-4 py-6 flex flex-col gap-3">
          <nav className="flex flex-col gap-1">
            {siteConfig.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "bg-[#F3F7FC] text-[#0866C5] font-semibold"
                      : "text-[#071B49] hover:bg-slate-50"
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>

          <div className="h-px bg-slate-100 my-2" />

          <div className="flex flex-col gap-2.5 pt-1">
            <Link href="/communities" onClick={() => setIsOpen(false)} className="w-full">
              <Button className="w-full h-12 rounded-xl bg-[#0866C5] hover:bg-[#0878E8] text-white font-semibold shadow-sm text-base">
                Find Your Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20I%20would%20like%20to%20know%20more%20about%20your%20services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full h-11 rounded-xl border-slate-200 text-xs font-semibold text-[#071B49]">
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
