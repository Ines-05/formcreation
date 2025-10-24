import { connectDB } from './mongodb';
import UserGoogleTokens from '@/models/UserGoogleTokens';
import { encrypt, decrypt } from './encryption';

/**
 * Interface pour les données de tokens retournées par Google
 */
interface GoogleTokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // En secondes
  scope: string;
  token_type: string;
}

/**
 * Sauvegarder les tokens Google pour un utilisateur
 */
export async function saveGoogleTokens(userId: string, tokenData: GoogleTokenData, email?: string) {
  try {
    await connectDB();

    // Chiffrer les tokens sensibles
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = tokenData.refresh_token 
      ? encrypt(tokenData.refresh_token)
      : encryptedAccessToken; // Fallback si pas de refresh token

    // Calculer la date d'expiration
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Upsert : mettre à jour si existe, créer sinon
    const result = await UserGoogleTokens.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: tokenData.scope,
        tokenType: tokenData.token_type,
        email,
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log('✅ Google tokens saved for user:', userId);
    return result;
  } catch (error) {
    console.error('❌ Error saving Google tokens:', error);
    throw error;
  }
}

/**
 * Récupérer les tokens Google d'un utilisateur (déchiffrés)
 */
export async function getGoogleTokens(userId: string) {
  try {
    await connectDB();

    const tokens = await UserGoogleTokens.findOne({ userId });
    
    if (!tokens) {
      return null;
    }

    // Déchiffrer les tokens
    const decryptedAccessToken = decrypt(tokens.accessToken);
    const decryptedRefreshToken = decrypt(tokens.refreshToken);

    return {
      accessToken: decryptedAccessToken,
      refreshToken: decryptedRefreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
      tokenType: tokens.tokenType,
      email: tokens.email,
      isExpired: tokens.isExpired(),
    };
  } catch (error) {
    console.error('❌ Error getting Google tokens:', error);
    throw error;
  }
}

/**
 * Vérifier si un utilisateur a des tokens Google valides
 */
export async function hasValidGoogleTokens(userId: string): Promise<boolean> {
  try {
    await connectDB();

    const tokens = await UserGoogleTokens.findOne({ userId });
    
    if (!tokens) {
      return false;
    }

    // Vérifier si le token n'est pas expiré
    return !tokens.isExpired();
  } catch (error) {
    console.error('❌ Error checking Google tokens:', error);
    return false;
  }
}

/**
 * Supprimer les tokens Google d'un utilisateur
 */
export async function deleteGoogleTokens(userId: string) {
  try {
    await connectDB();

    await UserGoogleTokens.deleteOne({ userId });
    
    console.log('✅ Google tokens deleted for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting Google tokens:', error);
    throw error;
  }
}

/**
 * Rafraîchir l'access token Google avec le refresh token
 */
export async function refreshGoogleAccessToken(userId: string): Promise<string> {
  try {
    const tokens = await getGoogleTokens(userId);
    
    if (!tokens || !tokens.refreshToken) {
      throw new Error('No refresh token found');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth not configured');
    }

    // Demander un nouveau access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to refresh token:', data);
      throw new Error('Failed to refresh Google access token');
    }

    // Sauvegarder le nouveau token
    await saveGoogleTokens(
      userId,
      {
        access_token: data.access_token,
        refresh_token: tokens.refreshToken, // Garder l'ancien refresh token
        expires_in: data.expires_in,
        scope: tokens.scope,
        token_type: data.token_type || 'Bearer',
      },
      tokens.email
    );

    console.log('✅ Google access token refreshed for user:', userId);
    return data.access_token;
  } catch (error) {
    console.error('❌ Error refreshing Google token:', error);
    throw error;
  }
}
