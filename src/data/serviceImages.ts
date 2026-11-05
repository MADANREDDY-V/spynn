export interface ServiceImageItem {
  src: string;
  alt: string;
  label: string;
}

export const HERO_CAROUSEL_IMAGES: ServiceImageItem[] = [
  {
    src: "/banner2.jpg",
    alt: "SPYNN garment care specialist delivering clean pressed clothes to residential community",
    label: "Doorstep Society Pickup",
  },
  {
    src: "/images/services/dry-cleaning/suit.jpg",
    alt: "Master dry cleaning for luxury suits and designer wear",
    label: "Master Fabric Care",
  },
  {
    src: "/images/services/steam-ironing/pressing.jpg",
    alt: "Italian high-pressure steam pressing and fabric sanitization",
    label: "Italian Steam Finishing",
  },
  {
    src: "/banner1.jpg",
    alt: "Hygienic personal batch washing and laundry care",
    label: "Hygienic Laundry",
  },
  {
    src: "/images/services/shoe-cleaning/sneakers.jpg",
    alt: "Shoe and sneaker spa restoration",
    label: "Footwear Rejuvenation",
  },
  {
    src: "/banner3.jpg",
    alt: "Curtain and heavy household textile restoration",
    label: "White-Glove Delivery",
  },
];

export const SERVICE_IMAGES: Record<string, ServiceImageItem[]> = {
  "dry-cleaning": [
    {
      src: "/images/services/dry-cleaning/suit.jpg",
      alt: "Expert dry cleaning for tailored suits and tuxedos",
      label: "Suits & Blazers",
    },
    {
      src: "/images/services/dry-cleaning/saree.jpg",
      alt: "Gentle eco-solvent dry cleaning for delicate silk sarees",
      label: "Silk Sarees",
    },
    {
      src: "/images/services/dry-cleaning/designer.jpg",
      alt: "Specialized couture and designer garment care",
      label: "Designer Garments",
    },
  ],
  "steam-ironing": [
    {
      src: "/images/services/steam-ironing/pressing.jpg",
      alt: "Italian high-pressure steam pressing",
      label: "Steam Pressing",
    },
    {
      src: "/images/services/steam-ironing/shirts.jpg",
      alt: "Executive formal shirts steam pressed on hangers",
      label: "Executive Shirts",
    },
    {
      src: "/images/services/steam-ironing/trousers.jpg",
      alt: "Sharply creased formal trousers",
      label: "Formal Trousers",
    },
  ],
  "wash-and-fold": [
    {
      src: "/images/services/wash-and-fold/washing.jpg",
      alt: "Hygienic segregated washing cycle",
      label: "Segregated Washing",
    },
    {
      src: "/images/services/wash-and-fold/folding.jpg",
      alt: "Color-sorted, neatly folded everyday laundry",
      label: "Meticulous Folding",
    },
    {
      src: "/images/services/wash-and-fold/packed.jpg",
      alt: "Clean laundry boxed in moisture-barrier packaging",
      label: "Neatly Packed",
    },
  ],
  "shoe-cleaning": [
    {
      src: "/images/services/shoe-cleaning/sneakers.jpg",
      alt: "Revitalized white sneakers and athletic footwear",
      label: "Sneaker Spa",
    },
    {
      src: "/images/services/shoe-cleaning/leather.jpg",
      alt: "Nourished and polished luxury leather footwear",
      label: "Leather Shoes",
    },
    {
      src: "/images/services/shoe-cleaning/restoration.jpg",
      alt: "Detailed midsole and upper restoration for footwear",
      label: "Sole Restoration",
    },
  ],
  "household-cleaning": [
    {
      src: "/images/services/household-cleaning/blankets.jpg",
      alt: "Deep thermal sanitization for heavy winter blankets",
      label: "Heavy Blankets",
    },
    {
      src: "/images/services/household-cleaning/comforters.jpg",
      alt: "Anti-allergen sanitization for duvets and comforters",
      label: "Comforters & Quilts",
    },
    {
      src: "/images/services/household-cleaning/sofas.jpg",
      alt: "Deep fabric cleaning for cushions and sofa textiles",
      label: "Sofa & Cushion Care",
    },
  ],
  "curtain-cleaning": [
    {
      src: "/images/services/curtain-cleaning/drapes.jpg",
      alt: "Gentle restoration for blackout drapes and luxury curtains",
      label: "Curtain Washing",
    },
    {
      src: "/images/services/curtain-cleaning/steaming.jpg",
      alt: "In-depth steaming and wrinkle release for sheer curtains",
      label: "Steam Refresh",
    },
    {
      src: "/images/services/curtain-cleaning/restoration.jpg",
      alt: "Floor-to-ceiling drape dust and allergen extraction",
      label: "Drape Restoration",
    },
  ],
};
