import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Wind, Waves, Pocket, Bed, ShieldCheck, ArrowRight } from "lucide-react";

const services = [
  {
    id: "dry-cleaning",
    title: "Premium Dry Cleaning",
    icon: <Sparkles className="w-8 h-8 text-accent" />,
    description: "Expert solvent-based cleaning for delicate fabrics, suits, sarees, and designer wear. Removes tough stains while protecting fabric integrity.",
    features: ["Eco-friendly solvents", "Stain pre-treatment", "Hand-finished pressing"]
  },
  {
    id: "steam-ironing",
    title: "Steam Ironing",
    icon: <Wind className="w-8 h-8 text-accent" />,
    description: "Professional high-pressure steam pressing that removes wrinkles and kills bacteria, delivering a crisp, sharp finish to your daily wear.",
    features: ["High-pressure steam", "Crease perfection", "Wrinkle-free packaging"]
  },
  {
    id: "laundry",
    title: "Premium Laundry",
    icon: <Waves className="w-8 h-8 text-accent" />,
    description: "Gentle wash and fold/iron services using premium hypoallergenic detergents. Perfect for your everyday casuals and linens.",
    features: ["Color sorting", "Hypoallergenic wash", "Fabric softening"]
  },
  {
    id: "shoe-cleaning",
    title: "Shoe & Sneaker Spa",
    icon: <Pocket className="w-8 h-8 text-accent" />,
    description: "Deep interior and exterior cleaning for sneakers, leather shoes, and suede. Restores color and removes odors.",
    features: ["Inside-out cleaning", "Deodorization", "Material-specific care"]
  },
  {
    id: "home-furnishing",
    title: "Home Furnishing Care",
    icon: <Bed className="w-8 h-8 text-accent" />,
    description: "Specialized cleaning for heavy blankets, quilts, curtains, and carpets. Eradicates dust mites and deep-seated dirt.",
    features: ["Anti-bacterial treatment", "Large-capacity machines", "Softness restoration"]
  },
  {
    id: "sofa-cleaning",
    title: "On-site Sofa Cleaning",
    icon: <ShieldCheck className="w-8 h-8 text-accent" />,
    description: "Professional shampooing and vacuuming of your sofas and upholstery, done directly at your home by our expert technicians.",
    features: ["Deep extraction", "Quick drying", "Fabric protection"]
  }
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary dark:text-white mb-4">
          Our Services
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Comprehensive, luxury garment care solutions tailored for every fabric in your wardrobe and home.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {services.map((service) => (
          <Card key={service.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow bg-white dark:bg-slate-950 flex flex-col group overflow-hidden">
            <CardContent className="p-8 flex flex-col h-full relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-primary dark:text-white mb-3">{service.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-grow">
                {service.description}
              </p>
              <ul className="space-y-2 mb-8 border-t border-slate-100 dark:border-slate-800 pt-4">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-slate-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/book" className="mt-auto">
                <Button className="w-full rounded-full bg-slate-100 text-primary hover:bg-primary hover:text-white dark:bg-slate-900 dark:text-white dark:hover:bg-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  Book {service.title} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">
          Ready to experience premium care?
        </h2>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg relative z-10">
          Schedule your first pickup today. Free pickup and delivery from your community.
        </p>
        <Link href="/book" className="relative z-10">
          <Button size="lg" className="rounded-full bg-white text-primary hover:bg-slate-100 h-14 px-10 text-base shadow-lg">
            Schedule a Pickup Now
          </Button>
        </Link>
      </div>

    </div>
  );
}
