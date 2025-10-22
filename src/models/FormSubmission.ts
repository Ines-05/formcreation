import mongoose, { Schema, Document } from 'mongoose';

export interface IFormSubmission extends Document {
  formId: string;
  data: Record<string, unknown>;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const FormSubmissionSchema = new Schema<IFormSubmission>({
  formId: { 
    type: String, 
    required: true,
    index: true 
  },
  data: { 
    type: Schema.Types.Mixed, 
    required: true 
  },
  submittedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
});

export const FormSubmission = mongoose.models.FormSubmission || 
  mongoose.model<IFormSubmission>('FormSubmission', FormSubmissionSchema);
