import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'No API key provided. Please enter a key or set GEMINI_API_KEY in .env.local',
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping test. Reply with exactly "PONG".',
    });

    if (response.text) {
      return NextResponse.json({
        success: true,
        message: 'Connected to Gemini API successfully!',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Received empty response from Gemini.',
      },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('Error testing Gemini key:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to authenticate with Gemini API.',
      },
      { status: 400 }
    );
  }
}
