import { NextRequest, NextResponse } from 'next/server';
import { hasActiveTallyApiKey } from '@/lib/tally-user-api';

/**
 * Endpoint pour vérifier si un utilisateur a configuré son API Key Tally
 * 
 * GET /api/user/tally/status?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const isConnected = await hasActiveTallyApiKey(userId);

    return NextResponse.json({
      isConnected,
      userId,
    });

  } catch (error) {
    console.error('❌ Error checking Tally API Key status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check Tally API Key status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
