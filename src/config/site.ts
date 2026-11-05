export const siteConfig = {
  name: "SPYNN Dry Cleaning Studio",
  shortName: "SPYNN",
  description: "Exceptional garment care thoughtfully delivered to premium residential communities across Hyderabad.",
  url: "https://spynn.in",
  contact: {
    phone: "+91 98666 35661",
    whatsapp: "919866635661",
    email: "spynndrycleaning@gmail.com",
    workingHours: "Monday to Sunday, 8:00 AM – 9:00 PM",
    emergencyContact: "+91 98666 35661",
  },
  locations: [
    {
      name: "Narsingi",
      slug: "narsingi",
      badge: "Flagship Studio",
      area: "Narsingi & Tellapur",
      description: "Serving Vessella Meadows, Gardenia Florence Villas, Hallmark Skyrena, and Hallmark Treasor.",
    },
    {
      name: "Kokapet",
      slug: "kokapet",
      badge: "Studio",
      area: "Kokapet & Financial District",
      description: "Serving gated villas and luxury high-rises across Kokapet and the Financial District corridor.",
    },
    {
      name: "Chandanagar",
      slug: "chandanagar",
      badge: "Studio",
      area: "Chandanagar & Miyapur",
      description: "Serving Girija Marvel and premium residential communities in the Chandanagar corridor.",
    },
  ],
  services: [
    { name: "Dry Cleaning", slug: "dry-cleaning", desc: "Expert solvent-based care for suits, designer wear, and delicate silks." },
    { name: "Steam Ironing", slug: "steam-ironing", desc: "High-pressure Italian steam finish for crisp, wrinkle-free daily wear." },
    { name: "Wash & Fold", slug: "wash-and-fold", desc: "Gentle hygienic wash using premium hypoallergenic fabric conditioners." },
    { name: "Shoe Cleaning", slug: "shoe-cleaning", desc: "Deep interior, exterior, and sole restoration for sneakers and leather footwear." },
    { name: "Household Item Cleaning", slug: "household-cleaning", desc: "Thorough sanitization and cleaning for blankets, quilts, and bedspreads." },
    { name: "Curtain Cleaning", slug: "curtain-cleaning", desc: "Dust-mite eradication and gentle restoration for sheer and blackout drapes." },
  ],
  navLinks: [
    { title: "Home", href: "/" },
    { title: "Services", href: "/services" },
    { title: "About Us", href: "/about" },
    { title: "Communities", href: "/communities" },
    { title: "Locations", href: "/locations" },
    { title: "Franchise", href: "/franchise" },
    { title: "Contact", href: "/contact" },
  ],
  social: {
    instagram: "https://instagram.com/spynnstudio",
    facebook: "https://facebook.com/spynnstudio",
    twitter: "https://twitter.com/spynnstudio",
  },
};

export type SiteConfig = typeof siteConfig;
