import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JournalEntry from '@/lib/models/JournalEntry';
import { analyzeJournalServer } from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const limit = parseInt(searchParams.get('limit') || '50');

    const entries = await JournalEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: entries.map((entry: any) => ({
        id: entry._id.toString(),
        text: entry.text,
        summary: entry.summary,
        mood: entry.mood,
        reflection: entry.reflection,
        date: entry.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('GET /api/entries error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { text, userId = 'anonymous', useHuggingFace = true } = body;

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

    const entry = await JournalEntry.create({
      text,
      summary: analysis.summary,
      mood: analysis.mood,
      reflection: analysis.reflection,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: (entry as any)._id.toString(),
        text: entry.text,
        summary: entry.summary,
        mood: entry.mood,
        reflection: entry.reflection,
        date: (entry as any).createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('POST /api/entries error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
      await JournalEntry.deleteMany({ userId });
      return NextResponse.json({
        success: true,
        message: 'All entries deleted',
      });
    }

    const entryId = searchParams.get('id');
    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Entry ID required' },
        { status: 400 }
      );
    }

    const deleted = await JournalEntry.findByIdAndDelete(entryId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Entry deleted',
    });
  } catch (error: any) {
    console.error('DELETE /api/entries error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
