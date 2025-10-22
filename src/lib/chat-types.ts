// Types pour les messages de chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  ui?: React.ReactNode; // Pour les composants générés (formulaires)
}

// Type pour l'état du chat
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  conversationSummary?: string;
}

// Type pour la génération de formulaire dans le chat
export interface ChatFormGeneration {
  trigger: 'explicit' | 'implicit'; // Demande explicite ou détectée dans la conversation
  context: string; // Contexte de la conversation
  formDefinition?: FormDefinition;
}

// Types existants du formulaire (réexportés pour facilité)
export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormDefinition {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormSubmission {
  [fieldId: string]: string | string[] | number | boolean;
}