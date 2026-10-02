import * as cheerio from 'cheerio';
import { ProductData } from '@/types/product';
import { sanitizeText } from './validation';

interface RawExtraction {
  name?: string;
  image?: string;
  additionalImages?: string[];
  description?: string;
  brand?: string;
  price?: string;
  currency?: string;
  canonicalUrl?: string;
  source?: 'json-ld' | 'open-graph' | 'twitter' | 'html-meta' | 'fallback';
}

function resolveUrl(url: string | undefined, baseUrl: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return trimmed;
  }
}

function extractFromJsonLd($: cheerio.CheerioAPI, baseUrl: string): RawExtraction | null {
  const scripts = $('script[type="application/ld+json"]');
  let productObj: any = null;

  scripts.each((_, el) => {
    try {
      const rawText = $(el).text();
      if (!rawText) return;
      const data = JSON.parse(rawText);

      const findProduct = (item: any): any => {
        if (!item || typeof item !== 'object') return null;
        if (Array.isArray(item)) {
          for (const sub of item) {
            const found = findProduct(sub);
            if (found) return found;
          }
          return null;
        }
        const type = item['@type'];
        if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
          return item;
        }
        if (item['@graph'] && Array.isArray(item['@graph'])) {
          for (const sub of item['@graph']) {
            const found = findProduct(sub);
            if (found) return found;
          }
        }
        return null;
      };

      const found = findProduct(data);
      if (found) {
        productObj = found;
        return false; // break loop
      }
    } catch {
      // Ignore JSON parse error in individual script tag
    }
  });

  if (!productObj) return null;

  // Extract name
  const name = typeof productObj.name === 'string' ? productObj.name : undefined;

  // Extract images
  let primaryImage = '';
  const additionalImages: string[] = [];

  const parseImageField = (img: any): string[] => {
    if (!img) return [];
    if (typeof img === 'string') return [img];
    if (Array.isArray(img)) {
      return img.flatMap(parseImageField);
    }
    if (typeof img === 'object' && img.url) {
      return [img.url];
    }
    if (typeof img === 'object' && img.contentUrl) {
      return [img.contentUrl];
    }
    return [];
  };

  const imagesFound = parseImageField(productObj.image);
  if (imagesFound.length > 0) {
    primaryImage = resolveUrl(imagesFound[0], baseUrl);
    for (let i = 1; i < imagesFound.length; i++) {
      additionalImages.push(resolveUrl(imagesFound[i], baseUrl));
    }
  }

  // Extract description
  const description = typeof productObj.description === 'string' ? productObj.description : undefined;

  // Extract brand
  let brand: string | undefined;
  if (typeof productObj.brand === 'string') {
    brand = productObj.brand;
  } else if (productObj.brand && typeof productObj.brand === 'object') {
    brand = productObj.brand.name;
  }

  // Extract offers / price
  let price: string | undefined;
  let currency: string | undefined;
  const offers = productObj.offers;
  if (offers) {
    const offer = Array.isArray(offers) ? offers[0] : offers;
    if (offer) {
      if (offer.price !== undefined) {
        price = String(offer.price);
      } else if (offer.lowPrice !== undefined) {
        price = String(offer.lowPrice);
      }
      if (offer.priceCurrency) {
        currency = String(offer.priceCurrency);
      }
    }
  }

  return {
    name,
    image: primaryImage || undefined,
    additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
    description,
    brand,
    price,
    currency,
    source: 'json-ld',
  };
}

function extractFromOpenGraph($: cheerio.CheerioAPI, baseUrl: string): RawExtraction {
  const name =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="og:title"]').attr('content');

  const imageRaw =
    $('meta[property="og:image:secure_url"]').attr('content') ||
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="og:image"]').attr('content');

  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="og:description"]').attr('content');

  const brand =
    $('meta[property="product:brand"]').attr('content') ||
    $('meta[property="og:site_name"]').attr('content');

  const price =
    $('meta[property="product:price:amount"]').attr('content') ||
    $('meta[property="og:price:amount"]').attr('content');

  const currency =
    $('meta[property="product:price:currency"]').attr('content') ||
    $('meta[property="og:price:currency"]').attr('content');

  return {
    name: name?.trim(),
    image: imageRaw ? resolveUrl(imageRaw, baseUrl) : undefined,
    description: description?.trim(),
    brand: brand?.trim(),
    price: price?.trim(),
    currency: currency?.trim(),
    source: 'open-graph',
  };
}

function extractFromTwitter($: cheerio.CheerioAPI, baseUrl: string): RawExtraction {
  const name =
    $('meta[name="twitter:title"]').attr('content') ||
    $('meta[property="twitter:title"]').attr('content');

  const imageRaw =
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[name="twitter:image:src"]').attr('content') ||
    $('meta[property="twitter:image"]').attr('content');

  const description =
    $('meta[name="twitter:description"]').attr('content') ||
    $('meta[property="twitter:description"]').attr('content');

  return {
    name: name?.trim(),
    image: imageRaw ? resolveUrl(imageRaw, baseUrl) : undefined,
    description: description?.trim(),
    source: 'twitter',
  };
}

