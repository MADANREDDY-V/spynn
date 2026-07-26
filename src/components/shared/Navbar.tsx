'use client'

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Services", href: "/services" },
  { title: "Pricing", href: "/pricing" },
  { title: "Communities", href: "/communities" },
  { title: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-slate-950/80" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-24 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.jpg" alt="SPYNN Logo" width={240} height={80} className="h-20 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  pathname === link.href ? "text-primary dark:text-white" : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/book">
              <Button className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white">
                Book Pickup
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-950 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-medium transition-colors ${
                    pathname === link.href ? "text-primary dark:text-white" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {link.title}
                </Link>
              ))}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
              <Link href="/book" className="w-full">
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white" size="lg">
                  Book Pickup
                </Button>
              </Link>
              <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="w-full">
                <Button variant="outline" className="w-full rounded-full" size="lg">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Call Us
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
