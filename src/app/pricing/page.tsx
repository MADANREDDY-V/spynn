'use client'

import { useState, useMemo } from "react";
import pricingData from "@/data/pricing.json";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Get unique categories from data
  const categories = ["All", ...Array.from(new Set(pricingData.map((item) => item.category)))];

  // Filter the data based on search and category
  const filteredData = useMemo(() => {
    return pricingData.filter((item) => {
      const matchesSearch = 
        item.garmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary dark:text-white mb-4">
          Price List
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Transparent, premium pricing for all your garment care needs. 
          Use the search or select a category below.
        </p>
      </div>

      <Card className="max-w-5xl mx-auto bg-white/50 dark:bg-slate-950/50 backdrop-blur border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-3xl">
        
        {/* Search Bar */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              type="text" 
              placeholder="Search e.g. Shirt, Saree, Steam Iron..." 
              className="w-full h-14 pl-12 pr-4 rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus-visible:ring-accent text-lg shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 md:p-8">
          
          {/* Categories */}
          <div className="mb-8 overflow-x-auto pb-4 hide-scrollbar">
            <Tabs defaultValue="All" className="w-full" onValueChange={setActiveCategory}>
              <TabsList className="h-12 bg-slate-100 dark:bg-slate-900 p-1 inline-flex w-max rounded-full border border-slate-200 dark:border-slate-800">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="rounded-full px-6 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[30%] py-4 font-semibold text-slate-700 dark:text-slate-300">Garment</TableHead>
                  <TableHead className="w-[20%] py-4 font-semibold text-slate-700 dark:text-slate-300">Service</TableHead>
                  <TableHead className="w-[15%] py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Price</TableHead>
                  <TableHead className="w-[15%] py-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Delivery</TableHead>
                  <TableHead className="w-[20%] py-4 font-semibold text-slate-700 dark:text-slate-300">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <TableCell className="py-4 font-medium text-primary dark:text-slate-200">
                        {item.garmentName}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20 font-normal">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right font-bold text-primary dark:text-white text-lg">
                        ₹{item.price}
                      </TableCell>
                      <TableCell className="py-4 text-center text-sm text-slate-500">
                        {item.estimatedTime}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-500 italic">
                        {item.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      No matching services found for "{searchTerm}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

        </div>
      </Card>
    </div>
  );
}
