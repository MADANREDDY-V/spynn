import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceImageCarousel } from "@/components/shared/ServiceImageCarousel";
import { FranchiseEnquiryForm } from "@/components/shared/FranchiseEnquiryForm";
import { SERVICE_IMAGES, HERO_CAROUSEL_IMAGES } from "@/data/serviceImages";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Sparkles,
  Wind,
  Waves,
  Footprints,
  Home as HomeIcon,
  Blinds,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageCircle,
  Truck,
  Search,
  Store,
  Layers,
  Award,
  Users2,
  Check,
  CalendarCheck,
  ClipboardCheck,
  PackageCheck,
  Send,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SPYNN Dry Cleaning Studio | Exceptional Care for Every Fabric",
  description: "Professional garment care designed to keep your clothes, footwear, and home essentials looking their best. Studio dry cleaning, Italian steam ironing, and doorstep community service across Hyderabad.",
};

const serviceCards = [
  {
    title: "Dry Cleaning",
    slug: "dry-cleaning",
    desc: "Artisanal solvent-based care for designer suits, delicate silks, ethnic lehengas, and couture garments that preserves fabric integrity, embellishments, and rich colors.",
    icon: <Sparkles className="h-6 w-6 text-[#0866C5]" />,
    tags: ["Designer Wear", "Silks & Sarees", "Stain Pre-treatment"],
  },
  {
    title: "Steam Ironing",
    slug: "steam-ironing",
    desc: "Italian high-pressure steam pressing that releases microscopic wrinkles, sanitizes deep inside fibers, and provides an executive zero-shine finish.",
    icon: <Wind className="h-6 w-6 text-[#0866C5]" />,
    tags: ["High-Pressure Steam", "Zero Shine", "Executive Shirts"],
  },
  {
    title: "Wash & Fold",
    slug: "wash-and-fold",
    desc: "Hygienic personal batch washing with gentle hypoallergenic detergents and fabric conditioners. Color-sorted, tumble-dried, and neatly folded.",
    icon: <Waves className="h-6 w-6 text-[#0866C5]" />,
    tags: ["Color Sorting", "Hypoallergenic", "Neatly Boxed"],
  },
  {
    title: "Shoe Cleaning",
    slug: "shoe-cleaning",
    desc: "Comprehensive footwear rejuvenation for sneakers and leather shoes. Deep exterior scrubbing, midsole restoration, and hygienic deodorization.",
    icon: <Footprints className="h-6 w-6 text-[#0866C5]" />,
    tags: ["Sneakers", "Leather Shoes", "Deodorization"],
  },
  {
    title: "Household Item Cleaning",
    slug: "household-cleaning",
    desc: "Large-drum sanitization for heavy blankets, duvets, comforters, quilts, and sofa textiles. Extracts deep allergens and restores original fluffiness.",
    icon: <HomeIcon className="h-6 w-6 text-[#0866C5]" />,
    tags: ["Comforters & Quilts", "Anti-Allergen", "Deep Clean"],
  },
  {
    title: "Curtain Cleaning",
    slug: "curtain-cleaning",
    desc: "Gentle restoration for sheer curtains, blackout drapes, and luxury window dressings. Removes accumulated dust and odors with zero shrinkage.",
    icon: <Blinds className="h-6 w-6 text-[#0866C5]" />,
    tags: ["Dust-Mite Removal", "No Shrinkage", "Custom Drapes"],
  },
];

// Section 7: How SPYNN Works (Exact 6-step process requested)
const sixStepProcess = [
  {
    step: "01",
    title: "Schedule a Pickup",
    desc: "Connect via WhatsApp or book online to select a convenient doorstep collection slot at your residential tower.",
    icon: <CalendarCheck className="h-6 w-6 text-[#0866C5]" />,
  },
  {
    step: "02",
    title: "Garment Inspection",
    desc: "Every item is tagged and examined for fabric composition, button safety, and specific stain pre-treatment requirements.",
    icon: <ClipboardCheck className="h-6 w-6 text-[#0866C5]" />,
  },
  {
    step: "03",
    title: "Professional Cleaning",
    desc: "Processed in specialized European eco-solvents or Italian high-pressure finishing machines calibrated to each fabric.",
    icon: <Sparkles className="h-6 w-6 text-[#0866C5]" />,
  },
  {
    step: "04",
    title: "Quality Check",
    desc: "Meticulous multi-point quality audit ensuring spotless finishing, intact seams, and flawless crease alignment.",
    icon: <ShieldCheck className="h-6 w-6 text-[#0866C5]" />,
  },
  {
    step: "05",
    title: "Packaging",
    desc: "Carefully placed on contoured studio hangers or bespoke boxed folds with breathable dust-proof protective covers.",
    icon: <PackageCheck className="h-6 w-6 text-[#0866C5]" />,
  },
  {
    step: "06",
    title: "Delivery",
    desc: "Returned safely to your doorstep by verified community logistics personnel, fresh and ready to wear.",
    icon: <Truck className="h-6 w-6 text-[#0866C5]" />,
  },
];

