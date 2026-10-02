export interface ProductData {
  productName: string;
  productImage: string;
  description: string;
  brand: string;
  price: string;
  currency: string;
  canonicalUrl: string;
  originalUrl: string;
  additionalImages?: string[];
  extractionSource?: 'json-ld' | 'open-graph' | 'twitter' | 'html-meta' | 'fallback';
}

export interface AnalyzeProductRequest {
  url: string;
}

export interface AnalyzeProductResponse {
  success: boolean;
  product?: ProductData;
  error?: string;
  errorCode?: 'INVALID_URL' | 'SSRF_BLOCKED' | 'SITE_UNREACHABLE' | 'SITE_BLOCKED' | 'PARSE_ERROR' | 'UNKNOWN';
}
