import mongoose, { Schema, Document } from 'mongoose';

export interface IUserTallyApiKey extends Document {
  userId: string; // ID de l'utilisateur dans notre système
  tallyApiKey: string; // API Key Tally chiffrée
  connectedAt: Date; // Date de connexion
  isActive: boolean; // Si la connexion est active
  lastUsedAt?: Date; // Dernière utilisation
}

const UserTallyApiKeySchema = new Schema<IUserTallyApiKey>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  tallyApiKey: {
    type: String,
    required: true,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index pour optimiser les recherches
UserTallyApiKeySchema.index({ userId: 1, isActive: 1 });

export const UserTallyApiKey = mongoose.models.UserTallyApiKey ||
  mongoose.model<IUserTallyApiKey>('UserTallyApiKey', UserTallyApiKeySchema);
