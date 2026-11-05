import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Wind,
  Waves,
  Footprints,
  Home as HomeIcon,
  Blinds,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Garment Care Services",
  description: "Explore SPYNN Dry Cleaning Studio services: Dry Cleaning, Steam Ironing, Wash & Fold, Shoe Cleaning, Household Item Cleaning, and Curtain Cleaning in Hyderabad.",
};

const fullServices = [
  {
    id: "dry-cleaning",
    title: "1. Premium Dry Cleaning",
    shortTitle: "Dry Cleaning",
    subtitle: "Artisanal Solvent Care for Fine Fabrics & Designer Wardrobes",
    icon: <Sparkles className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner2.jpg",
    description:
      "Our flagship dry cleaning service uses eco-friendly, biodegradable solvents formulated specifically to protect the natural texture, tensile strength, and color brilliance of delicate luxury garments. Every piece receives individual stain mapping, protective button shielding, and hand-finishing by master pressers.",
    idealFor: [
      "Designer suits & tuxedos",
      "Silk sarees & bridal lehengas",
      "Sherwanis & embroidered kurtas",
      "Cashmere, merino wool & blazers",
      "Fine evening gowns & formal wear",
    ],
    highlights: [
      "Gentle European eco-solvents that prevent chemical odor",
      "Specialized pre-spotting for oil, protein, and tannin stains",
      "Protective covers for delicate pearls, sequins, and buttons",
      "Contoured shoulder hanger presentation with breathable covers",
    ],
  },
  {
    id: "steam-ironing",
    title: "2. High-Pressure Steam Ironing",
    shortTitle: "Steam Ironing",
    subtitle: "Italian Steam Finishing for Crisp, Wrinkle-Free Daily Confidence",
    icon: <Wind className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner2.jpg",
    description:
      "Unlike domestic dry irons that scorch delicate fibers and create unsightly fabric shine, our Italian vacuum boards and high-pressure steam boilers inject pure, moisture-controlled steam through fabrics. This releases deep creases while preserving the cloth's natural loft and drape.",
    idealFor: [
      "Executive formal shirts & trousers",
      "Linen shirts & summer kurtas",
      "Pleated formal trousers & skirts",
      "Cotton & chanderi sarees",
      "Daily office and formal wear",
    ],
    highlights: [
      "Teflon-coated iron shoes that prevent shine marks on dark cloth",
      "Vacuum suction tables that set razor-sharp, durable creases",
      "Deep thermal sanitization killing 99.9% of bacteria and allergens",
      "Delivered on sturdy hangers or bespoke fold with collar supports",
    ],
  },
  {
    id: "wash-and-fold",
    title: "3. Wash & Fold",
    shortTitle: "Wash & Fold",
    subtitle: "Hygienic Laundry with Hypoallergenic Fabric Conditioners",
    icon: <Waves className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner2.jpg",
    description:
      "Elevate your household laundry routine. We separate every load by fabric weight and color palette, washing with pH-balanced, skin-safe detergents. Tumble-dried at calibrated temperatures to prevent shrinkage, every item is meticulously folded and boxed for immediate wardrobe storage.",
    idealFor: [
      "Daily tees, polo shirts & denim",
      "Gym wear & activewear fabrics",
      "Bed linens, pillowcases & towels",
      "Loungewear & children's everyday clothing",
    ],
    highlights: [
      "100% segregated personal batch washing (never combined with others)",
      "Zero harsh chlorine bleach or artificial dye brighteners",
      "Softening cycle that leaves cotton fluffy and towels plush",
      "Carefully squared and stacked in moisture-barrier packaging",
    ],
  },
  {
    id: "shoe-cleaning",
    title: "4. Shoe & Sneaker Spa",
    shortTitle: "Shoe Cleaning",
    subtitle: "Deep Restoration, Cleansing & Deodorization for Fine Footwear",
    icon: <Footprints className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner1.jpg",
    description:
      "Footwear endures the toughest wear. Our shoe technicians perform comprehensive interior and exterior cleaning. Midsoles and outsoles are scrubbed free of oxidation and road grime, while delicate upper materials like suede, leather, and Flyknit are treated with material-safe cleaners and UV sanitized.",
    idealFor: [
      "Designer & athletic sneakers",
      "Formal leather oxfords & derbies",
      "Suede loafers & Chelsea boots",
      "Canvas slip-ons & casual footwear",
    ],
    highlights: [
      "Hand-scrubbed midsoles and outsoles with anti-yellowing agents",
      "Interior antibacterial and antifungal deodorization treatment",
      "Suede nap lifting, conditioning, and color rejuvenation",
      "Freshly washed laces and shape-preserving internal shoe trees",
    ],
  },
  {
    id: "household-cleaning",
    title: "5. Household Item Cleaning",
    shortTitle: "Household Items",
    subtitle: "High-Capacity Sanitization for Heavy Bedding & Home Textiles",
    icon: <HomeIcon className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner1.jpg",
    description:
      "Standard home washing machines cannot properly clean or rinse heavy household items without damaging drum bearings and leaving detergent residues. Our large-capacity studio drums thoroughly wash, sanitize, and restore heavy winter blankets, quilts, and sofa upholstery textiles.",
    idealFor: [
      "Winter duvets & microfiber quilts",
      "Heavy wool blankets & razais",
      "Mattress protectors & cushion covers",
      "Sofa throws & decorative upholstery covers",
    ],
    highlights: [
      "Commercial large-drum equipment allowing complete water circulation",
      "Thermal mite and allergen extraction for healthier home sleeping",
      "Even loft redistribution to avoid clumping inside duvets",
      "Vacuum or breathable zippered storage packaging for closet storage",
    ],
  },
  {
    id: "curtain-cleaning",
    title: "6. Curtain & Drape Cleaning",
    shortTitle: "Curtain Cleaning",
    subtitle: "Dust-Mite Eradication & Fiber Restoration for Window Drapes",
    icon: <Blinds className="h-6 w-6 text-[#0866C5]" />,
    image: "/banner3.jpg",
    description:
      "Curtains filter airborne dust and pollutants year-round, gradually degrading the fabric fibers. We provide gentle cleaning specifically calibrated to avoid shrinkage and fabric warping. Whether delicate sheer organza or heavy velvet blackout drapes, your curtains return fresh and beautifully pleated.",
    idealFor: [
      "Sheer & lace window drapery",
      "Heavy blackout bedroom curtains",
      "Velvet & jacquard living room portieres",
      "Roman blinds & tailored window valances",
    ],
    highlights: [
      "Pre-inspection for UV sun-fading and delicate seam integrity",
      "Shrink-free moisture control cycle tailored to fabric composition",
      "Static-neutralizing rinse that repels future dust accumulation",
      "Careful fold-pressing along existing pleat and grommet lines",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* Header Banner */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F3F7FC] via-white to-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Studio Services
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#071B49] leading-tight mb-5 font-heading">
            Our Garment Care Services
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From bespoke silk dry cleaning to Italian steam pressing and shoe restoration, explore comprehensive fabric care thoughtfully delivered to your doorstep.
          </p>

          {/* Quick Nav Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 max-w-4xl mx-auto">
            {fullServices.map((svc) => (
              <a
                key={svc.id}
                href={`#${svc.id}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-[#071B49] hover:bg-[#0866C5] hover:text-white hover:border-[#0866C5] transition-all shadow-2xs"
              >
                {svc.shortTitle}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Individual Detailed Service Sections */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col gap-20 md:gap-28">
            {fullServices.map((service, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={service.id}
                  id={service.id}
                  className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 md:p-12 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isEven ? "lg:flex-row-reverse" : ""}`}>
                    
                    {/* Visual Side */}
                    <div className={`lg:col-span-5 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                      <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-100">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4 h-11 w-11 rounded-xl bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md">
                          {service.icon}
                        </div>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className={`lg:col-span-7 flex flex-col gap-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0866C5]">
                          Specialized Service
                        </span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#071B49] mt-1 font-heading">
                          {service.title}
                        </h2>
                        <p className="text-sm md:text-base font-medium text-[#0866C5] mt-1">
                          {service.subtitle}
                        </p>
                      </div>

                      <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                        {service.description}
                      </p>

                      {/* Ideal For & Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#071B49] font-heading">
                            Recommended For
                          </h3>
                          <ul className="flex flex-col gap-1.5 text-xs text-slate-600">
                            {service.idealFor.map((item, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0866C5] shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-col gap-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#071B49] font-heading">
                            Studio Standards
                          </h3>
                          <ul className="flex flex-col gap-1.5 text-xs text-slate-600">
                            {service.highlights.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#0878E8] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Service Actions */}
                      <div className="flex flex-wrap items-center gap-3 pt-3">
                        <Link href="/communities">
                          <Button className="h-11 px-6 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-semibold text-xs tracking-wide shadow-xs">
                            Find Your Community to Arrange Service
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <a
                          href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20I%20would%20like%20to%20know%20more%20about%20your%20${encodeURIComponent(service.shortTitle)}%20service.`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" className="h-11 px-5 rounded-full border-slate-200 text-xs font-semibold text-[#071B49] hover:bg-slate-50">
                            <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-[#25D366]" />
                            WhatsApp Inquiry
                          </Button>
                        </a>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Discovery Banner */}
      <section className="py-20 bg-[#F3F7FC] border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <div className="h-12 w-12 rounded-2xl bg-[#0866C5]/10 flex items-center justify-center mx-auto mb-4 text-[#0866C5]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#071B49] mb-4 font-heading">
            Convenient Doorstep Pickup Across Gated Communities
          </h2>
          <p className="text-base text-slate-600 mb-8 max-w-2xl mx-auto">
            Discover if your residential enclave is currently served by our Narsingi, Kokapet, or Chandanagar studio collection vehicles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/communities">
              <Button className="h-12 px-8 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-semibold text-sm shadow-sm">
                Find Your Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="h-12 px-8 rounded-full border-slate-300 text-[#071B49] font-semibold text-sm hover:bg-white">
                Contact Studio Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
