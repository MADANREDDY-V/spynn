'use client';

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Phone, MessageCircle, Mail, Clock, MapPin, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    community: "",
    service: "Dry Cleaning",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage("Please enter your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    // Simulate reliable client enquiry handling & WhatsApp forward option
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* Header Banner */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F3F7FC] via-white to-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0866C5]/10 text-[#0866C5] font-semibold text-xs uppercase tracking-wider mb-5">
            <Mail className="h-3.5 w-3.5" />
            Direct Communication
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#071B49] leading-tight mb-5 font-heading">
            Contact SPYNN Studio
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have an inquiry about garment care, delicate fabrics, or community doorstep collection? Our team is here to assist you.
          </p>
        </div>
      </section>

      {/* Main Content: Info & Form */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Direct Contact & Locations */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#071B49] font-heading">
                  Get in Touch
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Connect directly with our customer care and studio logistics specialists via WhatsApp or telephone.
                </p>
              </div>

              {/* Direct Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
                  className="p-6 rounded-2xl border border-slate-200 bg-[#F3F7FC] hover:bg-white hover:border-[#0866C5] hover:shadow-md transition-all flex flex-col gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#0866C5] shadow-2xs">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Direct Telephone</div>
                    <div className="font-bold text-[#071B49] text-sm mt-0.5">{siteConfig.contact.phone}</div>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20I%20have%20an%20inquiry%20regarding%20garment%20care.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl border border-slate-200 bg-[#F3F7FC] hover:bg-white hover:border-[#25D366] hover:shadow-md transition-all flex flex-col gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-2xs">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">WhatsApp Support</div>
                    <div className="font-bold text-[#071B49] text-sm mt-0.5">{siteConfig.contact.phone}</div>
                  </div>
                </a>
              </div>

              {/* Verified Details Block */}
              <div className="rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                  Studio Operations
                </h3>
                <div className="flex flex-col gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#0866C5] shrink-0" />
                    <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-[#0866C5] font-medium">
                      {siteConfig.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-[#0866C5] shrink-0" />
                    <span>{siteConfig.contact.workingHours}</span>
                  </div>
                </div>
              </div>

              {/* Physical Studio Locations */}
              <div className="rounded-2xl border border-slate-200 p-6 flex flex-col gap-3 bg-[#F3F7FC]/70">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#071B49] font-heading">
                    Operating Studios
                  </h3>
                  <Link href="/locations" className="text-xs font-bold text-[#0866C5] hover:underline inline-flex items-center gap-1">
                    All Locations <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <ul className="flex flex-col gap-2 pt-1 text-xs text-slate-600">
                  {siteConfig.locations.map((loc) => (
                    <li key={loc.slug} className="flex items-center justify-between py-1.5 border-b border-slate-200/60 last:border-none">
                      <span className="font-semibold text-[#071B49] flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#0878E8]" />
                        {loc.name}
                      </span>
                      <span className="text-slate-500">{loc.area}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right Column: Contact Enquiry Form */}
            <div className="lg:col-span-7">
              <Card className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
                <CardContent className="p-0 flex flex-col gap-6">
                  
                  <div>
                    <h2 className="text-2xl font-black text-[#071B49] font-heading">
                      Send Us an Enquiry
                    </h2>
                    <p className="text-slate-600 text-sm mt-1">
                      Fill out your details and our team will get in touch with you promptly.
                    </p>
                  </div>

                  {isSubmitted ? (
                    <div className="py-12 flex flex-col items-center text-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#071B49] font-heading">
                        Thank You, {formData.name}!
                      </h3>
                      <p className="text-slate-600 text-sm max-w-sm">
                        We have received your message. Our studio care team will contact you at {formData.phone} shortly.
                      </p>
                      <div className="pt-4 flex items-center gap-3">
                        <Button
                          onClick={() => {
                            setIsSubmitted(false);
                            setFormData({ name: "", phone: "", community: "", service: "Dry Cleaning", message: "" });
                          }}
                          variant="outline"
                          className="rounded-full text-xs font-semibold h-10 px-5"
                        >
                          Send Another Message
                        </Button>
                        <a
                          href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20SPYNN,%20my%20name%20is%20${encodeURIComponent(formData.name)}.%20I%20just%20submitted%20an%20enquiry%20regarding%20${encodeURIComponent(formData.service)}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold h-10 px-5">
                            <MessageCircle className="h-4 w-4 mr-1.5" />
                            Open WhatsApp Now
                          </Button>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      
                      {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                          {errorMessage}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#071B49]">
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="h-11 rounded-xl border-slate-200 focus:border-[#0866C5]"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-[#071B49]">
                            Mobile Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="h-11 rounded-xl border-slate-200 focus:border-[#0866C5]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="community" className="text-xs font-bold uppercase tracking-wider text-[#071B49]">
                            Residential Community / Area
                          </Label>
                          <Input
                            id="community"
                            name="community"
                            type="text"
                            placeholder="e.g. Hallmark Skyrena, Puppalaguda"
                            value={formData.community}
                            onChange={handleChange}
                            className="h-11 rounded-xl border-slate-200 focus:border-[#0866C5]"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label htmlFor="service" className="text-xs font-bold uppercase tracking-wider text-[#071B49]">
                            Primary Service Needed
                          </Label>
                          <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#071B49] focus:outline-none focus:border-[#0866C5]"
                          >
                            <option value="Dry Cleaning">Dry Cleaning</option>
                            <option value="Steam Ironing">Steam Ironing</option>
                            <option value="Wash & Fold">Wash & Fold</option>
                            <option value="Shoe Cleaning">Shoe Cleaning</option>
                            <option value="Household Cleaning">Household Item Cleaning</option>
                            <option value="Curtain Cleaning">Curtain Cleaning</option>
                            <option value="Other">General Inquiry</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-[#071B49]">
                          Message or Special Requests
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          rows={4}
                          placeholder="Tell us about your garments, preferred timing, or special instructions..."
                          value={formData.message}
                          onChange={handleChange}
                          className="rounded-xl border-slate-200 focus:border-[#0866C5] resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 rounded-full bg-[#0866C5] hover:bg-[#0878E8] text-white font-bold text-sm shadow-sm transition-all mt-2"
                      >
                        {isSubmitting ? (
                          <span>Sending Message...</span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            Send Studio Enquiry
                            <Send className="h-4 w-4" />
                          </span>
                        )}
                      </Button>

                    </form>
                  )}

                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
