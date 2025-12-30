import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface pour les tokens Google OAuth stockés
 */
export interface IUserGoogleTokens extends Document {
  userId: string;
  accessToken: string; // Chiffré
  refreshToken: string; // Chiffré
  expiresAt: Date;
  scope: string;
  tokenType: string;
  email?: string; // Email Google de l'utilisateur
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema Mongoose pour les tokens Google
 */
const UserGoogleTokensSchema = new Schema<IUserGoogleTokens>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    tokenType: {
      type: String,
      default: 'Bearer',
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index pour optimiser les requêtes
 */
UserGoogleTokensSchema.index({ expiresAt: 1 });

/**
 * Méthode pour vérifier si le token est expiré
 */
UserGoogleTokensSchema.methods.isExpired = function (): boolean {
  return new Date() >= this.expiresAt;
};

/**
 * Méthode statique pour vérifier si un utilisateur a des tokens valides
 */
UserGoogleTokensSchema.statics.hasValidTokens = async function (
  userId: string
): Promise<boolean> {
  const tokens = await this.findOne({ userId });
  if (!tokens) return false;
  return !tokens.isExpired();
};

// Export du modèle
export const UserGoogleTokens =
  mongoose.models.UserGoogleTokens ||
  mongoose.model<IUserGoogleTokens>('UserGoogleTokens', UserGoogleTokensSchema);

export default UserGoogleTokens;
