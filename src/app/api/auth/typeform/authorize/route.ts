import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour initier le flux OAuth Typeform
 * 
 * POST /api/auth/typeform/authorize
 * 
 * Documentation: https://www.typeform.com/developers/get-started/applications/
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

    // Configuration OAuth Typeform
    const clientId = process.env.TYPEFORM_CLIENT_ID;
    const redirectUri = process.env.TYPEFORM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/typeform/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Typeform OAuth not configured' },
        { status: 500 }
      );
    }

    // Scopes nécessaires pour Typeform
    // https://www.typeform.com/developers/get-started/scopes/
    const scopes = [
      'forms:read',
      'forms:write',
      'responses:read',
      'accounts:read',
    ];

    // Construire l'URL d'autorisation
    const authUrl = new URL('https://api.typeform.com/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('state', userId); // Passer le userId dans le state

    return NextResponse.json({
      authUrl: authUrl.toString(),
    });

  } catch (error) {
    console.error('❌ Error initiating Typeform OAuth:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate Typeform OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
