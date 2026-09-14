export type CurrencyCode = 'INR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // exchange rate relative to USD
  label: string;
}

export type MaterialType = 'PLA Matte' | 'Tough PETG' | 'High Detail Resin' | 'Carbon Fiber' | 'Dual Silk' | 'Flex TPU';

export interface MaterialOption {
  id: string;
  name: MaterialType;
  description: string;
  priceMultiplier: number;
  badge?: string;
  properties: {
    durability: number; // 1-5
    flexibility: number; // 1-5
    finish: string;
  };
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  popular?: boolean;
}

export interface ProductSize {
  id: string;
  label: string;
  scaleFactor: number; // 1.0 = 100%
  dimensions: {
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userLocation: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  materialUsed?: string;
  userPhoto?: string;
  helpfulCount: number;
}

export type ProductCategory =
  | 'Home Decor'
  | 'Anime & Action Figures'
  | 'Wall Hangings'
  | 'Keychains'
  | 'Sculptures & Accents';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  basePrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  hoverImage: string;
  badges?: ('NEW' | 'BESTSELLER' | 'SUSTAINABLE' | 'LIMITED' | 'TRENDING')[];
  materials: MaterialOption[];
  colors: ColorOption[];
  sizes: ProductSize[];
  defaultMaterial: string;
  defaultColor: string;
  defaultSize: string;
  specs: {
    designer: string;
    license: string;
    weightGrams: number;
    printTimeHours: number;
    infillPercentage: number;
    layerHeightMm: number;
    sku: string;
  };
  detailsAccordion: string;
  stlGeometryType:
    | 'spiral_vase'
    | 'anime_figure'
    | 'wall_art'
    | 'keychain'
    | 'dragon'
    | 'planter'
    | 'lamp'
    | 'chibi'
    | 'sculpture';
  inStock: boolean;
}

export interface CustomPrintQuote {
  file: File | null;
  fileName: string;
  fileSizeMb: number;
  volumeCm3: number;
  dimensionsMm: {
    x: number;
    y: number;
    z: number;
  };
  selectedMaterial: MaterialOption;
  selectedColor: ColorOption;
  infillPercentage: number; // 15, 30, 50, 100
  layerHeightMm: number; // 0.08, 0.12, 0.20, 0.28
  scalePercentage: number; // 50 - 300
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  estimatedPrintTimeHours: number;
  meshPreviewType: 'cube' | 'gear' | 'vase' | 'dragon';
}

export interface CartItem {
  id: string;
  product?: Product;
  customQuote?: CustomPrintQuote;
  selectedMaterial: MaterialOption;
  selectedColor: ColorOption;
  selectedSizeLabel: string;
  dimensions: {
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
  unitPrice: number;
  quantity: number;
  isCustomUpload: boolean;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'apple_pay' | 'cod';

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  giftWrappingFee: number;
  discountAmount: number;
  total: number;
  currency: CurrencyCode;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paymentStatus?: 'paid' | 'captured' | 'pending' | 'cod';
  giftNote?: string;
  status: 'Sliced' | '3D Printing' | 'Post-Processing' | 'Shipped' | 'Delivered';
  trackingNumber: string;
  estimatedDeliveryDate: string;
  printHubAssigned: string;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  materials: string[];
  colors: string[];
  minRating: number;
  sort: 'trending' | 'newest' | 'price-low' | 'price-high' | 'rating';
  searchQuery: string;
}

export interface PrintHub {
  id: string;
  name: string;
  city: string;
  address: string;
  distanceKm: number;
  activePrinters: number;
  queueTimeHours: number;
  rating: number;
  pickupAvailable: boolean;
  phone: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  description: string;
}

export interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  price: number;
  image: string;
  ctaText: string;
  targetView: 'catalog' | 'custom-upload' | 'hubs';
  specs: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcementText: string;
  showAnnouncement: boolean;
  freeShippingThresholdINR: number;
  standardShippingFeeINR: number;
  priorityShippingFeeINR: number;
  coupons: Coupon[];
  heroSlides: HeroSlideData[];
  qualityNotice: string;
}

export interface CustomUploadRecord {
  id: string;
  fileName: string;
  fileSizeMb: number;
  volumeCm3: number;
  dimensionsMm: { x: number; y: number; z: number };
  materialName: string;
  colorName: string;
  infillPercentage: number;
  layerHeightMm: number;
  quantity: number;
  priceINR: number;
  createdAt: string;
  status: 'Pending Review' | 'Sliced & Approved' | 'In Production' | 'Archived';
}
