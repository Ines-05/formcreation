/**
 * Google Forms API Integration
 * 
 * Ce fichier contient les fonctions pour interagir avec l'API Google Forms
 * Documentation: https://developers.google.com/forms/api
 */

import { FormDefinition, FormField } from './types';

/**
 * Configuration pour les tokens OAuth Google
 */
export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Créer un formulaire Google Forms à partir d'une définition
 */
export async function createGoogleForm(
  formDefinition: FormDefinition,
  accessToken: string
): Promise<{ formId: string; responderUri: string; editUrl: string }> {

  console.log('🎨 Création Google Form - Début');
  console.log('📝 Titre:', formDefinition.title);
  console.log('📋 Nombre de champs:', formDefinition.fields.length);

  // 1. Créer le formulaire vide
  console.log('📡 Appel API Google Forms - CREATE...');
  const createResponse = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: formDefinition.title,
        documentTitle: formDefinition.title,
      },
    }),
  });

  console.log('📡 Réponse CREATE:', createResponse.status);

  if (!createResponse.ok) {
    const error = await createResponse.json();
    console.error('❌ Erreur création formulaire:', error);
    throw new Error(`Failed to create Google Form: ${JSON.stringify(error)}`);
  }

  const formData = await createResponse.json();
  const formId = formData.formId;
  const responderUri = formData.responderUri;

  console.log('✅ Formulaire créé! ID:', formId);
  console.log('🔗 Lien répondant:', responderUri);

  // 2. Ajouter la description si présente
  if (formDefinition.description) {
    console.log('📝 Ajout de la description...');
    await updateFormDescription(formId, formDefinition.description, accessToken);
  }

  // 3. Ajouter les champs
  console.log('📋 Ajout des champs...');
  await addFieldsToForm(formId, formDefinition.fields, accessToken);

  console.log('✅ Google Form complètement créé!');

  return {
    formId,
    responderUri: responderUri || `https://docs.google.com/forms/d/${formId}/viewform`,
    editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
  };
}

/**
 * Mettre à jour la description du formulaire
 */
async function updateFormDescription(
  formId: string,
  description: string,
  accessToken: string
): Promise<void> {
  await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          updateFormInfo: {
            info: {
              description,
            },
            updateMask: 'description',
          },
        },
      ],
    }),
  });
}

/**
 * Ajouter des champs au formulaire
 */
async function addFieldsToForm(
  formId: string,
  fields: FormField[],
  accessToken: string
): Promise<void> {

  const requests = fields.map((field, index) => {
    return {
      createItem: {
        item: convertFieldToGoogleItem(field),
        location: {
          index,
        },
      },
    };
  });

  await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });
}

/**
 * Convertir un FormField en Item Google Forms
 */
function convertFieldToGoogleItem(field: FormField): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseItem: any = {
    title: field.label,
    description: field.placeholder || '',
    questionItem: {
      question: {
        required: field.required || false,
      },
    },
  };

  // Mapping des types
  switch (field.type) {
    case 'text':
      baseItem.questionItem.question.textQuestion = {
        paragraph: false,
      };
      break;

    case 'textarea':
      baseItem.questionItem.question.textQuestion = {
        paragraph: true,
      };
      break;

    case 'email':
      baseItem.questionItem.question.textQuestion = {
        paragraph: false,
      };
      // Note: Google Forms ne valide pas automatiquement les emails via l'API
      // Il faut ajouter une validation manuelle
      break;

    case 'number':
      baseItem.questionItem.question.textQuestion = {
        paragraph: false,
      };
      // Note: Pas de type numérique natif dans Google Forms API
      break;

    case 'select':
      baseItem.questionItem.question.choiceQuestion = {
        type: 'DROP_DOWN',
        options: (field.options || []).map(option => ({
          value: option,
        })),
      };
      break;

    case 'radio':
      baseItem.questionItem.question.choiceQuestion = {
        type: 'RADIO',
        options: (field.options || []).map(option => ({
          value: option,
        })),
      };
      break;

    case 'checkbox':
      baseItem.questionItem.question.choiceQuestion = {
        type: 'CHECKBOX',
        options: (field.options || []).map(option => ({
          value: option,
        })),
      };
      break;

    default:
      // Par défaut, question texte courte
      baseItem.questionItem.question.textQuestion = {
        paragraph: false,
      };
  }

  return baseItem;
}

/**
 * Récupérer les réponses d'un formulaire Google Forms
 */
export async function getGoogleFormResponses(
  formId: string,
  accessToken: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {

  const response = await fetch(
    `https://forms.googleapis.com/v1/forms/${formId}/responses`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Google Form responses');
  }

  const data = await response.json();
  return data.responses || [];
}

/**
 * Rafraîchir un access token expiré
 */
export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<GoogleTokens> {

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: refreshToken, // Le refresh token ne change pas
    expires_in: data.expires_in,
    token_type: data.token_type,
    scope: data.scope,
  };
}

/**
 * Obtenir un access token valide (rafraîchit si expiré)
 */
export async function getValidAccessToken(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _userId: string
): Promise<string> {
  // TODO: Récupérer les tokens depuis MongoDB
  // const tokens = await getUserGoogleTokens(userId);

  // Vérifier si le token est expiré
  // if (isTokenExpired(tokens.expires_at)) {
  //   const newTokens = await refreshGoogleAccessToken(tokens.refresh_token);
  //   await saveUserGoogleTokens(userId, newTokens);
  //   return newTokens.access_token;
  // }

  // return tokens.access_token;

  throw new Error('Not implemented - MongoDB integration required');
}
