import { UserTallyApiKey } from '@/models/UserTallyApiKey';
import { decrypt } from './encryption';
import { connectDB } from './mongodb';

/**
 * Récupère l'API Key Tally d'un utilisateur
 * 
 * @param userId - ID de l'utilisateur
 * @returns API Key déchiffrée ou null si non configurée
 */
export async function getUserTallyApiKey(userId: string): Promise<string | null> {
  try {
    await connectDB();

    const userConfig = await UserTallyApiKey.findOne({
      userId,
      isActive: true,
    });

    if (!userConfig) {
      console.log('❌ No Tally API Key configured for user:', userId);
      return null;
    }

    // Mettre à jour la date de dernière utilisation
    await UserTallyApiKey.updateOne(
      { userId },
      { lastUsedAt: new Date() }
    );

    // Déchiffrer et retourner l'API Key
    return decrypt(userConfig.tallyApiKey);

  } catch (error) {
    console.error('❌ Error getting user Tally API Key:', error);
    return null;
  }
}

/**
 * Vérifie si un utilisateur a une API Key Tally configurée
 * 
 * @param userId - ID de l'utilisateur
 * @returns true si l'utilisateur a une API Key active
 */
export async function hasActiveTallyApiKey(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const userConfig = await UserTallyApiKey.findOne({
      userId,
      isActive: true,
    });

    return !!userConfig;
  } catch (error) {
    console.error('❌ Error checking Tally API Key:', error);
    return false;
  }
}

/**
 * Supprime l'API Key Tally d'un utilisateur
 * 
 * @param userId - ID de l'utilisateur
 */
export async function removeUserTallyApiKey(userId: string): Promise<void> {
  try {
    await connectDB();
    
    await UserTallyApiKey.updateOne(
      { userId },
      { isActive: false }
    );

    console.log('✅ User Tally API Key removed:', userId);
  } catch (error) {
    console.error('❌ Error removing user Tally API Key:', error);
    throw error;
  }
}
