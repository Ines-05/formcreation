import { generateObject } from 'ai';
import { formModel } from '@/lib/ai';
import { z } from 'zod';

const FormFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

const FormDefinitionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt requis' }, { status: 400 });
    }

    const { object: formDefinition } = await generateObject({
      model: formModel,
      schema: FormDefinitionSchema,
      prompt: `Génère un formulaire basé sur cette description: "${prompt}".
      
      Instructions importantes:
      - Crée un formulaire complet et pertinent
      - Utilise des types de champs appropriés (text, email, number, textarea, select, radio, checkbox)
      - Inclus des labels clairs en français
      - Ajoute des placeholders utiles
      - Marque les champs obligatoires avec required: true
      - Pour les champs select/radio/checkbox, fournis des options pertinentes
      - Génère un titre et une description appropriés
      - Les IDs doivent être en camelCase sans espaces
      
      Exemple de structure attendue:
      {
        "title": "Formulaire d'inscription",
        "description": "Inscrivez-vous à notre événement",
        "fields": [
          {
            "id": "nom",
            "type": "text",
            "label": "Nom complet",
            "placeholder": "Votre nom complet",
            "required": true
          },
          {
            "id": "email",
            "type": "email", 
            "label": "Adresse email",
            "placeholder": "votre@email.com",
            "required": true
          }
        ]
      }`,
    });

    return Response.json({ formDefinition });
  } catch (error) {
    console.error('Erreur lors de la génération du formulaire:', error);
    return Response.json(
      { error: 'Erreur lors de la génération du formulaire' },
      { status: 500 }
    );
  }
}