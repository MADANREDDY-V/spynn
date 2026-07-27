import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, ShieldCheck, Clock, MapPin, Search } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      
      {/* 1. Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl"></div>
        
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2"></span>
            Exclusive to Gated Communities
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary dark:text-white max-w-4xl">
            Premium Dry Cleaning for Modern Communities
          </h1>
          <p className="mx-auto max-w-[700px] text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Professional garment care with <span className="font-semibold text-primary dark:text-white">FREE Pickup & Doorstep Delivery</span>. 
            Experience luxury fabric care without leaving your society.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/book" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-base rounded-full shadow-xl bg-primary hover:bg-primary/90">
                Book a Pickup
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full h-14 px-8 text-base rounded-full bg-white dark:bg-slate-950">
                View Price List
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 1.5. Promotional Banners */}
      <section className="w-full py-12 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <div className="container px-4 md:px-6">
          <Carousel className="w-full max-w-4xl mx-auto" opts={{ loop: true }}>
            <CarouselContent>
              {[
                "/banner1.jpg",
                "/banner2.jpg",
                "/banner3.jpg",
              ].map((banner, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full aspect-square max-h-[600px] bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-md mx-auto">
                    <Image src={banner} alt={`Promotion ${index + 1}`} fill className="object-contain" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </div>
      </section>


      {/* 3. How It Works */}
      <section className="w-full py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4">How SPYNN Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Seamless doorstep service designed for your convenience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Schedule Pickup", desc: "Choose a convenient time online or via WhatsApp. No app download required." },
              { step: "02", title: "Professional Cleaning", desc: "Your garments are inspected, treated, and cleaned using eco-friendly premium solvents." },
              { step: "03", title: "Doorstep Delivery", desc: "Crisp, fresh, and perfectly packaged garments delivered back to your home." }
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-lg bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute -right-6 -top-6 text-9xl font-black text-slate-100 dark:text-slate-800 opacity-50 group-hover:text-accent/10 transition-colors z-0">
                  {item.step}
                </div>
                <CardContent className="p-8 relative z-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-primary dark:text-white">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Services */}
      <section className="w-full py-24 bg-white dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4">Our Premium Services</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">Expert care for all your fabric needs, from delicate silks to heavy home furnishings.</p>
            </div>
            <Link href="/services">
              <Button variant="outline" className="rounded-full">View All Services</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Dry Cleaning", icon: "👔" },
              { name: "Steam Ironing", icon: "💨" },
              { name: "Premium Laundry", icon: "🧺" },
              { name: "Sofa Cleaning", icon: "🛋️" },
              { name: "Carpet Cleaning", icon: "🧶" },
              { name: "Curtain Cleaning", icon: "🪟" },
              { name: "Shoe Cleaning", icon: "👟" },
              { name: "Bridal Wear", icon: "✨" },
            ].map((service, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer">
                <span className="text-4xl mb-4">{service.icon}</span>
                <h4 className="font-semibold text-primary dark:text-white">{service.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose SPYNN */}
      <section className="w-full py-24 bg-primary text-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose SPYNN?</h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                We are not a marketplace. We are a dedicated studio providing specialized care for premium garments, exclusively tailored for the lifestyle of gated community residents.
              </p>
              <ul className="space-y-6">
                {[
                  "In-house expert cleaning facility",
                  "Eco-friendly, gentle solvents",
                  "Free pickup and delivery directly from your flat",
                  "AI-assisted stain analysis for precision cleaning",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="inline-block pt-4">
                <Button className="rounded-full bg-white text-primary hover:bg-slate-100">Learn About Our Process</Button>
              </Link>
            </div>
            <div className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-blue-800 to-accent flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="text-white/5 text-9xl font-black rotate-[-10deg] select-none tracking-tighter">SPYNN</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Communities We Serve */}
      <section className="w-full py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4">Communities We Serve</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            SPYNN currently serves only selected gated communities to maintain our premium quality of service.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/communities">
              <Button className="rounded-full h-12 px-8 shadow-sm">View All Available Communities</Button>
            </Link>
            <Button variant="outline" className="rounded-full h-12 px-8">Request Your Community</Button>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="w-full py-24 bg-white dark:bg-slate-950">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-medium">What areas do you serve?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                We exclusively serve selected premium gated communities. You can check if your community is on our list on the Communities page. If not, you can request us to partner with your society.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-medium">How long does cleaning take?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                Standard dry cleaning and laundry takes 48-72 hours. Steam ironing is delivered within 24 hours. Specialized items like carpets or heavy lehengas may take 4-5 days.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg font-medium">How are payments made?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                We accept online payments (UPI, Cards, NetBanking) via a secure payment link sent to you after the final invoice is generated upon delivery.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

    </div>
  );
}
