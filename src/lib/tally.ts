import { v4 as uuidv4 } from 'uuid';
import { getUserTallyApiKey } from './tally-user-api';

const TALLY_API_KEY = process.env.TALLY_API_KEY;
const TALLY_API_URL = 'https://api.tally.so';

export interface TallyBlock {
  uuid: string;
  type: string;
  groupUuid: string;
  groupType: string;
  payload: Record<string, unknown>;
}

export interface TallyFormResponse {
  id: string;
  name: string;
  workspaceId: string;
  organizationId: string;
  status: string;
  hasDraftBlocks: boolean;
  isClosed: boolean;
  updatedAt: string;
  createdAt: string;
}

// Mapping de nos types de champs vers les types Tally
const FIELD_TYPE_MAPPING: Record<string, { type: string; groupType: string }> = {
  text: { type: 'INPUT_TEXT', groupType: 'INPUT_TEXT' },
  email: { type: 'INPUT_EMAIL', groupType: 'INPUT_EMAIL' },
  number: { type: 'INPUT_NUMBER', groupType: 'INPUT_NUMBER' },
  textarea: { type: 'TEXTAREA', groupType: 'TEXTAREA' },
  select: { type: 'DROPDOWN', groupType: 'DROPDOWN' },
  radio: { type: 'MULTIPLE_CHOICE', groupType: 'MULTIPLE_CHOICE' },
  checkbox: { type: 'CHECKBOXES', groupType: 'CHECKBOXES' },
};

export async function createTallyForm(
  title: string,
  description: string | undefined,
  fields: Array<{
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>,
  userId?: string // Paramètre optionnel pour utiliser le token OAuth de l'utilisateur
): Promise<TallyFormResponse> {
  // Essayer d'utiliser l'API Key de l'utilisateur en priorité
  let apiToken: string | null = null;
  
  if (userId) {
    apiToken = await getUserTallyApiKey(userId);
    if (apiToken) {
      console.log('✅ Using user Tally API Key');
    } else {
      console.log('⚠️ No API Key configured for user, falling back to default API key');
    }
  }
  
  // Fallback sur la clé API globale si pas d'API Key utilisateur
  if (!apiToken) {
    apiToken = TALLY_API_KEY || '';
    if (!apiToken) {
      throw new Error('No Tally API access available. Please connect your Tally account.');
    }
  }

  const blocks: TallyBlock[] = [];

  // 1. Ajouter le titre du formulaire (obligatoire)
  const formTitleGroupUuid = uuidv4();
  blocks.push({
    uuid: uuidv4(),
    type: 'FORM_TITLE',
    groupUuid: formTitleGroupUuid,
    groupType: 'TEXT',
    payload: {
      html: title,
    },
  });

  // 2. Ajouter la description si présente
  if (description) {
    const descGroupUuid = uuidv4();
    blocks.push({
      uuid: uuidv4(),
      type: 'TEXT',
      groupUuid: descGroupUuid,
      groupType: 'TEXT',
      payload: {
        html: description,
      },
    });
  }

  // 3. Ajouter chaque champ
  for (const field of fields) {
    const tallyType = FIELD_TYPE_MAPPING[field.type] || FIELD_TYPE_MAPPING.text;

    // Créer un groupe unique pour toute la question (TITLE + INPUT partagent le même groupUuid)
    const questionGroupUuid = uuidv4();

    // Ajouter le titre de la question (label)
    blocks.push({
      uuid: uuidv4(),
      type: 'TITLE',
      groupUuid: questionGroupUuid,
      groupType: 'QUESTION',
      payload: {
        html: field.label,
      },
    });

    // Construire le payload selon le type de champ
    const inputPayload: Record<string, unknown> = {
      isRequired: field.required || false,
    };

    // Ajouter placeholder uniquement pour les champs de type texte
    if (['INPUT_TEXT', 'INPUT_EMAIL', 'INPUT_NUMBER', 'TEXTAREA'].includes(tallyType.type)) {
      if (field.placeholder) {
        inputPayload.placeholder = field.placeholder;
      }
    }

    // Pour les champs avec options (dropdown, radio, checkbox)
    // On doit ajouter les options comme des blocks séparés
    if (field.options && field.options.length > 0) {
      // Ajouter le block principal du champ
      blocks.push({
        uuid: uuidv4(),
        type: tallyType.type,
        groupUuid: questionGroupUuid, // Même groupUuid que le TITLE
        groupType: tallyType.groupType,
        payload: inputPayload,
      });

      // Ajouter chaque option comme un block séparé
      for (const option of field.options) {
        const optionType = 
          tallyType.type === 'DROPDOWN' ? 'DROPDOWN_OPTION' :
          tallyType.type === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE_OPTION' :
          tallyType.type === 'CHECKBOXES' ? 'CHECKBOX' :
          'DROPDOWN_OPTION';

        blocks.push({
          uuid: uuidv4(),
          type: optionType,
          groupUuid: questionGroupUuid, // Même groupUuid pour lier à la question
          groupType: tallyType.groupType,
          payload: {
            text: option,
          },
        });
      }
    } else {
      // Pour les champs sans options (texte, email, etc.)
      blocks.push({
        uuid: uuidv4(),
        type: tallyType.type,
        groupUuid: questionGroupUuid, // Même groupUuid que le TITLE
        groupType: tallyType.groupType,
        payload: inputPayload,
      });
    }
  }

  console.log('📤 Sending to Tally API:', JSON.stringify({ name: title, status: 'PUBLISHED', blocks: blocks.slice(0, 3) }, null, 2), '... (truncated)');

  // Créer le formulaire via l'API Tally avec le token approprié
  const response = await fetch(`${TALLY_API_URL}/forms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: title,
      status: 'PUBLISHED',
      blocks,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Tally API error:', error);
    throw new Error(`Failed to create Tally form: ${error}`);
  }

  const formData: TallyFormResponse = await response.json();
  console.log('✅ Tally form created:', formData.id);

  return formData;
}

export function getTallyEmbedUrl(formId: string): string {
  return `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
}

export function getTallyShareUrl(formId: string): string {
  return `https://tally.so/r/${formId}`;
}
