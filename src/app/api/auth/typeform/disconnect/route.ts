import { NextRequest, NextResponse } from 'next/server';
import { deleteTypeformTokens } from '@/lib/typeform-tokens';

/**
 * Endpoint pour déconnecter le compte Typeform
 * 
 * POST /api/auth/typeform/disconnect
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

    // Supprimer les tokens Typeform de la DB
    await deleteTypeformTokens(userId);

    console.log('✅ Typeform account disconnected for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Typeform account disconnected',
    });

  } catch (error) {
    console.error('❌ Error disconnecting Typeform account:', error);
    return NextResponse.json(
      { 
        error: 'Failed to disconnect Typeform account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
