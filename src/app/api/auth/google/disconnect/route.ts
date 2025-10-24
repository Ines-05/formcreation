import { NextRequest, NextResponse } from 'next/server';
import { deleteGoogleTokens } from '@/lib/google-tokens';

/**
 * Endpoint pour déconnecter le compte Google d'un utilisateur
 * 
 * POST /api/auth/google/disconnect
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

    // Supprimer les tokens de la DB
    await deleteGoogleTokens(userId);

    console.log('✅ Google account disconnected for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Google account disconnected',
    });

  } catch (error) {
    console.error('❌ Error disconnecting Google account:', error);
    return NextResponse.json(
      { 
        error: 'Failed to disconnect Google account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
