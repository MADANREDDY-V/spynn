'use client'

import { siteConfig } from "@/config/site";
import { Building2, Rocket, Sparkles, MapPin, Handshake, Calendar, ArrowRight, MessageCircle, Phone, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CommunitiesPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary dark:text-white mb-6">
          Community Launch Program
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          SPYNN is preparing to launch premium dry cleaning services for gated communities. We are currently onboarding our first partner communities.
        </p>
      </div>

      {/* Main Announcement Card */}
      <div className="max-w-5xl mx-auto mb-20">
        <Card className="border-none shadow-2xl bg-gradient-to-br from-primary via-blue-900 to-accent overflow-hidden rounded-[2rem] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          <CardContent className="p-0 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="relative z-10 p-10 md:p-16 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-8 shadow-inner relative">
                <Rocket className="w-10 h-10" />
                <div className="absolute -top-2 -right-2 bg-accent text-primary text-[0.65rem] font-bold uppercase tracking-wider py-1 px-3 rounded-full animate-pulse shadow-lg">
                  Coming Soon
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">We're Getting Ready</h2>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
                Our services will begin shortly in selected residential communities. We're working closely with community management teams to ensure a seamless launch experience from day one.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expansion Timeline */}
      <div className="max-w-5xl mx-auto mb-24 animate-in fade-in duration-1000 delay-300">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-primary dark:text-white mb-16">Launch Roadmap</h2>
        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 md:border-none md:flex justify-between items-start ml-4 md:ml-0 gap-6">
          {/* Phase 1 (Active) */}
          <div className="relative pl-8 md:pl-0 md:flex-1 md:text-center pb-12 md:pb-0 group">
            <div className="absolute left-[-9px] top-1 md:left-1/2 md:-translate-x-1/2 md:-top-4 w-4 h-4 rounded-full bg-accent ring-4 ring-accent/20 z-10 transition-all duration-300"></div>
            <div className="hidden md:block absolute top-[-7px] left-1/2 right-[-50%] h-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>
            <h3 className="text-lg font-bold text-primary dark:text-white mb-2">Phase 1</h3>
            <p className="text-accent font-medium">Community Partnerships</p>
          </div>

          {/* Phase 2 */}
          <div className="relative pl-8 md:pl-0 md:flex-1 md:text-center pb-12 md:pb-0 opacity-50 grayscale">
            <div className="absolute left-[-9px] top-1 md:left-1/2 md:-translate-x-1/2 md:-top-4 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 z-10"></div>
            <div className="hidden md:block absolute top-[-7px] left-1/2 right-[-50%] h-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Phase 2</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Pilot Launch</p>
          </div>

          {/* Phase 3 */}
          <div className="relative pl-8 md:pl-0 md:flex-1 md:text-center pb-12 md:pb-0 opacity-50 grayscale">
            <div className="absolute left-[-9px] top-1 md:left-1/2 md:-translate-x-1/2 md:-top-4 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 z-10"></div>
            <div className="hidden md:block absolute top-[-7px] left-1/2 right-[-50%] h-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Phase 3</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Resident Bookings</p>
          </div>

          {/* Phase 4 */}
          <div className="relative pl-8 md:pl-0 md:flex-1 md:text-center opacity-50 grayscale">
            <div className="absolute left-[-9px] top-1 md:left-1/2 md:-translate-x-1/2 md:-top-4 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 z-10"></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Phase 4</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium">City Expansion</p>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="w-full bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-12 mb-24 text-center px-4">
        <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
          "Premium service takes careful planning. We're launching thoughtfully to ensure every customer receives an outstanding experience."
        </p>
      </div>

      {/* Dual Interest Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-24">
        
        {/* RWA Section */}
        <Card className="border-none shadow-xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden hover:shadow-2xl transition-all h-full">
          <CardContent className="p-8 md:p-12 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8">
              <Handshake className="w-8 h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-primary dark:text-white mb-4">Want SPYNN in Your Community?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-10 flex-grow text-lg">
              If you're a Resident Welfare Association (RWA), Apartment Association, or Community Management Team, we'd love to partner with you to offer premium garment care to your residents.
            </p>
            <div className="flex flex-col gap-4">
              <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}>
                <Button className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-lg shadow-md">
                  Request a Demo
                </Button>
              </a>
              <div className="grid grid-cols-2 gap-4">
                <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full h-12 rounded-full border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp
                  </Button>
                </a>
                <a href="/contact">
                  <Button variant="outline" className="w-full h-12 rounded-full border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                    Contact Us
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residents Section */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden hover:shadow-2xl transition-all h-full">
          <CardContent className="p-8 md:p-12 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary dark:text-white mb-8">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-primary dark:text-white mb-4">Interested in SPYNN?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">
              Tell us which community you live in. When we launch there, you'll be among the first to know.
            </p>
            <form className="space-y-6 mt-auto">
              <div className="space-y-2">
                <Label htmlFor="community">Community Name</Label>
                <Input id="community" placeholder="e.g. The Prestige" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-accent" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="John Doe" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-accent" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="9866654304" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-accent" />
              </div>
              <Button type="button" className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-lg shadow-md mt-2">
                Submit Interest
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-3xl p-10 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-6">
          Bring SPYNN to Your Community
        </h2>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
          Be among the first communities to experience premium doorstep dry cleaning. Schedule a meeting with our partnerships team today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a href="/contact" className="w-full sm:w-auto">
            <Button size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 h-14 px-8 text-lg shadow-md flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" /> Schedule a Meeting
            </Button>
          </a>
          <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full rounded-full h-14 px-8 text-lg border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" /> WhatsApp
            </Button>
          </a>
        </div>
      </div>

    </div>
  );
}
