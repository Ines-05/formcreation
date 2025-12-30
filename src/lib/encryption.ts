import crypto from 'crypto';

// Clé de chiffrement (à stocker dans .env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
}

/**
 * Chiffre une chaîne de caractères
 * @param text - Texte à chiffrer
 * @returns Texte chiffré au format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  try {
    // Générer un IV aléatoire
    const iv = crypto.randomBytes(IV_LENGTH);

    // Créer le cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Chiffrer
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Récupérer l'auth tag pour GCM
    const authTag = cipher.getAuthTag();

    // Retourner: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Déchiffre une chaîne chiffrée
 * @param encryptedText - Texte chiffré au format: iv:authTag:encryptedData
 * @returns Texte déchiffré
 */
export function decrypt(encryptedText: string): string {
  try {
    // Séparer les parties
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const [ivHex, authTagHex, encryptedData] = parts;

    // Convertir de hex vers Buffer
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Créer le decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Définir l'auth tag
    decipher.setAuthTag(authTag);

    // Déchiffrer
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Génère une clé de chiffrement aléatoire (à exécuter une seule fois)
 * @returns Clé de chiffrement en format hex (64 caractères)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
