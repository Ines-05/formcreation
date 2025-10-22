import mongoose, { Schema, Document } from 'mongoose';
import { FormDefinition } from '@/lib/types';

export interface IForm extends Document {
  formId: string;
  title: string;
  description?: string;
  definition: FormDefinition;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  submissionCount: number;
  shareableLink?: string;
  shortLink?: string;
}

const FormSchema = new Schema<IForm>({
  formId: { 
    type: String, 
    unique: true, 
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
});

export const Form = mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);
