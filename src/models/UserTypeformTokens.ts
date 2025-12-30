import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface pour les tokens Typeform OAuth stockés
 */
export interface IUserTypeformTokens extends Document {
  userId: string;
  accessToken: string; // Chiffré
  refreshToken?: string; // Chiffré (optionnel car Typeform peut ne pas toujours le retourner)
  expiresAt?: Date; // Typeform tokens peuvent ne pas avoir d'expiration
  scope: string;
  tokenType: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema Mongoose pour les tokens Typeform
 */
const UserTypeformTokensSchema = new Schema<IUserTypeformTokens>(
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
    },
    expiresAt: {
      type: Date,
    },
    scope: {
      type: String,
      required: true,
    },
    tokenType: {
      type: String,
      default: 'Bearer',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index pour optimiser les requêtes
 */
UserTypeformTokensSchema.index({ userId: 1 });
UserTypeformTokensSchema.index({ expiresAt: 1 });

/**
 * Méthode pour vérifier si le token est expiré
 */
UserTypeformTokensSchema.methods.isExpired = function (): boolean {
  if (!this.expiresAt) return false; // Pas d'expiration = toujours valide
  return new Date() >= this.expiresAt;
};

/**
 * Méthode statique pour vérifier si un utilisateur a des tokens valides
 */
UserTypeformTokensSchema.statics.hasValidTokens = async function (
  userId: string
): Promise<boolean> {
  const tokens = await this.findOne({ userId });
  if (!tokens) return false;
  return !tokens.isExpired();
};

// Export du modèle
export const UserTypeformTokens =
  mongoose.models.UserTypeformTokens ||
  mongoose.model<IUserTypeformTokens>('UserTypeformTokens', UserTypeformTokensSchema);

export default UserTypeformTokens;
