import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SPYNN Dry Cleaning Studio | Exceptional Care for Every Fabric",
  description: "Professional garment care, thoughtfully delivered to your community. Dedicated dry cleaning, steam ironing, and fabric restoration across Hyderabad.",
};

const serviceCards = [
  {
    title: "Dry Cleaning",
    slug: "dry-cleaning",
    desc: "Expert solvent-based care for designer suits, delicate silks, ethnic lehengas, and couture garments that protects texture, embellishments, and color depth.",
    icon: <Sparkles className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner2.jpg",
    tags: ["Designer Wear", "Silks & Sarees", "Stain Pre-treatment"],
  },
  {
    title: "Steam Ironing",
    slug: "steam-ironing",
    desc: "Italian high-pressure steam pressing that eradicates microscopic wrinkles, sanitizes deep within the fiber, and delivers a crisp, executive finish.",
    icon: <Wind className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner2.jpg",
    tags: ["High-Pressure Steam", "Zero Shine", "Executive Shirts"],
  },
  {
    title: "Wash & Fold",
    slug: "wash-and-fold",
    desc: "Hygienic, gentle washing with premium hypoallergenic detergents and fabric conditioners. Color-sorted, tumble-dried, and neatly folded for daily comfort.",
    icon: <Waves className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner2.jpg",
    tags: ["Color Sorting", "Hypoallergenic", "Neatly Boxed"],
  },
  {
    title: "Shoe Cleaning",
    slug: "shoe-cleaning",
    desc: "Comprehensive sneaker and footwear rejuvenation. Gentle deep-scrubbing of outsoles, midsoles, uppers, and laces, followed by hygienic deodorization.",
    icon: <Footprints className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner1.jpg",
    tags: ["Sneakers", "Leather Footwear", "Deodorization"],
  },
  {
    title: "Household Cleaning",
    slug: "household-cleaning",
    desc: "Specialized large-drum sanitization for heavy blankets, duvets, comforters, and sofa textiles. Removes deep allergens and restores plush softness.",
    icon: <HomeIcon className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner1.jpg",
    tags: ["Comforters & Quilts", "Anti-Allergen", "Deep Clean"],
  },
  {
    title: "Curtain Cleaning",
    slug: "curtain-cleaning",
    desc: "Gentle restoration for sheer curtains, blackout drapes, and luxury window dressings. Removes accumulated dust, odors, and pollutants without shrinking.",
    icon: <Blinds className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner3.jpg",
    tags: ["Dust-Mite Removal", "No Shrinkage", "Custom Drapes"],
  },
];

const customerJourney = [
  {
    step: "01",
    title: "Find Your Community",
    desc: "Locate your residential society or gated enclave in our community directory to view your assigned SPYNN studio.",
    icon: <Search className="h-6 w-6 text-[#0866C5]" />,
  },
  {
    step: "02",
    title: "Connect with Your Store",
    desc: "Connect directly with your verified neighborhood SPYNN studio via WhatsApp or direct phone call.",
    icon: <MessageCircle className="h-6 w-6 text-[#0866C5]" />,
  },
  {
    step: "03",
    title: "Arrange Your Service",
    desc: "Choose your required garment care services and schedule a convenient doorstep pickup window at your tower.",
    icon: <Truck className="h-6 w-6 text-[#0866C5]" />,
  },
  {
    step: "04",
    title: "Receive Your Garments",
    desc: "Your wardrobe is returned in breathable, studio-grade packaging, crisp, fresh, and ready for your occasion.",
    icon: <CheckCircle2 className="h-6 w-6 text-[#0866C5]" />,
  },
];

