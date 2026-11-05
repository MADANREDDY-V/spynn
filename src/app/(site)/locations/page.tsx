import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MapPin, Phone, MessageCircle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Studio Locations",
  description: "Explore SPYNN Dry Cleaning Studio locations across Hyderabad: Narsingi, Kokapet, and Chandanagar with assigned community doorstep care.",
};

const locationDetails = [
  {
    name: "Narsingi Studio",
    slug: "narsingi",
    badge: "Flagship Studio",
    tagline: "Primary Studio for West Hyderabad Communities",
    area: "Narsingi & Tellapur",
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    timings: siteConfig.contact.workingHours,
    communities: [
      "Vessella Meadows",
      "Gardenia Florence Villas",
      "Hallmark Skyrena",
      "Hallmark Treasor",
    ],
    features: [
      "Dedicated community collection vehicles",
      "Same-day steam ironing capability",
      "Bridal & designer wear specialty section",
      "Curtain & heavy furnishing handling",
    ],
  },
  {
    name: "Kokapet Studio",
    slug: "kokapet",
    badge: "Studio",
    tagline: "Serving Luxury High-Rises & Villas",
    area: "Kokapet & Financial District",
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    timings: siteConfig.contact.workingHours,
    communities: [
      "Kokapet Golden Mile Villas",
      "Financial District High-Rises",
      "Gandipet Corridor Residences",
    ],
    features: [
      "Express executive wardrobe collection",
      "High-pressure Italian steam pressing",
      "Shoe and sneaker spa restoration",
      "Doorstep valet collection",
    ],
  },
  {
    name: "Chandanagar Studio",
    slug: "chandanagar",
    badge: "Studio",
    tagline: "Serving Northwest Hyderabad Residences",
    area: "Chandanagar & Miyapur",
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    timings: siteConfig.contact.workingHours,
    communities: [
      "Girija Marvel",
      "Chandanagar Gated Communities",
      "Miyapur Residential Clusters",
    ],
    features: [
      "Comprehensive dry cleaning & wash",
      "Delicate silk saree & lehenga care",
      "Household blanket & quilt laundering",
      "Neighborhood pickup & delivery routes",
    ],
  },
];

export default function LocationsPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* Header Banner */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F3F7FC] via-white to-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider mb-5">
            <MapPin className="h-3.5 w-3.5" />
            Hyderabad Network
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#071B49] leading-tight mb-5 font-heading">
            Our Studio Locations
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Strategically located studios across Hyderabad, dedicated to serving residential communities with punctual doorstep pickup and drop-off.
          </p>
        </div>
      </section>

      {/* Locations List */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col gap-12">
            {locationDetails.map((loc) => (
              <div
                key={loc.slug}
                id={loc.slug}
                className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm hover:shadow-md transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Title & Overview */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0866C5]/10 text-[#0866C5] uppercase tracking-wider">
                        {loc.badge}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {loc.area}
                      </span>
                    </div>

                    <h2 className="text-3xl font-black text-[#071B49] font-heading">
                      {loc.name}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {loc.tagline}
                    </p>

                    <div className="flex flex-col gap-2.5 pt-2 text-sm text-slate-700">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-[#0866C5] shrink-0" />
                        <a href={`tel:${loc.phone.replace(/\s+/g, '')}`} className="font-semibold text-[#071B49] hover:text-[#0866C5]">
                          {loc.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-[#0866C5] shrink-0" />
                        <span className="text-xs text-slate-600">{loc.timings}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4">
                      <a
                        href={`https://wa.me/${loc.whatsapp}?text=Hi%20SPYNN%20${encodeURIComponent(loc.name)},%20I%20would%20like%20to%20arrange%20garment%20care%20for%20my%20community.`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold h-11 px-5 shadow-xs">
                          <MessageCircle className="h-4 w-4 mr-1.5" />
                          Chat on WhatsApp
                        </Button>
                      </a>
                      <a href={`tel:${loc.phone.replace(/\s+/g, '')}`}>
                        <Button variant="outline" className="rounded-full border-slate-200 text-xs font-semibold h-11 px-5 text-[#071B49]">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-[#0866C5]" />
                          Call Studio
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Middle Column: Associated Communities */}
                  <div className="lg:col-span-4 bg-[#F3F7FC] rounded-2xl p-6 flex flex-col gap-3 border border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#071B49] font-heading">
                      Communities Served Directly
                    </h3>
                    <ul className="flex flex-col gap-2 text-sm text-slate-700">
                      {loc.communities.map((comm, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#0866C5] shrink-0" />
                          <span className="font-medium text-[#071B49]">{comm}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2">
                      <Link href="/communities">
                        <span className="text-xs font-bold text-[#0866C5] hover:underline inline-flex items-center gap-1">
                          Find your community in this area
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Key Studio Capabilities */}
                  <div className="lg:col-span-3 flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                      Studio Capabilities
                    </h3>
                    <ul className="flex flex-col gap-2 text-xs text-slate-600">
                      {loc.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#20BCEB] mt-1.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discovery CTA Banner */}
      <section className="py-20 bg-[#F3F7FC] border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#071B49] mb-4 font-heading">
            Want SPYNN in Your Residential Society?
          </h2>
          <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            We partner with apartment owners associations and resident welfare associations to set up seamless pickup points.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/communities">
              <Button className="h-12 px-8 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-semibold shadow-sm text-sm">
                Find Your Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="h-12 px-8 rounded-full border-slate-300 text-[#071B49] font-semibold text-sm hover:bg-white">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
