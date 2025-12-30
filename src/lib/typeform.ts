/**
 * Typeform API Integration
 * 
 * Ce fichier contient les fonctions pour interagir avec l'API Typeform
 * Documentation: https://www.typeform.com/developers/create/
 */

import { FormDefinition, FormField } from './types';

/**
 * Configuration pour les tokens OAuth Typeform
 */
export interface TypeformTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope: string;
}

/**
 * Créer un formulaire Typeform à partir d'une définition
 * 
 * Documentation: https://www.typeform.com/developers/create/reference/create-form/
 */
export async function createTypeform(
  formDefinition: FormDefinition,
  accessToken: string
): Promise<{ formId: string; formUrl: string; editUrl: string }> {

  // Construire le payload Typeform
  const typeformPayload = {
    title: formDefinition.title,
    settings: {
      language: 'fr',
      is_public: true,
      show_progress_bar: true,
      show_typeform_branding: true,
    },
    fields: formDefinition.fields.map(convertFieldToTypeformField),
  };

  // Créer le formulaire
  const response = await fetch('https://api.typeform.com/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(typeformPayload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create Typeform: ${JSON.stringify(error)}`);
  }

  const formData = await response.json();
  const formId = formData.id;

  return {
    formId,
    formUrl: `https://form.typeform.com/to/${formId}`,
    editUrl: `https://admin.typeform.com/form/${formId}/create`,
  };
}

/**
 * Convertir un FormField en champ Typeform
 */
function convertFieldToTypeformField(field: FormField): Record<string, unknown> {
  const baseField = {
    title: field.label,
    properties: {
      description: field.placeholder || '',
    },
    validations: {
      required: field.required || false,
    },
  };

  // Mapping des types
  switch (field.type) {
    case 'text':
      return {
        ...baseField,
        type: 'short_text',
      };

    case 'textarea':
      return {
        ...baseField,
        type: 'long_text',
      };

    case 'email':
      return {
        ...baseField,
        type: 'email',
      };

    case 'number':
      return {
        ...baseField,
        type: 'number',
      };

    case 'select':
    case 'radio':
      return {
        ...baseField,
        type: 'multiple_choice',
        properties: {
          ...baseField.properties,
          choices: (field.options || []).map(option => ({
            label: option,
          })),
          allow_multiple_selection: false,
        },
      };

    case 'checkbox':
      return {
        ...baseField,
        type: 'multiple_choice',
        properties: {
          ...baseField.properties,
          choices: (field.options || []).map(option => ({
            label: option,
          })),
          allow_multiple_selection: true,
        },
      };

    default:
      return {
        ...baseField,
        type: 'short_text',
      };
  }
}

/**
 * Récupérer les réponses d'un formulaire Typeform
 * 
 * Documentation: https://www.typeform.com/developers/responses/
 */
export async function getTypeformResponses(
  formId: string,
  accessToken: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {

  const response = await fetch(
    `https://api.typeform.com/forms/${formId}/responses`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Typeform responses');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Rafraîchir un access token expiré (si Typeform fournit des refresh tokens)
 * Note: Vérifier la documentation Typeform pour les refresh tokens
 */
export async function refreshTypeformAccessToken(
  refreshToken: string
): Promise<TypeformTokens> {

  const clientId = process.env.TYPEFORM_CLIENT_ID;
  const clientSecret = process.env.TYPEFORM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Typeform OAuth not configured');
  }

  const response = await fetch('https://api.typeform.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_in: data.expires_in,
    token_type: data.token_type,
    scope: data.scope,
  };
}

/**
 * Obtenir un access token valide (rafraîchit si expiré et si refresh token disponible)
 */
export async function getValidTypeformAccessToken(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _userId: string
): Promise<string> {
  // TODO: Récupérer les tokens depuis MongoDB
  // const tokens = await getUserTypeformTokens(userId);

  // Vérifier si le token est expiré
  // if (tokens.expires_at && isTokenExpired(tokens.expires_at) && tokens.refresh_token) {
  //   const newTokens = await refreshTypeformAccessToken(tokens.refresh_token);
  //   await saveUserTypeformTokens(userId, newTokens);
  //   return newTokens.access_token;
  // }

  // return tokens.access_token;

  throw new Error('Not implemented - MongoDB integration required');
}