const verifiedBenefits = [
  {
    title: "Eco-Friendly Solvents",
    desc: "We prioritize biodegradable, gentle solvent formulations that care for delicate fabric fibers and skin sensitivity.",
  },
  {
    title: "Dedicated Neighborhood Logistics",
    desc: "Reliable, scheduled collection vehicles serving specific gated societies prevent delays and mishandling.",
  },
  {
    title: "Meticulous Fabric Inspection",
    desc: "Every item undergoes multi-point inspection for button integrity, stain mapping, and care-label specifications.",
  },
  {
    title: "Protective Studio Packaging",
    desc: "Garments return on contoured hangers in breathable dust-proof covers, preserving their pressing and shape.",
  },
];

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
          SECTION 1: HERO
          ========================================================================= */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-[#F3F7FC] via-white to-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs md:text-sm tracking-wide">
                <span className="h-2 w-2 rounded-full bg-[#20BCEB]" />
                Premium Garment Care for Gated Communities
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#071B49] leading-[1.12] font-heading">
                Exceptional Care for Every Fabric.
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                Professional garment care, thoughtfully delivered to your community. Experience studio-grade dry cleaning, high-pressure steam ironing, and fabric rejuvenation at your doorstep.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <Link href="/communities">
                  <Button className="w-full sm:w-auto h-13 px-8 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-base shadow-sm hover:shadow-md transition-all">
                    Find Your Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="w-full sm:w-auto h-13 px-8 rounded-full border-slate-300 text-[#071B49] font-bold text-base hover:bg-slate-50 transition-all">
                    Explore Our Services
                  </Button>
                </Link>
              </div>

              {/* Quick Trust Badges */}
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
                  <div className="text-xl md:text-2xl font-black text-[#071B49] font-heading">Delicate</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Silk & Suit Specialists</div>
                </div>
              </div>
            </div>

            {/* Right Column: High Quality Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 lg:aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/70 bg-[#F3F7FC]">
                <Image
                  src="/banner2.jpg"
                  alt="SPYNN garment care specialist delivering clean pressed clothes"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>

              {/* Floating verified badge */}
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
          SECTION 2: BRAND INTRODUCTION
          ========================================================================= */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-6">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5]">
              Welcome to SPYNN Studio
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] leading-tight font-heading">
              A Modern Digital Standard in Community Garment Care.
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal">
              SPYNN Dry Cleaning Studio was created to relieve residents of premium apartment complexes and villa communities from the inconvenience of commercial laundromats. We treat garment care as an artisanal service, pairing advanced cleaning technology with dedicated community routes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-[#071B49] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[#0866C5]" />
                Zero Harsh Bleaches
              </div>
              <div className="flex items-center gap-2 text-sm text-[#071B49] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[#0866C5]" />
                Dedicated Society Pickup
              </div>
              <div className="flex items-center gap-2 text-sm text-[#071B49] font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[#0866C5]" />
                Direct Studio Accountability
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 3: OUR SERVICES (NO PRICES DISPLAYED)
          ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#F3F7FC]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
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
                {/* Service Visual */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Icon */}
                  <div className="absolute bottom-4 left-5 flex items-center gap-2.5">
                    <div className="h-11 w-11 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
                      {service.icon}
                    </div>
                    <span className="text-white font-bold text-lg drop-shadow-sm font-heading">
                      {service.title}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-6 flex flex-col flex-1 justify-between gap-6">
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

                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href={`/services#${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0866C5] hover:text-[#0878E8] transition-colors uppercase tracking-wider"
                    >
                      Explore Service
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 4: WHY CHOOSE SPYNN
          ========================================================================= */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5]">
                Why Choose SPYNN
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] leading-tight font-heading">
                Crafted for Residents Who Value Their Wardrobe.
              </h2>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal">
                Unlike mass garment aggregators, SPYNN operates independent brick-and-mortar studios with trained fabric technicians, standardized processes, and community-first delivery protocols.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {verifiedBenefits.map((benefit, bIdx) => (
                  <div key={bIdx} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#0866C5]/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-[#0866C5]" />
                      </div>
                      <h3 className="font-bold text-sm text-[#071B49] font-heading">{benefit.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link href="/about">
                  <Button className="h-11 px-6 rounded-full bg-[#071B49] hover:bg-[#071B49]/90 text-white font-semibold text-xs tracking-wide">
                    Learn About Our Philosophy
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" className="h-11 px-5 rounded-full text-[#0866C5] font-semibold text-xs hover:bg-[#F3F7FC]">
                    Speak to Our Specialists
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-[#F3F7FC]">
                <Image
                  src="/banner1.jpg"
                  alt="SPYNN upholstery and fabric care specialist"
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
          SECTION 5: HOW IT WORKS
          ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#F3F7FC]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
              Simple 4-Step Process
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] font-heading">
              How SPYNN Works for You.
            </h2>
            <p className="text-slate-600 text-base md:text-lg mt-3">
              Effortless community garment care from discovery to doorstep delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerJourney.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-6"
              >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-[#F3F7FC] flex items-center justify-center">
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
          SECTION 6: COMMUNITIES WE SERVE
          ========================================================================= */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider mb-3">
              <Building2 className="h-3.5 w-3.5" />
              Community Network
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] font-heading">
              Communities We Proudly Serve.
            </h2>
            <p className="text-slate-600 text-base md:text-lg mt-3">
              SPYNN runs dedicated daily routes across Hyderabad’s most prominent gated residential enclaves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {featuredCommunities.map((comm, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-[#F3F7FC]/50 p-6 flex items-start justify-between gap-4 hover:bg-white hover:border-[#0866C5]/50 hover:shadow-md transition-all"
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
                  <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#071B49] hover:bg-[#0866C5] hover:text-white transition-colors shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/communities">
              <Button className="h-13 px-8 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all">
                Find Your Community in the Directory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 7: LOCATIONS
          ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#071B49] text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
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
          SECTION 8: FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
              Got Questions?
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#071B49] font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-2">
              Everything you need to know about SPYNN community garment care.
            </p>
          </div>

          <Accordion className="w-full flex flex-col gap-3">
            <AccordionItem value="faq-1" className="rounded-2xl border border-slate-200 p-2 px-4 bg-[#F3F7FC]/40">
              <AccordionTrigger className="text-left font-bold text-[#071B49] hover:no-underline py-3 text-base font-heading">
                How does SPYNN doorstep community pickup work?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-3">
                Residents in our served communities can connect directly with their assigned SPYNN studio via WhatsApp or phone. Our logistics team schedules a convenient pickup window, collects your garments directly from your flat or designated society point, and delivers them back in protective studio packaging.
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
