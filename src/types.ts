export type CategoryId = 
  | 'software-keys' 
  | 'ai-prompts' 
  | 'social-media' 
  | 'elearning' 
  | 'web-assets'
  | 'ebooks';

export type DeliveryType = 'license_key' | 'direct_download' | 'access_link' | 'prompt_bundle' | 'ebook';

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  priceUSD: number;
  originalPriceUSD: number;
  categoryId: CategoryId;
  categoryName: string;
  rating: number;
  reviewsCount: number;
  deliveryType: DeliveryType;
  deliveryFormat: string; // e.g. "Cryptographic License Key (25-Digit)", ".ZIP Archive 420 MB"
  downloadSize?: string;
  version: string;
  licenseType: string;
  features: string[];
  systemRequirements?: string[];
  includedFiles: string[];
  tags: string[];
  badge?: string; // e.g. "Best Seller", "New Release", "Editor's Choice"
  demoUrl?: string;
  gradientTheme: string; // Tailwind gradient classes
  iconType: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  shortDescription: string;
  count: number;
  iconName: string;
  accentColor: 'cyan' | 'purple' | 'emerald' | 'amber';
  highlightTag: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedLicense?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  memberSince: string;
  tier: string;
}

export interface IssuedLicense {
  productId: string;
  productName: string;
  key: string;
  issuedAt: string;
  expiresAt: string;
  maxDevices: number;
  activeDevices: number;
  status: 'active' | 'revoked' | 'expired';
  activatedMachines?: string[];
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: CurrencyCode;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'crypto';
  transactionRef: string;
  licenses: IssuedLicense[];
  downloadPayloads: {
    productId: string;
    productName: string;
    fileName: string;
    fileSize: string;
    downloadUrl: string;
    expiresHours: number;
  }[];
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}
