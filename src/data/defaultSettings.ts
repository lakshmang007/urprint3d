import { StoreSettings, Coupon, HeroSlideData } from '../types';
import animeActionFigureImg from '../assets/images/anime_action_figure_1786878754221.jpg';
import wallHangingArtImg from '../assets/images/wall_hanging_art_1786878773767.jpg';
import categoryHomeDecorImg from '../assets/images/category_home_decor_1785305986796.jpg';

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'INDIA3D',
    discountType: 'flat',
    discountValue: 150,
    minOrderAmount: 499,
    isActive: true,
    description: 'Flat ₹150 off on all Indian 3D print orders above ₹499',
  },
  {
    id: 'c-2',
    code: 'URPRINT10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 999,
    isActive: true,
    description: '10% instant discount on orders above ₹999',
  },
  {
    id: 'c-3',
    code: 'MAKER500',
    discountType: 'flat',
    discountValue: 500,
    minOrderAmount: 2499,
    isActive: true,
    description: '₹500 off on bulk and premium resin collector statues',
  },
];

export const DEFAULT_HERO_SLIDES: HeroSlideData[] = [
  {
    id: 'slide-1',
    title: 'Anime Action Figures & Statues',
    subtitle: 'Micro-layer 0.08mm resin & dual-silk action poses, katana champions, and chibi collectibles.',
    tag: 'FEATURED ANIME COLLECTION',
    price: 1899,
    image: animeActionFigureImg,
    ctaText: 'Shop Anime Models',
    targetView: 'catalog',
    specs: '0.08mm Layer Resolution • Custom Scale 25%-250%',
  },
  {
    id: 'slide-2',
    title: 'Upload Any 3D STL for Custom Print',
    subtitle: 'Drag & drop your STL / OBJ files. Instant 3D mesh slicing, material selection & automated quote engine.',
    tag: 'CUSTOM 3D PRINTING STUDIO',
    price: 299,
    image: wallHangingArtImg,
    ctaText: 'Upload STL File Now',
    targetView: 'custom-upload',
    specs: 'Instant Mesh Slicing • 6 Materials • Express Hub Delivery',
  },
  {
    id: 'slide-3',
    title: 'Architectural Wall Art & Decor',
    subtitle: 'Intricate geometric mandalas, Japanese wave reliefs, and parametric vases designed for modern interiors.',
    tag: 'HOME DECOR & ACCENTS',
    price: 1499,
    image: categoryHomeDecorImg,
    ctaText: 'Explore Wall Art & Decor',
    targetView: 'catalog',
    specs: 'Continuous Layer Finish • Eco-Friendly Bio-Polymers',
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'UrPrint-3D models',
  tagline: 'Pan-India 3D Printing & Additive Marketplace',
  announcementText: 'Free Pan-India Express Delivery on orders over ₹999 • 19,000+ PIN Codes Serviced • GST Included',
  showAnnouncement: true,
  freeShippingThresholdINR: 999,
  standardShippingFeeINR: 99,
  priorityShippingFeeINR: 199,
  coupons: DEFAULT_COUPONS,
  heroSlides: DEFAULT_HERO_SLIDES,
  qualityNotice: 'Every 3D model undergoes micro-calibrated slicing and dimensional tolerance inspection before final dispatch.',
};
