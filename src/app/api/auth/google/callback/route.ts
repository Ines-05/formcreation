import { NextRequest, NextResponse } from 'next/server';
import { saveGoogleTokens } from '@/lib/google-tokens';

// Force dynamic rendering to avoid build-time database connections
export const dynamic = 'force-dynamic';

/**
 * Endpoint pour gérer le callback OAuth Google
 * 
 * GET /api/auth/google/callback?code=xxx&state=userId
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
              window.opener.postMessage({ type: 'google-auth-error', error: '${error}' }, '*');
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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google OAuth not configured' },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
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
              window.opener.postMessage({ type: 'google-auth-error', error: 'token_exchange_failed' }, '*');
              window.close();
            </script>
            <p>Erreur lors de l'authentification. Vous pouvez fermer cette fenêtre.</p>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Récupérer l'email de l'utilisateur (optionnel)
    let userEmail: string | undefined;
    try {
      const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo = await userinfoResponse.json();
      userEmail = userInfo.email;
    } catch (err) {
      console.warn('Could not fetch user email:', err);
    }

    // Sauvegarder les tokens dans la base de données
    await saveGoogleTokens(userId, tokenData, userEmail);

    console.log('✅ Google OAuth successful for user:', userId, userEmail);

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
            window.opener.postMessage({ type: 'google-auth-success', userId: '${userId}' }, '*');
            window.close();
          </script>
          <p>✅ Connexion réussie ! Cette fenêtre va se fermer automatiquement.</p>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('❌ Error in Google OAuth callback:', error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erreur</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({ type: 'google-auth-error', error: 'unknown' }, '*');
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
