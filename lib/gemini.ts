import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { GeneratedPinContent } from '@/types/pin';

const PinOutputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).min(3),
  board: z.string().min(1),
  cta: z.string().min(1),
});

export interface GeneratePinParams {
  product: {
    productName: string;
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

export function generateFallbackPin(product: GeneratePinParams['product'], defaults?: GeneratePinParams['userDefaults']): GeneratedPinContent {
  const brandPrefix = product.brand ? `${product.brand} ` : '';
  const priceSuffix = product.price ? ` | ${product.currency || '$'}${product.price}` : '';
  
  // Clean product title
  const cleanTitle = `${brandPrefix}${product.productName}`.slice(0, 95);
  
  // Clean description
  let desc = product.description || `Discover the ${product.productName}. High quality, versatile, and stylish choice for everyday use.`;
  if (desc.length > 350) {
    desc = desc.slice(0, 347) + '...';
  }
  const cta = defaults?.defaultCta || 'Shop the Product';
  const fullDesc = `${desc} Click through to check details and order online. ${cta}!`;

  // Keywords
  const defaultKw = defaults?.defaultKeywords
    ? defaults.defaultKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [];

  const nameWords = product.productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const keywords = Array.from(
    new Set([
      ...nameWords.slice(0, 5),
      product.brand ? product.brand.toLowerCase() : '',
      'gift ideas',
      'shopping guide',
      'aesthetic',
      ...defaultKw,
    ])
  ).filter(Boolean).slice(0, 8);

  const board = defaults?.defaultBoard || (product.brand ? `${product.brand} Favorites` : 'Must-Have Products');

  return {
    title: cleanTitle,
    description: fullDesc,
    keywords,
    board,
    cta,
  };
}

export async function generatePinWithGemini(params: GeneratePinParams): Promise<{ pin: GeneratedPinContent; usedFallback?: boolean }> {
  const apiKey = params.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // If no API key is provided, return intelligent fallback copy with an explanatory flag
    return {
      pin: generateFallbackPin(params.product, params.userDefaults),
      usedFallback: true,
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an expert Pinterest SEO and affiliate marketing specialist.
Your task is to generate high-converting, search-optimized Pinterest pin assets for a product.

STRICT TITLE RULES:
- Be natural, engaging, and clear.
- Max 100 characters.
- Include important high-intent search keywords for the product.
- Avoid keyword stuffing, ALL CAPS shouting, excessive emojis, and clickbait.

STRICT DESCRIPTION RULES:
- Max 500 characters.
- Clearly describe the product benefits, aesthetic, and use-case.
- Naturally weave in relevant search terms that Pinterest users search for.
- Include a clear, persuasive call-to-action (CTA).
- Strictly avoid misleading claims, fake guarantees, or unsupported medical claims.

KEYWORDS:
- Provide 5 to 10 highly relevant Pinterest search keywords/tags.

BOARD:
- Suggest the single most appropriate, highly searched Pinterest board/category name.
${params.userDefaults?.defaultBoard ? `(User preferred board if relevant: "${params.userDefaults.defaultBoard}")` : ''}

CTA:
- Generate a concise, high-converting call to action (e.g. "Discover More", "Shop the Look", "Check It Out", "Explore Details").
${params.userDefaults?.defaultCta ? `(User preferred CTA if relevant: "${params.userDefaults.defaultCta}")` : ''}

You MUST output ONLY a valid JSON object matching this schema:
{
  "title": "string",
  "description": "string",
  "keywords": ["string", "string"],
  "board": "string",
  "cta": "string"
}`;

  const userPrompt = `Generate a Pinterest pin bundle for this product:
Product Name: ${params.product.productName}
Brand: ${params.product.brand || 'N/A'}
Price: ${params.product.price ? `${params.product.currency || '$'}${params.product.price}` : 'N/A'}
Description: ${params.product.description || 'N/A'}
Product URL: ${params.product.canonicalUrl || params.product.originalUrl}
${params.customInstructions ? `Additional User Instructions: ${params.customInstructions}` : ''}
${params.userDefaults?.defaultKeywords ? `Suggested Base Keywords: ${params.userDefaults.defaultKeywords}` : ''}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemInstruction}\n\n${userPrompt}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '';
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences
      const cleanJson = responseText.replace(/```json\s*|```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    const validated = PinOutputSchema.parse(parsed);

    return {
      pin: {
        title: validated.title.trim().slice(0, 100),
        description: validated.description.trim().slice(0, 500),
        keywords: validated.keywords.map((k) => k.trim()).filter(Boolean),
        board: validated.board.trim(),
        cta: validated.cta.trim(),
      },
      usedFallback: false,
    };
  } catch (error: any) {
    console.error('Gemini generation error:', error);
    // If the error was a model deprecation or rate limit, we can try with fallback or rethrow
    if (error?.status === 429) {
      throw new Error('Gemini API rate limit reached. Please wait a moment and try again.');
    }
    if (error?.status === 400 || error?.message?.includes('API key')) {
      throw new Error('Invalid Gemini API Key. Please verify your API key in Settings.');
    }
    // Return fallback with error indication if needed
    throw error;
  }
}
