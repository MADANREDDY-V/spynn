import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FranchiseEnquiryForm } from '@/components/shared/FranchiseEnquiryForm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Truck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Phone,
  HelpCircle,
  Award,
  Layers,
  Users2,
  Store,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Franchise Opportunity | SPYNN Dry Cleaning Studio',
  description:
    'Partner with SPYNN Dry Cleaning Studio. Build a modern business in professional garment care with studio guidance, technology operations, and neighborhood demand.',
};

const partnerPillars = [
  {
    icon: <Sparkles className="h-6 w-6 text-[#0866C5]" />,
    title: 'Recognized Brand Identity',
    desc: 'Operate under an established, premium dry cleaning brand with distinct visual identity, studio aesthetics, and strong residential community recognition.',
  },
  {
    icon: <Cpu className="h-6 w-6 text-[#0866C5]" />,
    title: 'Technology-Enabled Operations',
    desc: 'Access modern order tracking workflows, inventory management, customer communications, and dedicated doorstep route logistics.',
  },
  {
    icon: <Layers className="h-6 w-6 text-[#0866C5]" />,
    title: 'Comprehensive Service Portfolio',
    desc: 'Offer six distinct revenue streams: Dry Cleaning, Italian Steam Ironing, Wash & Fold, Shoe Spa, Household Items, and Curtain Restoration.',
  },
  {
    icon: <Users2 className="h-6 w-6 text-[#0866C5]" />,
    title: 'Operational Training & Quality Control',
    desc: 'Complete staff training on European fabric chemistry, Italian pressing equipment, delicate stain mapping, and standardized packing procedures.',
  },
  {
    icon: <Truck className="h-6 w-6 text-[#0866C5]" />,
    title: 'Community Route Guidance',
    desc: 'Leverage our proven playbook for onboarding residential societies, high-rise apartments, and villa enclaves with zero friction.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-[#0866C5]" />,
    title: 'Vendor & Equipment Sourcing',
    desc: 'Direct access to verified suppliers for eco-friendly solvent formulations, packaging supplies, and industrial-grade finishing equipment.',
  },
];

const businessProcessSteps = [
  {
    step: '01',
    title: 'Initial Enquiry & Profile Review',
    desc: 'Submit your interest. Our franchise expansion desk reviews your preferred territory and investment readiness.',
  },
  {
    step: '02',
    title: 'Site Selection & Feasibility',
    desc: 'Joint evaluation of potential studio catchments, residential density, road visibility, and competitor landscape.',
  },
  {
    step: '03',
    title: 'Store Layout & Fit-Out',
    desc: 'Standardized architectural layouts, machine placement planning, utilities provisioning, and branded interior finishing.',
  },
  {
    step: '04',
    title: 'Staff Onboarding & Training',
    desc: 'Intensive practical training for pressers, sorters, front-desk managers, and customer delivery personnel.',
  },
  {
    step: '05',
    title: 'Launch & Neighborhood Rollout',
    desc: 'Coordinated studio inauguration, society promotional campaigns, and opening pickup route activations.',
  },
];

const franchiseFaqs = [
  {
    q: 'What kind of studio space is required for a SPYNN franchise?',
    a: 'A typical SPYNN Dry Cleaning Studio requires between 400 to 800 sq.ft. of ground-floor commercial space with good road frontage, high electrical load capacity, and reliable water supply, ideally situated near dense residential clusters or gated communities.',
  },
  {
    q: 'Does SPYNN provide equipment installation and technician training?',
    a: 'Yes. SPYNN guides machine sourcing, layout design, installation, and conducts structured training programs for staff covering fabric inspection, solvent care, Italian steam pressing, and packaging standards.',
  },
  {
    q: 'Can I operate in cities outside Hyderabad?',
    a: 'While our initial studio clusters and flagship operations are centered in Hyderabad, we welcome serious franchise partners looking to pioneer SPYNN in other tier-1 and tier-2 urban centers across South and Central India.',
  },
  {
    q: 'What ongoing operational support does SPYNN offer?',
    a: 'Franchise partners receive ongoing assistance in supply chain consumables, technology upgrades, central marketing campaigns, quality audit checks, and customer resolution guidelines.',
  },
  {
    q: 'How do I start the evaluation process?',
    a: 'Fill out the franchise enquiry form on this page or connect with our expansion team via WhatsApp. We will schedule a direct exploratory discussion.',
  },
];

