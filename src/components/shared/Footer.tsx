import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ComingSoonModal } from "./ComingSoonModal";

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image src="/logo_icon.png" alt="SPYNN Logo" width={64} height={64} className="h-12 w-12 md:h-14 md:w-14 object-contain transition-transform group-hover:scale-105" />
              <div className="flex flex-col justify-center">
                <span className="text-2xl md:text-3xl font-black tracking-tighter text-[#0b1742] dark:text-white leading-none">
                  SPYNN
                </span>
                <span className="text-[0.6rem] md:text-xs font-bold tracking-[0.2em] text-[#00a3e0] uppercase leading-tight mt-0.5">
                  Dry Cleaning Studio
                </span>
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-primary dark:text-white">Quick Links</h4>
            <nav className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Link href="/services" className="hover:text-accent transition-colors">Our Services</Link>
              <Link href="/pricing" className="hover:text-accent transition-colors">Price List</Link>
              <Link href="/communities" className="hover:text-accent transition-colors">Communities</Link>
              <ComingSoonModal>
                <button className="text-left hover:text-accent transition-colors">Book Pickup</button>
              </ComingSoonModal>
              <Link href="/status" className="hover:text-accent transition-colors">Order Status</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-primary dark:text-white">Legal</h4>
            <nav className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link>
              <Link href="/refund" className="hover:text-accent transition-colors">Refund Policy</Link>
              <Link href="/cancellation" className="hover:text-accent transition-colors">Cancellation Policy</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-primary dark:text-white">Contact Us</h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="hover:text-accent transition-colors">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent transition-colors">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>{siteConfig.contact.workingHours}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href={siteConfig.social.instagram} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Instagram</a>
            <a href={siteConfig.social.facebook} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
