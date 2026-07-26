'use client'

import { useState } from "react";
import { Search, MapPin, Building2, CheckCircle2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock data for communities
const communitiesData = [
  { id: 1, name: "Prestige Shantiniketan", location: "Whitefield", status: "available" },
  { id: 2, name: "Lodha Luxury", location: "Central District", status: "available" },
  { id: 3, name: "Godrej Infinity", location: "East Tech Park", status: "available" },
  { id: 4, name: "DLF Crest", location: "Golf Course Road", status: "available" },
  { id: 5, name: "Sobha City", location: "North Avenue", status: "coming_soon" },
  { id: 6, name: "Brigade Gateway", location: "Malleswaram", status: "coming_soon" },
];

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCommunities = communitiesData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4 bg-accent/10 text-accent border-accent/20 px-4 py-1.5 text-sm font-medium rounded-full">
          Exclusive Service
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary dark:text-white mb-6">
          Communities We Serve
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 font-medium p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          "SPYNN currently serves only selected gated communities."
        </p>
        <p className="mt-6 text-slate-500">
          This allows us to maintain our exceptionally high standards and provide free, lightning-fast doorstep pickups and deliveries.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
          <Input 
            type="text" 
            placeholder="Search for your society or location..." 
            className="w-full h-16 pl-14 pr-4 rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus-visible:ring-accent text-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map((community) => (
            <Card key={community.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950 flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-white mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {community.status === 'available' ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50 font-medium">
                      <Clock className="w-3 h-3 mr-1" /> Coming Soon
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-primary dark:text-white">{community.name}</h3>
                <div className="flex items-center text-slate-500 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {community.location}
                </div>
              </CardHeader>
              <CardFooter className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                {community.status === 'available' ? (
                  <Link href="/book" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90 rounded-full">
                      Book Pickup
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full rounded-full" disabled>
                    Service Starting Soon
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Community not found</h3>
            <p className="text-slate-500 mb-6">We couldn't find a community matching your search.</p>
            <Button variant="outline" className="rounded-full">Request Your Community</Button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-3xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary dark:text-white mb-4">
          Don't see your community?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          We are constantly expanding our footprint to new premium societies. Request SPYNN for your community, and we'll work with your resident welfare association to launch our services.
        </p>
        <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 h-14 px-8 text-base shadow-md">
          Request SPYNN For Your Community
        </Button>
      </div>

    </div>
  );
}
