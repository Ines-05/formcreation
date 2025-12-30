import mongoose, { Schema, Document } from 'mongoose';
import { FormDefinition } from '@/lib/types';

export interface IForm extends Document {
  formId: string;
  userId: string; // ID de l'utilisateur qui a créé le formulaire
  title: string;
  description?: string;
  definition: FormDefinition;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  submissionCount: number;
  shareableLink?: string;
  shortLink?: string;
  tool?: string; // tally, google, typeform
  platform?: string; // external platform info
}

const FormSchema = new Schema<IForm>({
  formId: { 
    type: String, 
    required: true,
    index: true 
  },
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  title: { type: String, required: true },
  description: String,
  definition: { 
    type: Schema.Types.Mixed, 
    required: true 
  },
  createdBy: { type: String, default: 'anonymous' },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  submissionCount: { type: Number, default: 0 },
  shareableLink: String,
  shortLink: String,
  tool: { type: String, enum: ['tally', 'google', 'typeform', 'internal'] },
  platform: String,
});

// Index composé pour éviter les doublons utilisateur/formulaire
FormSchema.index({ userId: 1, formId: 1 }, { unique: true });

export const Form = mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);
