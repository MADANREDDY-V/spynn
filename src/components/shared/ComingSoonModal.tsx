'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useState } from "react";

interface ComingSoonModalProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  type?: "booking" | "community" | "feature";
}

export function ComingSoonModal({ 
  children, 
  title = "Online Booking Coming Soon", 
  description = "We're currently preparing our online booking platform. Until then, you can easily schedule your pickup through WhatsApp or by calling us directly.",
  type = "booking"
}: ComingSoonModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-primary via-blue-900 to-accent px-6 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-4 shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white mb-2">{title}</DialogTitle>
          </div>
        </div>
        <div className="p-6 md:p-8 text-center">
          <DialogDescription className="text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {description}
          </DialogDescription>
          
          <div className="flex flex-col gap-3">
            <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`} className="w-full">
              <Button className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-md font-medium text-base">
                <Phone className="w-4 h-4 mr-2" /> Call Now
              </Button>
            </a>
            <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-full border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 flex items-center justify-center font-medium text-base">
                <MessageCircle className="w-4 h-4 mr-2 text-[#25D366]" /> WhatsApp
              </Button>
            </a>
            <Button variant="ghost" onClick={() => setOpen(false)} className="w-full h-12 rounded-full mt-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