export default function FranchisePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F3F7FC] via-white to-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs md:text-sm tracking-wide">
                <Store className="h-4 w-4" />
                Franchise & Partner Expansion
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#071B49] leading-[1.12] font-heading">
                Build a Business in Professional Garment Care.
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                Explore the opportunity to grow with SPYNN and be part of a professional garment-care brand. Deliver premium fabric care, steam pressing, and community doorstep convenience with proven studio operations.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#enquiry-form">
                  <Button className="h-12 px-7 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-sm shadow-sm transition-all">
                    Apply for Franchise
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20I%20would%20like%20to%20discuss%20franchise%20opportunities.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="h-12 px-7 rounded-full border-slate-300 text-[#071B49] font-bold text-sm hover:bg-slate-50 transition-all">
                    <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                    Chat with Franchise Desk
                  </Button>
                </a>
              </div>

              {/* Verified Trust Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-xl">
                <div>
                  <div className="text-xl md:text-2xl font-black text-[#071B49] font-heading">6 Services</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Dry Clean, Iron, Wash & More</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-[#0866C5] font-heading">Doorstep</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Community Route Integration</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-black text-[#071B49] font-heading">Turnkey</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Layout & Staff Training</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-[#F3F7FC]">
                <Image
                  src="/banner2.jpg"
                  alt="SPYNN studio store experience and professional garment care operations"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 hidden sm:flex items-center gap-3 max-w-xs">
                <div className="h-10 w-10 rounded-xl bg-[#0866C5]/10 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6 text-[#0866C5]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#071B49]">Neighborhood Studios</div>
                  <div className="text-[11px] text-slate-500">Narsingi, Kokapet, Chandanagar</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Partner with SPYNN */}
      <section className="py-14 md:py-20 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
              Partnership Advantages
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#071B49] font-heading">
              Why Partner with SPYNN.
            </h2>
            <p className="text-slate-600 text-base md:text-lg mt-3">
              We provide the framework, operational standards, and brand foundation to help you build a reputable business in professional garment care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnerPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200/90 bg-[#F3F7FC]/40 p-8 flex flex-col gap-4 hover:bg-white hover:shadow-lg hover:border-[#0866C5]/30 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-2xl bg-white shadow-xs border border-slate-200/70 flex items-center justify-center shrink-0">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold text-[#071B49] font-heading">
                  {pillar.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* How the Franchise Journey Works */}
      <section className="py-14 md:py-20 bg-[#F3F7FC]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
              Onboarding Roadmap
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#071B49] font-heading">
              From Inquiry to Studio Launch.
            </h2>
            <p className="text-slate-600 text-base mt-2">
              A structured, transparent onboarding process designed for smooth execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {businessProcessSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#0866C5] font-heading">
                    {step.step}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-[#F3F7FC] flex items-center justify-center text-xs font-bold text-slate-400">
                    ✓
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-bold text-base text-[#071B49] font-heading">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Main Form & WhatsApp Section */}
      <section id="enquiry-form" className="py-14 md:py-20 bg-white scroll-mt-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Context & Contact */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5]">
                Start the Conversation
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#071B49] leading-tight font-heading">
                Take the First Step Toward Your SPYNN Studio.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Fill out the application form with your details. Our franchise development team will review your enquiry and share a comprehensive information package.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-[#071B49] font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[#0866C5] shrink-0" />
                  <span>Dedicated territory evaluation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#071B49] font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[#0866C5] shrink-0" />
                  <span>Comprehensive equipment and layout support</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#071B49] font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[#0866C5] shrink-0" />
                  <span>Zero hidden obligations or undisclosed terms</span>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="mt-4 p-6 rounded-2xl bg-[#F3F7FC] border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#071B49]">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  Prefer direct messaging?
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chat directly with our development desk on WhatsApp to ask quick questions about location criteria or expansion plans.
                </p>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20I%20would%20like%20to%20discuss%20franchise%20opportunities.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full rounded-xl border-slate-300 text-xs font-semibold h-11 text-[#071B49] hover:bg-white">
                    <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
                    Enquire via WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Column: Form Card */}
            <div className="lg:col-span-7">
              <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xl p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-[#071B49] font-heading">
                    Franchise Application Form
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Please provide accurate information to expedite your qualification.
                  </p>
                </div>
                <FranchiseEnquiryForm />
              </Card>
            </div>

          </div>

        </div>
      </section>

      {/* Franchise FAQ Section */}
      <section className="py-14 md:py-20 bg-[#F3F7FC] border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest uppercase text-[#0866C5] mb-2">
              Clarifications
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#071B49] font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Common questions about owning and operating a SPYNN franchise studio.
            </p>
          </div>

          <Accordion className="w-full flex flex-col gap-3">
            {franchiseFaqs.map((faq, fIdx) => (
              <AccordionItem
                key={fIdx}
                value={`faq-${fIdx}`}
                className="rounded-2xl border border-slate-200 p-2 px-4 bg-white"
              >
                <AccordionTrigger className="text-left font-bold text-[#071B49] hover:no-underline py-3 text-base font-heading">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-3">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

        </div>
      </section>
    </div>
  );
}
