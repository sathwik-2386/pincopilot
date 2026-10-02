import { NextRequest, NextResponse } from 'next/server';
import { generatePinWithGemini } from '@/lib/gemini';
import { GeneratePinRequest, GeneratePinResponse } from '@/types/pin';

export async function POST(req: NextRequest): Promise<NextResponse<GeneratePinResponse>> {
  try {
    const body: GeneratePinRequest = await req.json().catch(() => ({}));
    const { product, customInstructions, apiKey, userDefaults } = body;

    if (!product || !product.productName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product name and information are required to generate Pinterest assets.',
        },
        { status: 400 }
      );
    }

    const { pin, usedFallback } = await generatePinWithGemini({
      product,
      customInstructions,
      apiKey,
      userDefaults,
    });

    return NextResponse.json({
      success: true,
      pin,
    });
  } catch (error: any) {
    console.error('Error in generate-pin API route:', error);

    const message = error?.message || 'Failed to generate pin content.';

    return NextResponse.json(
      {
        success: false,
        error: message,
        errorCode: 'GEMINI_ERROR',
      },
      { status: 500 }
    );
  }
}
