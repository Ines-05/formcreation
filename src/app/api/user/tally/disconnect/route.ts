import { NextRequest, NextResponse } from 'next/server';
import { removeUserTallyApiKey } from '@/lib/tally-user-api';

/**
 * Endpoint pour supprimer l'API Key Tally d'un utilisateur
 * 
 * POST /api/user/tally/disconnect
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await removeUserTallyApiKey(userId);

    return NextResponse.json({
      success: true,
      message: 'Tally API Key disconnected successfully',
    });

  } catch (error) {
    console.error('❌ Error disconnecting Tally API Key:', error);
    return NextResponse.json(
      { 
        error: 'Failed to disconnect Tally API Key',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
