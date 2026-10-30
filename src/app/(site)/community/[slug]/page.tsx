import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, Clock, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import communitiesData from '@/data/communities.json';

type Props = {
  params: { slug: string };
};

// Generate static routes for all communities for SEO
export async function generateStaticParams() {
  return communitiesData.map((community) => ({
    slug: community.slug,
  }));
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const community = communitiesData.find((c) => c.slug === params.slug);
  
  if (!community) {
    return {
      title: 'Community Not Found | SPYNN',
    };
  }

  return {
    title: `Premium Dry Cleaning for ${community.name} | SPYNN`,
    description: `SPYNN provides premium doorstep dry cleaning, steam ironing, and garment care services exclusively for residents of ${community.name} in ${community.location}.`,
    openGraph: {
      title: `${community.name} x SPYNN | Premium Dry Cleaning Partner`,
      description: `Free doorstep pickup & delivery for dry cleaning and laundry services at ${community.name}.`,
    },
  };
}

export default function CommunityPage({ params }: Props) {
  const community = communitiesData.find((c) => c.slug === params.slug);

  if (!community) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 pt-24">
      {/* Hero Section */}
      <section className="px-4 mb-16 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Building2 className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 font-medium text-sm mb-6 border border-green-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {community.status}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary dark:text-white mb-6">
              {community.name}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-lg mb-8">
              <MapPin className="w-5 h-5" /> {community.location}, Hyderabad
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
              SPYNN is the official premium dry cleaning and garment care partner for residents of {community.name}. Enjoy free doorstep pickup and seamless service.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/book">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-xl">
                  Book Pickup <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Left Column: Content */}
          <div className="md:col-span-2 space-y-16">
            
            <section>
              <h2 className="text-3xl font-bold text-primary dark:text-white mb-6">About the Partnership</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We've partnered closely with the apartment association at {community.name} to bring our state-of-the-art garment care facility directly to your doorstep. Our service is designed to match the premium lifestyle of your community.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Residents enjoy prioritized scheduling, dedicated support, and strict quality control on every single garment.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-primary dark:text-white mb-6">Services Available</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {community.services.map((service, idx) => (
                  <Card key={idx} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{service}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-primary dark:text-white mb-6">Coverage & Logistics</h2>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-3xl p-8 border border-blue-100 dark:border-blue-900">
                <div className="flex items-start gap-4 mb-6">
                  <Clock className="w-8 h-8 text-blue-500 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Estimated Turnaround</h4>
                    <p className="text-blue-800/70 dark:text-blue-200/70">Standard dry cleaning is delivered within 48-72 hours. {community.estimatedPickup} pickup available if booked before 10 AM.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-8 h-8 text-blue-500 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Nearby Coverage</h4>
                    <p className="text-blue-800/70 dark:text-blue-200/70">Our logistics fleet is permanently stationed near {community.location}, ensuring we are never far away when you need an urgent pickup.</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Benefits & Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden sticky top-32">
              <div className="bg-primary p-6 text-white text-center">
                <Star className="w-10 h-10 mx-auto mb-3 fill-yellow-500 text-yellow-500" />
                <h3 className="text-2xl font-bold">Community Benefits</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Trusted Partner</h4>
                    <p className="text-sm text-slate-500">Officially verified by association.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Zero Delivery Fees</h4>
                    <p className="text-sm text-slate-500">Free pickup & delivery forever.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Priority Processing</h4>
                    <p className="text-sm text-slate-500">Your garments are processed first.</p>
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/book" className="block w-full">
                    <Button className="w-full h-12 rounded-full text-base">Schedule Pickup</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
