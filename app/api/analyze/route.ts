import { NextRequest, NextResponse } from 'next/server';
import { analyzeJournalServer } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, useHuggingFace = true } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    let analysis;
    if (useHuggingFace && process.env.HUGGINGFACE_API_TOKEN) {
      analysis = await analyzeJournalServer(
        text, 
        process.env.HUGGINGFACE_API_TOKEN,
        process.env.GOOGLE_AI_API_KEY
      );
    } else {
      const { analyzeJournal } = await import('@/lib/ai');
      analysis = await analyzeJournal(text, false);
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('POST /api/analyze error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