// Section 8: Why Choose SPYNN (Clean Editorial Cards)
const whyChooseReasons = [
  {
    title: "Professional Garment Care",
    desc: "Specialized solvent formulations and Italian vacuum finishing that preserve color depth, fabric drape, and fiber longevity.",
    icon: <Award className="h-5 w-5 text-[#0866C5]" />,
  },
  {
    title: "Multiple Cleaning Services",
    desc: "Complete wardrobe and household solutions under one roof—from couture dry cleaning to shoe spa and curtain restoration.",
    icon: <Layers className="h-5 w-5 text-[#0866C5]" />,
  },
  {
    title: "Convenient Doorstep Experience",
    desc: "Scheduled pickup and drop-off tailored to gated communities and residential towers, saving you city travel and time.",
    icon: <Truck className="h-5 w-5 text-[#0866C5]" />,
  },
  {
    title: "Careful Handling of Garments",
    desc: "Individual stain mapping, protective button covers, and gentle non-chlorinated chemistry protect your precious investments.",
    icon: <ShieldCheck className="h-5 w-5 text-[#0866C5]" />,
  },
  {
    title: "Customer-Focused Service",
    desc: "Direct communication with verified studio staff via WhatsApp and phone ensures accountable, responsive service.",
    icon: <Users2 className="h-5 w-5 text-[#0866C5]" />,
  },
  {
    title: "Local Studio Presence",
    desc: "Brick-and-mortar studios located in Narsingi, Kokapet, and Chandanagar ensuring fast turnaround and neighborhood trust.",
    icon: <Store className="h-5 w-5 text-[#0866C5]" />,
  },
];

