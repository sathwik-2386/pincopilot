export type PinStatus = 'Draft' | 'Ready to Publish' | 'Published';

export interface GeneratedPinContent {
  title: string;
  description: string;
  keywords: string[];
  board: string;
  cta: string;
}

export interface GeneratePinRequest {
  product: {
    productName: string;
    productImage: string;
    description: string;
    brand?: string;
    price?: string;
    currency?: string;
    canonicalUrl?: string;
    originalUrl: string;
  };
  customInstructions?: string;
  apiKey?: string;
  userDefaults?: {
    defaultCta?: string;
    defaultBoard?: string;
    defaultKeywords?: string;
  };
}

export interface GeneratePinResponse {
  success: boolean;
  pin?: GeneratedPinContent;
  error?: string;
  errorCode?: 'MISSING_API_KEY' | 'API_RATE_LIMIT' | 'INVALID_JSON' | 'GEMINI_ERROR' | 'UNKNOWN';
}

export interface PinItem {
  id: string;
  productName: string;
  productUrl: string;
  image: string;
  title: string;
  description: string;
  keywords: string[];
  board: string;
  cta: string;
  createdAt: string;
  status: PinStatus;
  brand?: string;
  price?: string;
  currency?: string;
}

export interface UserSettings {
  geminiApiKey: string;
  defaultCta: string;
  defaultBoard: string;
  defaultKeywords: string;
  pinterestProfile: string;
}
