import { NextRequest, NextResponse } from 'next/server';
import { validateProductUrl } from '@/lib/validation';
import { fetchAndParseProduct } from '@/lib/product-parser';
import { AnalyzeProductResponse } from '@/types/product';

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeProductResponse>> {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    const validation = validateProductUrl(url);
    if (!validation.isValid || !validation.sanitizedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'Please enter a valid product URL.',
          errorCode: validation.errorCode || 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    const product = await fetchAndParseProduct(validation.sanitizedUrl);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('Error in analyze-product API:', error);

    const message = error?.message || '';

    if (message === 'SITE_BLOCKED') {
      return NextResponse.json(
        {
          success: false,
          error:
            'This website is protected by anti-bot verification or blocked automated scraping. Please use a direct product link or provide the details manually.',
          errorCode: 'SITE_BLOCKED',
        },
        { status: 422 }
      );
    }

    if (message === 'SITE_TIMEOUT') {
      return NextResponse.json(
        {
          success: false,
          error: 'The website took too long to respond (timeout). Please try again.',
          errorCode: 'SITE_UNREACHABLE',
        },
        { status: 504 }
      );
    }

    if (message.startsWith('SITE_HTTP_ERROR_')) {
      const code = message.replace('SITE_HTTP_ERROR_', '');
      return NextResponse.json(
        {
          success: false,
          error: `The product website returned an HTTP error (${code}). Please check if the link is active.`,
          errorCode: 'SITE_UNREACHABLE',
        },
        { status: 422 }
      );
    }

    if (message === 'NO_PRODUCT_DATA_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not detect product information on this webpage. Ensure the link points directly to a product page.',
          errorCode: 'PARSE_ERROR',
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while analyzing the product page. Please try another link.',
        errorCode: 'UNKNOWN',
      },
      { status: 500 }
    );
  }
}
