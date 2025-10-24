import { NextRequest, NextResponse } from 'next/server';
import { hasValidGoogleTokens } from '@/lib/google-tokens';

/**
 * Endpoint pour vérifier si un utilisateur a connecté son compte Google
 * 
 * GET /api/auth/google/status?userId=xxx
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

    // Vérifier dans la DB si l'utilisateur a des tokens Google valides
    const isConnected = await hasValidGoogleTokens(userId);

    return NextResponse.json({
      isConnected,
      userId,
    });

  } catch (error) {
    console.error('❌ Error checking Google auth status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check Google auth status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
