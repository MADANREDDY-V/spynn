'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building2, Truck, Star, Sparkles, Clock, CheckCircle2, Map as MapIcon, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RequestCommunityModal } from '@/components/shared/RequestCommunityModal';
import communitiesData from '@/data/communities.json';

// Helper for Animated Counters
const AnimatedCounter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {value}{suffix}
    </motion.span>
  );
};

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommunities = communitiesData.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" /> Premium Community Service
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary dark:text-white mb-6">
              Communities We Currently Serve
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
              SPYNN proudly provides premium doorstep dry cleaning and garment care services exclusively to these gated communities.
            </p>
          </motion.div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <Building2 className="w-8 h-8 text-primary mb-3" />
              <div className="text-3xl font-bold text-primary dark:text-white mb-1"><AnimatedCounter value={4} suffix="+" /></div>
              <div className="text-sm text-slate-500 font-medium text-center">Communities Served</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <Truck className="w-8 h-8 text-accent mb-3" />
              <div className="text-xl font-bold text-primary dark:text-white mb-1 mt-2 text-center leading-tight">Free Pickup</div>
              <div className="text-sm text-slate-500 font-medium text-center">& Delivery</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <Star className="w-8 h-8 text-yellow-500 mb-3" />
              <div className="text-xl font-bold text-primary dark:text-white mb-1 mt-2 text-center leading-tight">Premium</div>
              <div className="text-sm text-slate-500 font-medium text-center">Community Service</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <Sparkles className="w-8 h-8 text-blue-500 mb-3" />
              <div className="text-xl font-bold text-primary dark:text-white mb-1 mt-2 text-center leading-tight">6+ Services</div>
              <div className="text-sm text-slate-500 font-medium text-center text-xs">Dry Clean, Steam, Shoe...</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <div className="w-full bg-primary py-4 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee flex gap-8 items-center text-white/80 font-medium">
          <span className="mx-4">Trusted by Premium Communities</span> •
          {communitiesData.map(c => <span key={c.id} className="mx-4">{c.name}</span>)} •
          <span className="mx-4">Trusted by Premium Communities</span> •
          {communitiesData.map(c => <span key={c.id + 'dup'} className="mx-4">{c.name}</span>)}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary dark:text-white">
            Find Your Community
          </h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              placeholder="Search Community... (e.g. Hallmark)" 
              className="pl-12 h-14 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-lg focus-visible:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <AnimatePresence>
            {filteredCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group relative"
              >
                <Link href={`/community/${community.slug}`}>
                  <Card className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-br before:from-accent/0 before:to-primary/0 hover:before:from-accent hover:before:to-primary before:-z-10 before:rounded-[25px] before:transition-all z-0 bg-clip-padding border-[3px] border-transparent">
                    <CardContent className="p-0 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[21px] z-10 relative">
                      <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                        {/* Placeholder for actual image */}
                        <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600 absolute" />
                        <div className="absolute top-4 left-4 bg-green-500/10 backdrop-blur-md text-green-700 dark:text-green-400 font-semibold px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-green-500/20 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {community.status}
                        </div>
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary font-semibold px-3 py-1 rounded-full text-xs shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Premium Partner
                        </div>
                      </div>
                      
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-bold text-primary dark:text-white group-hover:text-accent transition-colors">
                            {community.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 mb-6">
                          <MapPin className="w-4 h-4" /> {community.location}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-primary dark:text-white font-medium mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                            <Truck className="w-4 h-4 text-accent" /> Free Pickup & Delivery
                          </div>
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                            {community.services.slice(0, 4).map((service, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {service}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4" /> Est. {community.estimatedPickup}
                          </div>
                          <Button className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-md group-hover:shadow-lg transition-all px-6">
                            Book Pickup <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
            
            {filteredCommunities.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-16 text-center">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No communities found</h3>
                <p className="text-slate-500">We couldn't find a community matching your search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hyderabad Map Section */}
        <section className="mb-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 md:p-4 shadow-xl overflow-hidden relative">
           <div className="absolute top-8 left-8 z-20 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-100 max-w-sm">
             <h3 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
               <MapIcon className="w-6 h-6 text-accent" /> SPYNN Coverage
             </h3>
             <p className="text-slate-600">Currently serving premium gated communities across West Hyderabad.</p>
           </div>
           
           {/* Stylized CSS Map representation for a premium look since we don't have API keys */}
           <div className="w-full h-[500px] bg-slate-50 dark:bg-slate-950 rounded-[20px] relative overflow-hidden flex items-center justify-center">
              {/* Map Grid Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#0b1f3a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              
              {/* Fake Map Paths (Decorative) */}
              <svg className="absolute inset-0 w-full h-full text-slate-200 dark:text-slate-800" xmlns="http://www.w3.org/2000/svg">
                <path d="M-100,200 Q150,300 400,100 T800,250 T1200,100" fill="none" stroke="currentColor" strokeWidth="8" />
                <path d="M0,400 Q200,350 300,500 T700,400 T1000,550" fill="none" stroke="currentColor" strokeWidth="12" />
              </svg>

              {/* Central Map Pins */}
              <div className="relative w-full max-w-2xl h-full mx-auto">
                {/* Cluster Area Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full border border-accent/20 animate-pulse"></div>
                
                {/* Pin 1: Tellapur */}
                <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="absolute top-[35%] left-[30%] flex flex-col items-center group cursor-pointer">
                  <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Tellapur / Nallagandla</div>
                  <div className="w-6 h-6 bg-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center relative">
                    <span className="absolute w-full h-full bg-accent rounded-full animate-ping opacity-75"></span>
                  </div>
                </motion.div>

                {/* Pin 2: Puppalaguda */}
                <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="absolute top-[45%] left-[55%] flex flex-col items-center group cursor-pointer">
                  <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Puppalaguda</div>
                  <div className="w-6 h-6 bg-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center relative">
                    <span className="absolute w-full h-full bg-accent rounded-full animate-ping opacity-75"></span>
                  </div>
                </motion.div>

                {/* Pin 3: Narsingi */}
                <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} viewport={{ once: true }} className="absolute top-[55%] left-[45%] flex flex-col items-center group cursor-pointer">
                  <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Narsingi / Alkapur</div>
                  <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                    <Star className="w-3 h-3 text-white" />
                    <span className="absolute w-full h-full bg-primary rounded-full animate-ping opacity-75"></span>
                  </div>
                </motion.div>

              </div>
           </div>
        </section>

        {/* Expansion CTA */}
        <section className="bg-gradient-to-br from-primary via-blue-900 to-primary rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Don't See Your Community?
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
              We're actively expanding across Hyderabad. Request your community and our team will get in touch with your apartment association.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <RequestCommunityModal trigger={
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-accent hover:bg-accent/90 text-primary font-bold shadow-lg hover:shadow-xl transition-all">
                  Request Your Community
                </Button>
              } />
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                  Contact SPYNN
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