function extractFromStandardHtml($: cheerio.CheerioAPI, baseUrl: string): RawExtraction {
  const canonicalUrl = $('link[rel="canonical"]').attr('href');

  // Page title cleaning: e.g. "Product Name | Brand Name" -> extract clean title
  let name = $('h1').first().text().trim() || $('title').text().trim();
  if (name.includes('|')) {
    name = name.split('|')[0].trim();
  } else if (name.includes(' - ')) {
    name = name.split(' - ')[0].trim();
  }

  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[name="Description"]').attr('content');

  // Fallback image: look for itemprop="image" or largest image in main / article
  let imageRaw =
    $('img[itemprop="image"]').attr('src') ||
    $('img.product-image').attr('src') ||
    $('img[data-main-image]').attr('src');

  if (!imageRaw) {
    const candidateImgs: string[] = [];
    $('main img, article img, #product img, .product img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon')) {
        candidateImgs.push(src);
      }
    });
    if (candidateImgs.length > 0) {
      imageRaw = candidateImgs[0];
    }
  }

  return {
    name: name || undefined,
    image: imageRaw ? resolveUrl(imageRaw, baseUrl) : undefined,
    description: description?.trim(),
    canonicalUrl: canonicalUrl ? resolveUrl(canonicalUrl, baseUrl) : undefined,
    source: 'html-meta',
  };
}

export function parseProductHtml(html: string, originalUrl: string): ProductData {
  const $ = cheerio.load(html);

  // Check for common blocking indicators
  const pageTitle = $('title').text().trim().toLowerCase();
  const bodyText = $('body').text().slice(0, 1000).toLowerCase();

  const isBlocked =
    pageTitle.includes('403 forbidden') ||
    pageTitle.includes('access denied') ||
    pageTitle.includes('attention required! | cloudflare') ||
    pageTitle.includes('just a moment...') ||
    bodyText.includes('please enable javascript to view the page') ||
    bodyText.includes('checking your browser before accessing');

  if (isBlocked) {
    throw new Error('SITE_BLOCKED');
  }

  const jsonLd = extractFromJsonLd($, originalUrl);
  const og = extractFromOpenGraph($, originalUrl);
  const twitter = extractFromTwitter($, originalUrl);
  const htmlMeta = extractFromStandardHtml($, originalUrl);

  // Prioritize structured metadata:
  // 1. JSON-LD
  // 2. Open Graph
  // 3. Twitter
  // 4. HTML Meta
  const resolvedName =
    jsonLd?.name ||
    og.name ||
    twitter.name ||
    htmlMeta.name ||
    '';

  const resolvedImage =
    jsonLd?.image ||
    og.image ||
    twitter.image ||
    htmlMeta.image ||
    '';

  const resolvedDescription =
    jsonLd?.description ||
    og.description ||
    twitter.description ||
    htmlMeta.description ||
    '';

  const resolvedBrand =
    jsonLd?.brand ||
    og.brand ||
    '';

  const resolvedPrice =
    jsonLd?.price ||
    og.price ||
    '';

  const resolvedCurrency =
    jsonLd?.currency ||
    og.currency ||
    (resolvedPrice ? 'USD' : '');

  const canonicalUrl =
    htmlMeta.canonicalUrl ||
    $('link[rel="canonical"]').attr('href') ||
    originalUrl;

  const resolvedSource =
    jsonLd?.name ? 'json-ld' :
    og.name ? 'open-graph' :
    twitter.name ? 'twitter' :
    'html-meta';

  // If even after looking through all layers we found no name or title
  if (!resolvedName && !resolvedDescription && !resolvedImage) {
    throw new Error('NO_PRODUCT_DATA_FOUND');
  }

  return {
    productName: sanitizeText(resolvedName, 300),
    productImage: resolvedImage,
    description: sanitizeText(resolvedDescription, 2000),
    brand: sanitizeText(resolvedBrand, 100),
    price: sanitizeText(resolvedPrice, 50),
    currency: sanitizeText(resolvedCurrency, 10),
    canonicalUrl: resolveUrl(canonicalUrl, originalUrl),
    originalUrl,
    additionalImages: jsonLd?.additionalImages || [],
    extractionSource: resolvedSource,
  };
}

export async function fetchAndParseProduct(url: string): Promise<ProductData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (response.status === 403 || response.status === 429) {
      throw new Error('SITE_BLOCKED');
    }

    if (!response.ok) {
      throw new Error(`SITE_HTTP_ERROR_${response.status}`);
    }

    const html = await response.text();
    return parseProductHtml(html, url);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('SITE_TIMEOUT');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
