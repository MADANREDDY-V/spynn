import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Phone, Mail, Clock, MessageCircle, MapPin, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#071B49] text-white pt-16 pb-10 border-t border-[#0866C5]/20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 group" aria-label="SPYNN Home">
              <div className="relative h-12 w-12 rounded-xl bg-white p-1 shrink-0">
                <Image
                  src="/logo_icon.png"
                  alt="SPYNN Logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-black tracking-tight text-white leading-none font-heading">
                  SPYNN
                </span>
                <span className="text-[10px] font-bold tracking-[0.22em] text-[#20BCEB] uppercase leading-tight mt-1">
                  Dry Cleaning Studio
                </span>
              </div>
            </Link>
            
            <p className="text-white/75 text-sm leading-relaxed max-w-sm">
              Exceptional care for every fabric. Professional garment care, thoughtfully delivered to your residential community across Hyderabad.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20I%20would%20like%20to%20know%20more%20about%20your%20services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a] transition-colors shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Studio
              </a>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors border border-white/10"
              >
                <Phone className="h-3.5 w-3.5 text-[#20BCEB]" />
                Call Directly
              </a>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#20BCEB] font-heading">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2.5 text-sm text-white/80">
              {siteConfig.navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="h-3 w-3 text-[#0866C5]" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Garment Care Services (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#20BCEB] font-heading">
              Our Services
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-white/80">
              {siteConfig.services.map((svc) => (
                <li key={svc.slug}>
                  <Link
                    href={`/services#${svc.slug}`}
                    className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0866C5]" />
                    {svc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations & Studio Contact (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#20BCEB] font-heading">
              Studio Locations
            </h4>
            <div className="flex flex-col gap-2 text-sm text-white/80">
              {siteConfig.locations.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/locations#${loc.slug}`}
                  className="hover:text-white transition-colors flex items-center justify-between py-1 border-b border-white/5"
                >
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#0878E8]" />
                    {loc.name}
                  </span>
                  <span className="text-[11px] text-white/60">{loc.area}</span>
                </Link>
              ))}
            </div>

            <div className="pt-3 flex flex-col gap-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-[#20BCEB] shrink-0 mt-0.5" />
                <span>{siteConfig.contact.workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#20BCEB] shrink-0" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About SPYNN</Link>
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <Link href="/communities" className="hover:text-white transition-colors">Communities</Link>
            <Link href="/locations" className="hover:text-white transition-colors">Locations</Link>
            <Link href="/franchise" className="hover:text-white transition-colors">Franchise</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
