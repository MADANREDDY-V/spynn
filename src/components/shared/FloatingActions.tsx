'use client'

import { siteConfig } from "@/config/site";
import { MessageCircle, Phone } from "lucide-react";

export function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Call Button */}
      <a
        href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#0866C5] text-white shadow-lg hover:bg-[#0878E8] transition-all hover:scale-110 active:scale-95"
        aria-label="Call SPYNN Studio"
      >
        <Phone className="h-5 w-5" />
      </a>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20I%20would%20like%20to%20know%20more%20about%20your%20services.`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp with SPYNN Studio"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
