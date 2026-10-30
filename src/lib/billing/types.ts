export const SERVICES = [
  "Dry Cleaning",
  "Ironing",
  "Shoe Cleaning",
  "Household",
  "Laundry",
] as const;
export type Service = (typeof SERVICES)[number];

export const GARMENT_CATEGORIES = [
  "Upper Wear",
  "Bottom Wear",
  "Full Body",
  "Winter Wear",
  "Starch",
  "Household",
  "Bedding & Linen",
  "Curtains & Living",
  "Footwear",
  "Bags",
  "Kids",
  "Designer Wear",
  "Men",
  "Women",
  "Wash & Fold",
  "Wash & Iron",
] as const;
export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number] | string;

export const ORDER_STATUSES = ["Received", "Processing", "Ready", "Delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["unpaid", "partial", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["Cash", "Online", "Split Payment"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const GARMENT_UNITS = ["item", "pair", "kg", "sqft"] as const;
export type GarmentUnit = (typeof GARMENT_UNITS)[number];

export const ILLUSTRATION_KEYS = [
  "jacket",
  "overcoat",
  "shirt",
  "silk-shirt",
  "suit",
  "suit3",
  "sweater",
  "tie",
  "trouser",
  "jeans",
  "blazer",
  "tshirt",
  "dress",
  "evening-dress",
  "scarf",
  "skirt",
  "top",
  "saree",
  "bridal-saree",
  "gown",
  "lehenga",
  "nightwear",
  "legging",
  "duvet",
  "kurta",
  "blouse",
  "waistcoat",
  "sherwani",
  // Footwear illustrations
  "sneakers",
  "leather-shoe",
  "boots",
  "sandal",
  "loafers",
  "slippers",
  "canvas-shoe",
  // Kids wear
  "kids-wear",
  // Household illustrations
  "bedsheet",
  "quilt-cover",
  "blanket",
  "comforter",
  "curtains",
  "pillow",
  "sofa-cover",
  "towel",
  "tablecloth",
  "carpet",
  "toy",
  // Bags
  "backpack",
  "trolley-bag",
  // Laundry illustrations
  "laundry",
  "wash-fold",
  "wash-iron",
  // Custom item
  "custom-item",
] as const;
export type IllustrationKey = (typeof ILLUSTRATION_KEYS)[number];

export type Garment = {
  id: string;
  name: string;
  variant?: string;
  category: GarmentCategory;
  service: Service;
  illustration: IllustrationKey;
  barcode: string;
  price: number;
  prices: Record<Service, number>;
  unit?: GarmentUnit;
  startingPriceIndicator?: boolean; // True if '+' in PDF (e.g. 100+, 220+)
  estimatedCost?: number; // Optional unit cost for profit estimation
  isActive?: boolean;
};

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
};

export type CartLine = {
  id: string;
  garmentId: string;
  garmentName: string;
  variant?: string;
  illustration: IllustrationKey;
  service: Service;
  quantity: number;
  unitPrice: number;
  unit?: GarmentUnit;
  estimatedCost?: number;
};

export type CustomerSnapshot = {
  name: string;
  mobile: string;
  address: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customer: CustomerSnapshot;
  items: CartLine[];
  notes: string;
  discount: number; // Discount amount in ₹
  discountPercent?: number; // Discount percentage (0-100)
  taxPercent?: number; // Legacy field
  amountPaid: number;
  paymentMethod?: PaymentMethod;
  cashAmount?: number;
  onlineAmount?: number;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type DraftBill = {
  items: CartLine[];
  customerId: string | null;
  customer: CustomerSnapshot;
  notes: string;
  discountPercent: number;
  amountPaid: number;
  createdAt?: string;
  service?: Service;
};

export type BillingStoreData = {
  garments: Garment[];
  customers: Customer[];
  orders: Order[];
};

export type OrderTotals = {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  itemCount: number;
  // Backward compatibility aliases
  discount?: number;
  taxable?: number;
  tax?: number;
};
