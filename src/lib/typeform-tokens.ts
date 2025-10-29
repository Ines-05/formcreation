import { connectDB } from './mongodb';
import UserTypeformTokens from '@/models/UserTypeformTokens';
import { encrypt, decrypt } from './encryption';

/**
 * Interface pour les données de tokens retournées par Typeform
 */
interface TypeformTokenData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number; // En secondes (Typeform ne fournit pas toujours cette info)
  scope: string;
  token_type: string;
}

/**
 * Sauvegarder les tokens Typeform pour un utilisateur
 */
export async function saveTypeformTokens(userId: string, tokenData: TypeformTokenData) {
  try {
    await connectDB();

    // Chiffrer les tokens sensibles
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = tokenData.refresh_token 
      ? encrypt(tokenData.refresh_token)
      : undefined;

    // Calculer la date d'expiration (si fournie, sinon 1 an par défaut)
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 an

    // Upsert : mettre à jour si existe, créer sinon
    const result = await UserTypeformTokens.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: tokenData.scope,
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log('✅ Typeform tokens saved for user:', userId);
    return result;
  } catch (error) {
    console.error('❌ Error saving Typeform tokens:', error);
    throw error;
  }
}

/**
 * Récupérer les tokens Typeform d'un utilisateur (déchiffrés)
 */
export async function getTypeformTokens(userId: string) {
  try {
    await connectDB();

    const tokens = await UserTypeformTokens.findOne({ userId });
    
    if (!tokens) {
      return null;
    }

    // Déchiffrer les tokens
    const decryptedAccessToken = decrypt(tokens.accessToken);
    const decryptedRefreshToken = tokens.refreshToken 
      ? decrypt(tokens.refreshToken)
      : undefined;

    return {
      accessToken: decryptedAccessToken,
      refreshToken: decryptedRefreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
      isExpired: tokens.isExpired ? tokens.isExpired() : false,
    };
  } catch (error) {
    console.error('❌ Error getting Typeform tokens:', error);
    throw error;
  }
}

/**
 * Vérifier si un utilisateur a des tokens Typeform valides
 */
export async function hasValidTypeformTokens(userId: string): Promise<boolean> {
  try {
    await connectDB();

    const tokens = await UserTypeformTokens.findOne({ userId });
    
    if (!tokens) {
      return false;
    }

    // Vérifier si le token n'est pas expiré
    return tokens.isExpired ? !tokens.isExpired() : true;
  } catch (error) {
    console.error('❌ Error checking Typeform tokens:', error);
    return false;
  }
}

/**
 * Supprimer les tokens Typeform d'un utilisateur
 */
export async function deleteTypeformTokens(userId: string) {
  try {
    await connectDB();

    await UserTypeformTokens.deleteOne({ userId });
    
    console.log('✅ Typeform tokens deleted for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting Typeform tokens:', error);
    throw error;
  }
}

/**
 * Rafraîchir l'access token Typeform avec le refresh token
 * Note: Typeform OAuth peut ne pas supporter le refresh automatique
 */
export async function refreshTypeformAccessToken(userId: string): Promise<string> {
  try {
    const tokens = await getTypeformTokens(userId);
    
    if (!tokens || !tokens.refreshToken) {
      throw new Error('No refresh token found - user needs to reconnect');
    }

    const clientId = process.env.TYPEFORM_CLIENT_ID;
    const clientSecret = process.env.TYPEFORM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Typeform OAuth not configured');
    }

    // Demander un nouveau access token
    const response = await fetch('https://api.typeform.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to refresh Typeform token:', data);
      throw new Error('Failed to refresh Typeform access token - user needs to reconnect');
    }

    // Sauvegarder le nouveau token
    await saveTypeformTokens(userId, {
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokens.refreshToken,
      expires_in: data.expires_in,
      scope: tokens.scope,
      token_type: data.token_type || 'Bearer',
    });

    console.log('✅ Typeform access token refreshed for user:', userId);
    return data.access_token;
  } catch (error) {
    console.error('❌ Error refreshing Typeform token:', error);
    throw error;
  }
}
