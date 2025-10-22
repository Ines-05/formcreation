// Types pour les champs de formulaire
export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Pour select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Type pour la définition complète du formulaire
export interface FormDefinition {
  title: string;
  description?: string;
  fields: FormField[];
}

// Type pour les réponses du formulaire
export interface FormResponse {
  id: string;
  formId: string;
  responses: Record<string, string | string[] | number | boolean>;
  submittedAt: string;
}

// Type pour les données de soumission
export interface FormSubmission {
  [fieldId: string]: string | string[] | number | boolean;
}