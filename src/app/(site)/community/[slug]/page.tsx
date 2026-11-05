import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, Clock, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import communitiesData from '@/data/communities.json';

interface CommunityRecord {
  id: string;
  slug: string;
  name: string;
  location: string;
  assignedStore?: string;
  phone?: string;
  whatsapp?: string;
  storeAddress?: string;
  isActive?: boolean;
  status?: string;
  services?: string[];
  estimatedPickup?: string;
}

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate static routes for all communities for SEO
export async function generateStaticParams() {
  return (communitiesData as CommunityRecord[]).map((community) => ({
    slug: community.slug,
  }));
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const community = (communitiesData as CommunityRecord[]).find((c) => c.slug === slug);
  
  if (!community) {
    return {
      title: 'Community Not Found | SPYNN',
    };
  }

  return {
    title: `Premium Dry Cleaning for ${community.name} | SPYNN`,
    description: `SPYNN provides premium doorstep dry cleaning, steam ironing, and garment care services exclusively for residents of ${community.name} in ${community.location}.`,
    openGraph: {
      title: `${community.name} x SPYNN | Premium Garment Care Partner`,
      description: `Doorstep pickup & delivery for dry cleaning and laundry services at ${community.name}.`,
    },
  };
}

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params;
  const community = (communitiesData as CommunityRecord[]).find((c) => c.slug === slug);

  if (!community) {
    notFound();
  }

  const hasPhone = Boolean(community.phone && community.phone.trim().length > 0);
  const hasWhatsapp = Boolean(community.whatsapp && community.whatsapp.trim().length > 0);

  return (
    <div className="min-h-screen bg-white pb-24 pt-24 md:pt-32">
      
      {/* Hero Section */}
      <section className="px-4 mb-16 max-w-5xl mx-auto">
        <div className="bg-[#F3F7FC] rounded-3xl p-8 md:p-14 shadow-sm relative overflow-hidden border border-slate-200">
          <div className="relative z-10 max-w-2xl flex flex-col gap-5">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {community.status || "Currently Serving"}
              </span>
              <span className="px-3 py-1 rounded-full bg-white text-[#0866C5] font-semibold text-xs border border-slate-200">
                {community.assignedStore || "Central Studio Hub"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#071B49] font-heading">
              {community.name}
            </h1>

            <div className="flex items-center gap-2 text-slate-600 text-sm md:text-base font-medium">
              <MapPin className="w-4 h-4 text-[#0866C5]" /> {community.location}, Hyderabad
            </div>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal">
              SPYNN Dry Cleaning Studio provides dedicated doorstep garment collection and white-glove delivery exclusively for residents of {community.name}.
            </p>

            {/* Direct Connect Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {hasWhatsapp ? (
                <a
                  href={`https://wa.me/${community.whatsapp}?text=Hi%20SPYNN,%20I%20am%20a%20resident%20of%20${encodeURIComponent(community.name)}.%20I%20would%20like%20to%20arrange%20garment%20care.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="rounded-full h-12 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm shadow-sm">
                    <MessageCircle className="w-4 h-4 mr-2" /> Connect on WhatsApp
                  </Button>
                </a>
              ) : null}

              {hasPhone ? (
                <a href={`tel:${community.phone?.replace(/\s+/g, '')}`}>
                  <Button variant="outline" className="rounded-full h-12 px-6 border-slate-300 text-[#071B49] font-semibold text-sm hover:bg-white">
                    <Phone className="w-4 h-4 mr-2 text-[#0866C5]" /> Call Assigned Studio
                  </Button>
                </a>
              ) : null}

              <Link href="/communities">
                <Button variant="ghost" className="rounded-full h-12 px-5 text-slate-600 hover:text-[#071B49] text-sm font-semibold">
                  All Communities
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          
          {/* Left Column: Content */}
          <div className="md:col-span-2 space-y-12">
            
            <section className="flex flex-col gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#071B49] font-heading">
                About the Partnership
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                We&apos;ve established prioritized collection routes for residents of {community.name}. Our service is tailored to respect your schedule, ensuring your finest garments receive studio-grade care without requiring trips to commercial laundries.
              </p>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Residents enjoy specialized care for evening wear, business suits, delicate silk sarees, shoe restoration, and heavy household drapes.
              </p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#071B49] font-heading">
                Services Available at Your Doorstep
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(community.services || [
                  "Dry Cleaning",
                  "Steam Ironing",
                  "Wash & Fold",
                  "Shoe Cleaning",
                  "Curtain Cleaning",
                  "Household Item Cleaning",
                ]).map((service, idx) => (
                  <Card key={idx} className="border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#0866C5]/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#0866C5]" />
                      </div>
                      <span className="font-semibold text-sm text-[#071B49]">{service}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#071B49] font-heading">
                Coverage & Turnaround
              </h2>
              <div className="bg-[#F3F7FC] rounded-2xl p-6 border border-slate-200 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#0866C5] mt-1 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-[#071B49] font-heading">Turnaround Schedule</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Standard dry cleaning is delivered in 48 to 72 hours. Daily steam ironing is delivered within 24 to 48 hours. {community.estimatedPickup || "Same-day collection"} available for morning pickups.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0866C5] mt-1 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-[#071B49] font-heading">Assigned Studio Hub</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      All garments collected from {community.name} are processed at our {community.assignedStore || "Narsingi Studio"} under strict quality controls.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Benefits Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white shadow-md border-slate-200 rounded-3xl overflow-hidden sticky top-28">
              <div className="bg-[#071B49] p-6 text-white text-center">
                <ShieldCheck className="w-8 h-8 text-[#20BCEB] mx-auto mb-2" />
                <h3 className="text-lg font-bold font-heading">Community Privileges</h3>
                <p className="text-xs text-white/70 mt-1">{community.name}</p>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0866C5] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-[#071B49]">Direct Society Valet</h4>
                    <p className="text-[11px] text-slate-500">Doorstep pickup from your flat or gate.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0866C5] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-[#071B49]">Italian Steam Technology</h4>
                    <p className="text-[11px] text-slate-500">Zero scorch marks or unwanted shine.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0866C5] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-[#071B49]">Dedicated Store Line</h4>
                    <p className="text-[11px] text-slate-500">Direct WhatsApp support for residents.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  {hasWhatsapp && (
                    <a
                      href={`https://wa.me/${community.whatsapp}?text=Hi%20SPYNN,%20I%20am%20a%20resident%20of%20${encodeURIComponent(community.name)}.%20I%20would%20like%20to%20arrange%20garment%20care.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full h-11 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold">
                        <MessageCircle className="w-4 h-4 mr-1.5" /> Chat with Assigned Store
                      </Button>
                    </a>
                  )}

                  {hasPhone && (
                    <a href={`tel:${community.phone?.replace(/\s+/g, '')}`} className="block w-full">
                      <Button variant="outline" className="w-full h-11 rounded-full border-slate-200 text-[#071B49] text-xs font-semibold">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-[#0866C5]" /> Call {community.phone}
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

    </div>
  );
}
