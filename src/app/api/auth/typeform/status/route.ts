import { NextRequest, NextResponse } from 'next/server';
import { hasValidTypeformTokens } from '@/lib/typeform-tokens';

/**
 * Endpoint pour vérifier si un utilisateur a connecté son compte Typeform
 * 
 * GET /api/auth/typeform/status?userId=xxx
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

    // Vérifier dans la DB si l'utilisateur a des tokens Typeform valides
    const isConnected = await hasValidTypeformTokens(userId);

    return NextResponse.json({
      isConnected,
      userId,
    });

  } catch (error) {
    console.error('❌ Error checking Typeform auth status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check Typeform auth status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
