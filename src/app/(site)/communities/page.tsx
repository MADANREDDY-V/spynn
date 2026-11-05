'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, MapPin, Building2, Phone, MessageCircle, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RequestCommunityModal } from '@/components/shared/RequestCommunityModal';
import communitiesData from '@/data/communities.json';

interface Community {
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

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState<string>('All');

  // Extract unique localities
  const localities = useMemo(() => {
    const list = Array.from(new Set(communitiesData.map((c) => c.location)));
    return ['All', ...list];
  }, []);

  // Filter communities by search query and locality
  const filteredCommunities = useMemo(() => {
    return (communitiesData as Community[]).filter((community) => {
      // Must be active
      if (community.isActive === false) return false;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        community.name.toLowerCase().includes(q) ||
        community.location.toLowerCase().includes(q) ||
        (community.assignedStore && community.assignedStore.toLowerCase().includes(q));

      const matchesLocality =
        selectedLocality === 'All' || community.location === selectedLocality;

      return matchesSearch && matchesLocality;
    });
  }, [searchQuery, selectedLocality]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* Search Header Banner */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F3F7FC] via-white to-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider mb-5">
            <Building2 className="h-3.5 w-3.5" />
            Find Your Community
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#071B49] leading-tight mb-5 font-heading">
            Discover Your SPYNN Studio.
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Search for your gated society or residential tower to connect directly with your dedicated neighborhood collection studio.
          </p>

          {/* Search Input Bar */}
          <div className="relative max-w-2xl mx-auto shadow-lg rounded-2xl bg-white border border-slate-200 p-2 flex items-center gap-2">
            <div className="pl-3 text-[#0866C5]">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Search by community name, area (e.g. Skyrena, Vessella, Tellapur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 border-0 shadow-none focus-visible:ring-0 text-base placeholder:text-slate-400 text-[#071B49]"
              aria-label="Search residential community"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-2 rounded-xl text-slate-400 hover:text-[#071B49] hover:bg-slate-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Locality Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {localities.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLocality(loc)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedLocality === loc
                    ? 'bg-[#0866C5] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Community Results Section */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-600">
              Showing <span className="text-[#071B49] font-bold">{filteredCommunities.length}</span> served {filteredCommunities.length === 1 ? 'community' : 'communities'}
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLocality('All');
                }}
                className="text-xs font-bold text-[#0866C5] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Results Grid */}
          {filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => {
                const hasPhone = Boolean(community.phone && community.phone.trim().length > 0);
                const hasWhatsapp = Boolean(community.whatsapp && community.whatsapp.trim().length > 0);

                return (
                  <Card
                    key={community.id}
                    className="rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-lg hover:border-[#0866C5]/40 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <CardContent className="p-6 md:p-7 flex flex-col h-full justify-between gap-6">
                      
                      {/* Community Header */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F3F7FC] text-[#0866C5] flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            {community.location}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Doorstep Service
                          </span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-[#071B49] font-heading mt-1">
                          {community.name}
                        </h2>

                        {/* Assigned Studio Badge */}
                        <div className="rounded-xl bg-[#F3F7FC] p-3.5 border border-slate-100 flex flex-col gap-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Assigned SPYNN Store
                          </div>
                          <div className="font-bold text-[#071B49] text-sm">
                            {community.assignedStore || 'Central Studio Hub'}
                          </div>
                          {community.storeAddress && (
                            <div className="text-xs text-slate-500">
                              {community.storeAddress}
                            </div>
                          )}
                        </div>

                        {/* Services List */}
                        {community.services && community.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {community.services.slice(0, 4).map((svc, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
                              >
                                {svc}
                              </span>
                            ))}
                            {community.services.length > 4 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500">
                                +{community.services.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Contact & Detail Actions */}
                      <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
                        {hasWhatsapp || hasPhone ? (
                          <div className="grid grid-cols-2 gap-2">
                            {hasWhatsapp ? (
                              <a
                                href={`https://wa.me/${community.whatsapp}?text=Hi%20SPYNN,%20I%20am%20a%20resident%20of%20${encodeURIComponent(community.name)}.%20I%20would%20like%20to%20arrange%20garment%20care.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                              >
                                <Button className="w-full rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold h-10 shadow-2xs">
                                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                  WhatsApp
                                </Button>
                              </a>
                            ) : null}

                            {hasPhone ? (
                              <a href={`tel:${community.phone?.replace(/\s+/g, '')}`} className="w-full">
                                <Button variant="outline" className="w-full rounded-xl border-slate-200 text-xs font-semibold h-10 text-[#071B49] hover:bg-slate-50">
                                  <Phone className="h-3.5 w-3.5 mr-1.5 text-[#0866C5]" />
                                  Call Store
                                </Button>
                              </a>
                            ) : null}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-slate-100">
                            Direct store line setup in progress. Please call central care at +91 98666 35661.
                          </div>
                        )}

                        <Link href={`/community/${community.slug}`} className="w-full">
                          <Button variant="ghost" className="w-full rounded-xl text-xs font-semibold text-[#0866C5] hover:bg-[#F3F7FC] h-9">
                            View Partnership Details
                            <ArrowRight className="h-3 w-3 ml-1.5" />
                          </Button>
                        </Link>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* No Results Found State */
            <div className="rounded-3xl border border-slate-200 bg-[#F3F7FC]/50 p-12 md:p-16 text-center max-w-2xl mx-auto flex flex-col items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#071B49] font-heading">
                  No Communities Found
                </h3>
                <p className="text-slate-600 text-sm mt-1.5 max-w-md mx-auto">
                  We could not find a community matching &ldquo;{searchQuery}&rdquo;. Don&apos;t worry — we are actively onboarding new gated enclaves across Hyderabad.
                </p>
              </div>
              <RequestCommunityModal trigger={
                <Button className="h-11 px-6 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-semibold text-xs shadow-sm">
                  Request Your Community Now
                </Button>
              } />
            </div>
          )}

        </div>
      </section>

      {/* Community Expansion Request Section */}
      <section className="py-20 bg-[#071B49] text-white border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#20BCEB] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Launch Program
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-heading">
            Want SPYNN in Your Apartment Complex?
          </h2>
          <p className="text-white/70 text-base max-w-2xl mx-auto leading-relaxed">
            We partner with apartment owners associations, facility managers, and RWAs to establish daily doorstep pickup schedules with zero setup cost to the society.
          </p>
          <div className="pt-2">
            <RequestCommunityModal trigger={
              <Button className="h-12 px-8 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-sm shadow-md">
                Request SPYNN for Your Society
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            } />
          </div>
        </div>
      </section>

    </div>
  );
}
