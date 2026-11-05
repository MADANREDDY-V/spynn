import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Sparkles, ShieldCheck, HeartHandshake, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about SPYNN Dry Cleaning Studio — our craft, technology-enabled garment care, and dedication to residential communities across Hyderabad.",
};

const coreValues = [
  {
    icon: <Sparkles className="h-6 w-6 text-[#0866C5]" />,
    title: "Master Fabric Care",
    desc: "Every garment receives expert inspection, custom stain pre-treatment, and eco-friendly European solvent care tailored to its unique fibers.",
  },
  {
    icon: <Building2 className="h-6 w-6 text-[#0866C5]" />,
    title: "Community Dedicated",
    desc: "We integrate directly with gated communities and residential towers, offering scheduled doorstep pickup and drop-off that respects your time.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-[#0866C5]" />,
    title: "Uncompromising Integrity",
    desc: "Transparent handling, zero aggressive chemicals, and hospital-grade sanitization standards across all studio cleaning cycles.",
  },
  {
    icon: <HeartHandshake className="h-6 w-6 text-[#0866C5]" />,
    title: "White-Glove Service",
    desc: "From gentle hand-finishing to custom breathable garment covers, your wardrobe returns crisp, fresh, and ready for your most important moments.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-[#F3F7FC] via-white to-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              The SPYNN Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#071B49] leading-[1.15] mb-6 font-heading">
              Redefining Garment Care for Modern Communities.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
              SPYNN Dry Cleaning Studio was founded with a singular conviction: luxury fabric care should be effortless, precise, and integrated into modern residential living.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Narrative Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-[#F3F7FC]">
                <Image
                  src="/banner2.jpg"
                  alt="SPYNN studio specialist delivering garments"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 bg-[#071B49] text-white p-5 rounded-2xl shadow-xl max-w-xs border border-white/10">
                <Building2 className="h-8 w-8 text-[#20BCEB] shrink-0" />
                <div>
                  <div className="font-bold text-sm">Gated Community Focus</div>
                  <div className="text-xs text-white/70">Doorstep pickup & drop-off</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5]">
                Who We Are
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#071B49] leading-tight font-heading">
                Technology-Enabled Garment Care, Built for Your Neighborhood.
              </h2>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                Traditional dry cleaners often ask you to navigate traffic, carry delicate wardrobes across town, and wait days without clear updates. SPYNN brings studio-grade fabric care right to your society gate.
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Operating dedicated studios in Narsingi, Kokapet, and Chandanagar, we combine Italian finishing technology with eco-friendly chemistry. Whether it is an intricate bridal lehenga, bespoke Italian wool suit, or everyday workwear, every garment is handled by certified specialists.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Italian high-pressure steam technology",
                  "Biodegradable, fabric-safe solvents",
                  "Dedicated community logistics team",
                  "Zero color bleeding guarantee",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-[#071B49] font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#0866C5] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/communities">
                  <Button className="h-12 px-6 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-semibold text-sm shadow-sm">
                    Find Your Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 md:py-24 bg-[#F3F7FC] border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
              Our Principles
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#071B49] font-heading">
              The Standards Behind Every Thread.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-[#F3F7FC] flex items-center justify-center shrink-0">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-[#071B49] font-heading">{v.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