// Section 9: Featured Initial Communities
const featuredCommunities = [
  { name: "Gardenia Florence Villas", location: "Tellapur", assignedStore: "Narsingi Studio" },
  { name: "Hallmark Skyrena", location: "Puppalaguda", assignedStore: "Narsingi Studio" },
  { name: "Hallmark Treasor", location: "Alkapur Township", assignedStore: "Narsingi Studio" },
  { name: "Vessella Meadows", location: "Narsingi", assignedStore: "Narsingi Studio" },
  { name: "Girija Marvel", location: "Chandanagar", assignedStore: "Chandanagar Studio" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">

      {/* =========================================================================
          SECTION 1: HERO SECTION (With 2s Carousel & Clear CTAs)
          ========================================================================= */}
      <section className="relative pt-24 pb-14 md:pt-36 md:pb-20 overflow-hidden bg-gradient-to-b from-[#F3F7FC] via-white to-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography & Action Buttons */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs md:text-sm tracking-wide">
                <span className="h-2 w-2 rounded-full bg-[#20BCEB]" />
                Professional Garment Care Studio
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#071B49] leading-[1.12] font-heading">
                Exceptional Care for Every Fabric.
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                Professional garment care designed to keep your clothes, footwear and home essentials looking their best.
              </p>

              {/* Exact Requested CTAs: Explore Our Services & Book a Pickup */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/services">
                  <Button className="w-full sm:w-auto h-13 px-8 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-base shadow-sm hover:shadow-md transition-all">
                    Explore Our Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/book">
                  <Button variant="outline" className="w-full sm:w-auto h-13 px-8 rounded-full border-slate-300 text-[#071B49] font-bold text-base hover:bg-slate-50 transition-all">
                    Book a Pickup
                  </Button>
                </Link>
              </div>

              {/* Quick Verified Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-xl">
                <div>
                  <div className="text-xl md:text-2xl font-black text-[#071B49] font-heading">3 Studios</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Narsingi, Kokapet, Chandanagar</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-[#0866C5] font-heading">Doorstep</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Scheduled Society Pickup</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-[#071B49] font-heading">6 Services</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Full Fabric & Home Care</div>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Photography Carousel */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 lg:aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/70 bg-[#F3F7FC]">
                <ServiceImageCarousel
                  images={HERO_CAROUSEL_IMAGES}
                  title="SPYNN Premium Garment Care"
                  aspectRatioClass="w-full h-full"
                  priority={true}
                  intervalMs={2000}
                  showArrows={true}
                  showTag={true}
                  showIndicators={true}
                />
              </div>

              {/* Verified Badge */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 hidden sm:flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0866C5]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6 text-[#0866C5]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#071B49]">Certified Care</div>
                  <div className="text-[11px] text-slate-500">Eco-friendly solvent sanitization</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 2: TRUST AND BRAND INTRODUCTION
          ========================================================================= */}
      <section className="py-14 md:py-20 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-5">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5]">
              Welcome to SPYNN Studio
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] leading-tight font-heading">
              A Modern Standard in Professional Garment Care.
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal">
              SPYNN Dry Cleaning Studio combines specialized fabric-care technology with reliable neighborhood service. Operating dedicated studios in Narsingi, Kokapet, and Chandanagar, we provide convenient doorstep collection and meticulous care for everyday wardrobes, fine designer garments, and home textiles.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-3">
              <div className="flex items-center gap-2 text-sm text-[#071B49] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[#0866C5]" />
                Professional Fabric Care
              </div>
              <div className="flex items-center gap-2 text-sm text-[#071B49] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[#0866C5]" />
                Dedicated Society Pickup
              </div>
              <div className="flex items-center gap-2 text-sm text-[#071B49] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[#0866C5]" />
                Local Studio Presence
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 3: SERVICES SECTION (All 6 Distinct Services with 2s Carousel)
          ========================================================================= */}
      <section className="py-14 md:py-20 bg-[#F3F7FC]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="max-w-2xl">
              <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
                Our Services
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] leading-tight font-heading">
                Comprehensive Care for Every Wardrobe.
              </h2>
              <p className="text-slate-600 text-base md:text-lg mt-3">
                Tailored fabric treatments designed to extend the life, sheen, and comfort of your finest textiles.
              </p>
            </div>
            <Link href="/services">
              <Button variant="outline" className="rounded-full border-slate-300 text-[#071B49] font-bold hover:bg-white text-sm h-11 px-6 shrink-0">
                View Full Services Page
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCards.map((service, index) => (
              <Card
                key={index}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Service Visual Carousel */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <ServiceImageCarousel
                    images={SERVICE_IMAGES[service.slug] || []}
                    title={service.title}
                    aspectRatioClass="w-full h-full"
                    intervalMs={2000}
                    overlayGradient={true}
                    priority={index === 0}
                  >
                    {/* Floating Icon & Title */}
                    <div className="absolute bottom-4 left-5 flex items-center gap-2.5 z-10 pointer-events-auto">
                      <div className="h-11 w-11 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
                        {service.icon}
                      </div>
                      <span className="text-white font-bold text-lg drop-shadow-sm font-heading">
                        {service.title}
                      </span>
                    </div>
                  </ServiceImageCarousel>
                </div>

                {/* Card Content */}
                <CardContent className="p-6 flex flex-col flex-1 justify-between gap-5">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {service.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {service.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F3F7FC] text-[#071B49]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/services#${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0866C5] hover:text-[#0878E8] transition-colors uppercase tracking-wider"
                    >
                      Service Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link href="/book">
                      <Button size="sm" variant="ghost" className="h-8 px-3 rounded-full text-xs font-semibold text-[#071B49] hover:bg-slate-100">
                        Book Pickup
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 4: HOW SPYNN WORKS (Exact 6-step process requested)
          ========================================================================= */}
      <section className="py-14 md:py-20 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
              Our 6-Step Workflow
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] font-heading">
              How SPYNN Works.
            </h2>
            <p className="text-slate-600 text-base md:text-lg mt-3">
              A transparent, meticulous care journey from doorstep collection to final handover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sixStepProcess.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F3F7FC]/50 rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:bg-white hover:shadow-md transition-all flex flex-col justify-between gap-5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-xs border border-slate-200/70 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-200 font-heading">
                    {item.step}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[#071B49] font-heading">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 5: WHY CHOOSE SPYNN (Clean Editorial Grid)
          ========================================================================= */}
      <section className="py-14 md:py-20 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5]">
                The SPYNN Standard
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] leading-tight font-heading">
                Why Choose SPYNN.
              </h2>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal">
                Crafted for residents and families who value their wardrobe. We pair modern garment technology with dedicated local studio accountability.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {whyChooseReasons.map((reason, rIdx) => (
                  <div key={rIdx} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[#0866C5]/10 flex items-center justify-center shrink-0">
                        {reason.icon}
                      </div>
                      <h3 className="font-bold text-sm text-[#071B49] font-heading">{reason.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-9">
                      {reason.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link href="/about">
                  <Button className="h-11 px-6 rounded-full bg-[#071B49] hover:bg-[#071B49]/90 text-white font-semibold text-xs tracking-wide">
                    About Our Philosophy
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" className="h-11 px-5 rounded-full text-[#0866C5] font-semibold text-xs hover:bg-[#F3F7FC]">
                    Contact Our Studio
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-[#F3F7FC]">
                <Image
                  src="/banner1.jpg"
                  alt="SPYNN upholstery, garment inspection, and fabric care specialist"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 6: COMMUNITIES WE SERVE (Community search & initial enclaves)
          ========================================================================= */}
      <section className="py-14 md:py-20 bg-[#F3F7FC] border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider mb-3">
              <Building2 className="h-3.5 w-3.5" />
              Community Network
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] font-heading">
              Communities We Proudly Serve.
            </h2>
            <p className="text-slate-600 text-base md:text-lg mt-3">
              SPYNN operates scheduled daily collection routes across prominent gated residential enclaves in Hyderabad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {featuredCommunities.map((comm, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex items-start justify-between gap-4 hover:border-[#0866C5]/50 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#20BCEB]" />
                    <span className="text-[11px] font-bold text-[#0866C5] uppercase tracking-wider">{comm.location}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#071B49] font-heading mt-1">{comm.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Assigned: {comm.assignedStore}</p>
                </div>
                <Link href="/communities">
                  <div className="h-8 w-8 rounded-full bg-[#F3F7FC] border border-slate-200 flex items-center justify-center text-[#071B49] hover:bg-[#0866C5] hover:text-white transition-colors shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/communities">
              <Button className="h-12 px-8 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all">
                Search All Communities in the Directory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 7: LOCATIONS SECTION
          ========================================================================= */}
      <section className="py-14 md:py-20 bg-[#071B49] text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-[#20BCEB] mb-2">
              Our Physical Studios
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white font-heading">
              Visit or Connect with Your Studio.
            </h2>
            <p className="text-white/70 text-base md:text-lg mt-3">
              Independent SPYNN studios located across key Hyderabad residential corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {siteConfig.locations.map((loc) => (
              <div
                key={loc.slug}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col justify-between gap-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#20BCEB]/20 text-[#20BCEB] uppercase tracking-wider">
                      {loc.badge}
                    </span>
                    <span className="text-xs text-white/50">{loc.area}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-white font-heading mt-1">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {loc.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-white/10 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#20BCEB]" />
                    <span>{siteConfig.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#20BCEB]" />
                    <span>{siteConfig.contact.workingHours}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/locations#${loc.slug}`}>
                    <Button variant="outline" className="w-full rounded-full border-white/20 text-white hover:bg-white hover:text-[#071B49] text-xs font-bold h-10">
                      View Studio Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 8: NEW FRANCHISE OPPORTUNITY SECTION (Item 11 in Prompt)
          ========================================================================= */}
      <section className="py-14 md:py-20 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-[#F3F7FC] via-white to-[#F3F7FC]/50 p-8 sm:p-12 lg:p-16 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Franchise Pitch */}
              <div className="lg:col-span-6 flex flex-col gap-6 text-left">
                <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider">
                  <Store className="h-4 w-4" />
                  Franchise Opportunity
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#071B49] leading-tight font-heading">
                  Build a Business in Professional Garment Care.
                </h2>

                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal">
                  Explore the opportunity to grow with SPYNN and be part of a professional garment-care brand.
                </p>

                {/* Why Partner with SPYNN Pillars */}
                <div className="flex flex-col gap-3.5 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#0866C5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-[#071B49]">Brand Identity:</span>
                      <span className="text-xs text-slate-600 ml-1">Distinct studio aesthetics, premium positioning, and residential trust.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#0866C5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-[#071B49]">Operational Guidance:</span>
                      <span className="text-xs text-slate-600 ml-1">Practical training in fabric chemistry, machine handling, and pressing.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#0866C5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-[#071B49]">Service Standards:</span>
                      <span className="text-xs text-slate-600 ml-1">Standardized inspection protocols and multi-point quality checkpoints.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#0866C5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-[#071B49]">Technology-Enabled Operations:</span>
                      <span className="text-xs text-slate-600 ml-1">Order tracking workflows, route management, and customer messaging.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#0866C5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-[#071B49]">Business Development Support:</span>
                      <span className="text-xs text-slate-600 ml-1">Gated society onboarding playbooks and neighborhood launch support.</span>
                    </div>
                  </div>
                </div>

                {/* Franchise CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Link href="/franchise">
                    <Button className="h-11 px-6 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-xs tracking-wide shadow-sm">
                      Explore Franchise Opportunities
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20I%20am%20interested%20in%20a%20franchise%20partnership.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="h-11 px-5 rounded-full border-slate-300 text-[#071B49] font-bold text-xs hover:bg-white">
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" />
                      Enquire via WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              {/* Right Column: Clean Inline Enquiry Form */}
              <div className="lg:col-span-6 w-full">
                <Card className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-[#071B49] font-heading">
                      Quick Franchise Enquiry
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Share your details to connect with our franchise expansion desk.
                    </p>
                  </div>
                  <FranchiseEnquiryForm />
                </Card>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
              Got Questions?
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#071B49] font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-2">
              Everything you need to know about SPYNN services, pickup schedules, and franchise opportunities.
            </p>
          </div>

          <Accordion className="w-full flex flex-col gap-3">
            <AccordionItem value="faq-1" className="rounded-2xl border border-slate-200 p-2 px-4 bg-[#F3F7FC]/40">
              <AccordionTrigger className="text-left font-bold text-[#071B49] hover:no-underline py-3 text-base font-heading">
                How does SPYNN doorstep community pickup work?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-3">
                Residents in our served communities can connect directly with their assigned SPYNN studio via WhatsApp or book online. Our logistics team schedules a pickup window, collects your garments directly from your flat or designated society point, and delivers them back in protective studio packaging.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="rounded-2xl border border-slate-200 p-2 px-4 bg-[#F3F7FC]/40">
              <AccordionTrigger className="text-left font-bold text-[#071B49] hover:no-underline py-3 text-base font-heading">
                What is the typical turnaround time for dry cleaning and steam ironing?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-3">
                Standard dry cleaning and laundry services take between 48 to 72 hours to ensure thorough fabric inspection, multi-stage cleaning, and pressing. Steam ironing daily wear is typically completed within 24 to 48 hours. Specialized bridal wear, heavy carpets, and curtains may require 4 to 5 days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="rounded-2xl border border-slate-200 p-2 px-4 bg-[#F3F7FC]/40">
              <AccordionTrigger className="text-left font-bold text-[#071B49] hover:no-underline py-3 text-base font-heading">
                What cleaning solvents and technologies do you use?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-3">
                We use eco-friendly, biodegradable dry cleaning solvents alongside Italian high-pressure steam finishing equipment. We do not use harsh chlorinated compounds that degrade natural silk or wool fibers, ensuring your garments maintain their original color brilliance and hand feel.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="rounded-2xl border border-slate-200 p-2 px-4 bg-[#F3F7FC]/40">
              <AccordionTrigger className="text-left font-bold text-[#071B49] hover:no-underline py-3 text-base font-heading">
                How do I explore a SPYNN franchise in my city or locality?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-3">
                You can submit your details using the franchise enquiry form on our website or visit our dedicated <Link href="/franchise" className="text-[#0866C5] font-semibold underline">Franchise Page</Link>. Our expansion team will evaluate your preferred area and connect directly for an exploratory consultation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="rounded-2xl border border-slate-200 p-2 px-4 bg-[#F3F7FC]/40">
              <AccordionTrigger className="text-left font-bold text-[#071B49] hover:no-underline py-3 text-base font-heading">
                What if my apartment or villa community is not listed yet?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-3">
                We are actively expanding across Hyderabad. You can use our &ldquo;Find Your Community&rdquo; tool to submit a community launch request, and our partnerships team will coordinate with your resident welfare association (RWA) or apartment management committee.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </section>

    </div>
  );
}
