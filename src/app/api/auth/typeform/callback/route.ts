import { NextRequest, NextResponse } from 'next/server';
import { saveTypeformTokens } from '@/lib/typeform-tokens';

/**
 * Endpoint pour gérer le callback OAuth Typeform
 * 
 * GET /api/auth/typeform/callback?code=xxx&state=userId
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const userId = searchParams.get('state'); // Le userId est dans le state
    const error = searchParams.get('error');

    if (error) {
      // L'utilisateur a refusé l'autorisation
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Autorisation refusée</title>
          </head>
          <body>
            <script>
              window.opener.postMessage({ type: 'typeform-auth-error', error: '${error}' }, '*');
              window.close();
            </script>
            <p>Autorisation refusée. Vous pouvez fermer cette fenêtre.</p>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing code or userId' },
        { status: 400 }
      );
    }

    // Échanger le code contre un access token
    const clientId = process.env.TYPEFORM_CLIENT_ID;
    const clientSecret = process.env.TYPEFORM_CLIENT_SECRET;
    const redirectUri = process.env.TYPEFORM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/typeform/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Typeform OAuth not configured' },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch('https://api.typeform.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Erreur d'authentification</title>
          </head>
          <body>
            <script>
              window.opener.postMessage({ type: 'typeform-auth-error', error: 'token_exchange_failed' }, '*');
              window.close();
            </script>
            <p>Erreur lors de l'authentification. Vous pouvez fermer cette fenêtre.</p>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Sauvegarder les tokens dans la base de données
    await saveTypeformTokens(userId, tokenData);

    console.log('✅ Typeform OAuth successful for user:', userId);

    // Fermer la popup et notifier la fenêtre parent
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connexion réussie</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({ type: 'typeform-auth-success', userId: '${userId}' }, '*');
            window.close();
          </script>
          <p>✅ Connexion réussie ! Cette fenêtre va se fermer automatiquement.</p>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('❌ Error in Typeform OAuth callback:', error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erreur</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({ type: 'typeform-auth-error', error: 'unknown' }, '*');
            window.close();
          </script>
          <p>Une erreur s'est produite. Vous pouvez fermer cette fenêtre.</p>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
