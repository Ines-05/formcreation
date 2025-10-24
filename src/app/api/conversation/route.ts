import { generateText, generateObject } from 'ai';
import { formModel } from '@/lib/ai';
import { z } from 'zod';

const ConversationRequestSchema = z.object({
  message: z.string(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
});

const FormFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

const FormDefinitionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversationHistory } = ConversationRequestSchema.parse(body);

    // Construire le contexte de conversation
    const conversationContext = conversationHistory
      .slice(-10) // Garder les 10 derniers messages pour le contexte
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // D'abord, analyser si l'utilisateur est prêt pour générer un formulaire
    const analysisPrompt = `Analyse cette conversation pour déterminer si l'utilisateur est prêt à générer un formulaire.

Conversation:
${conversationContext}

Dernier message utilisateur: ${message}

L'utilisateur est-il prêt pour la génération du formulaire ? Réponds SEULEMENT par "OUI" ou "NON" suivi d'une explication courte.

Critères pour "OUI":
- L'utilisateur a clarifié le type de formulaire qu'il veut
- Il a mentionné ou confirmé les informations à collecter
- Il semble satisfait de la discussion et prêt à voir le résultat
- Il dit explicitement qu'il veut générer/voir le formulaire

Critères pour "NON":
- L'utilisateur pose encore des questions
- Il hésite sur le type de formulaire
- Il n'a pas encore défini clairement ce qu'il veut collecter
- La conversation vient de commencer`;

    const { text: analysisResult } = await generateText({
      model: formModel,
      prompt: analysisPrompt,
    });

    const shouldGenerateForm = analysisResult.toLowerCase().startsWith('oui');

    if (shouldGenerateForm) {
      // Générer le formulaire basé sur toute la conversation
      try {
        const { object: formDefinition } = await generateObject({
          model: formModel,
          schema: FormDefinitionSchema,
          prompt: `Basé sur cette conversation complète, génère un formulaire approprié:

${conversationContext}

Dernier message: ${message}

Instructions CRITIQUES:
- Analyse TOUTE la conversation pour comprendre les besoins de l'utilisateur
- Crée un formulaire complet et pertinent
- Utilise des types de champs appropriés:
  * text: pour texte court (nom, prénom, ville, etc.)
  * email: pour adresses email
  * number: pour nombres (âge, téléphone, etc.)
  * textarea: pour texte long (commentaires, description)
  * select: pour liste déroulante (pays, profession, etc.)
  * radio: pour choix unique entre plusieurs options (sexe, civilité, etc.)
  * checkbox: pour sélection multiple

- IMPORTANT pour les champs avec options (select, radio, checkbox):
  * Tu DOIS TOUJOURS fournir au moins 2 options dans le tableau "options"
  * Exemple pour sexe: { type: "radio", label: "Sexe", options: ["Homme", "Femme", "Autre"], required: true }
  * Exemple pour pays: { type: "select", label: "Pays", options: ["France", "Belgique", "Suisse", "Canada"], required: true }
  * JAMAIS un champ select/radio/checkbox sans options !

- Inclus des labels clairs en français
- Ajoute des placeholders utiles pour les champs texte
- Marque les champs obligatoires avec required: true
- Les IDs doivent être en camelCase sans espaces (ex: "nomComplet", "adresseEmail")
- Génère un titre et une description appropriés

Assure-toi que le formulaire reflète exactement ce que l'utilisateur a exprimé dans la conversation.`,
        });

        // Générer un message d'accompagnement personnalisé (SANS créer le lien maintenant)
        const { text: companionMessage } = await generateText({
          model: formModel,
          prompt: `L'utilisateur vient de recevoir son formulaire généré en prévisualisation. Écris un message court et amical pour l'accompagner.

Contexte de conversation:
${conversationContext}

Le formulaire s'appelle: "${formDefinition.title}"

Écris un message personnalisé (2-3 phrases max) qui:
- Confirme que tu as bien compris ses besoins
- Présente le formulaire généré
- L'encourage à le tester et à le valider pour obtenir le lien de partage

Exemple: "Parfait ! J'ai créé ton formulaire d'inscription. Tu peux le tester ci-dessous. Si ça te convient, clique sur 'Valider' pour obtenir ton lien de partage ! 🎯"`,
        });

        return Response.json({
          assistantMessage: companionMessage,
          formDefinition,
          shouldGenerateForm: true,
        });

      } catch (formError) {
        console.error('Erreur lors de la génération du formulaire:', formError);
        
        const { text: fallbackMessage } = await generateText({
          model: formModel,
          prompt: `Il y a eu un problème technique lors de la génération du formulaire. Écris un message d'excuse et demande à l'utilisateur de préciser encore ses besoins.

Contexte: ${conversationContext}

Sois naturel et propose de l'aide pour clarifier les besoins.`,
        });

        return Response.json({
          assistantMessage: fallbackMessage,
          shouldGenerateForm: false,
        });
      }

    } else {
      // Continuer la conversation naturellement
      const { text: assistantResponse } = await generateText({
        model: formModel,
        prompt: `Tu es un assistant IA spécialisé dans la création de formulaires. Continue cette conversation de manière naturelle et intelligente.

Conversation jusqu'à présent:
${conversationContext}

Nouveau message de l'utilisateur: ${message}

Instructions pour ta réponse:
- Sois naturel, amical et conversationnel
- Aide l'utilisateur à clarifier ses besoins pour son formulaire
- Pose des questions pertinentes pour mieux comprendre ce qu'il veut
- Si il mentionne un type de formulaire, aide-le à définir quelles informations collecter
- Si il hésite, propose des suggestions ou exemples
- Garde tes réponses concises mais utiles (2-4 phrases)
- Adapte ton ton au style de la conversation
- Si l'utilisateur semble prêt, encourage-le à valider pour générer le formulaire

Ne génère PAS de formulaire maintenant, juste continue la discussion pour mieux comprendre ses besoins.`,
        });

      return Response.json({
        assistantMessage: assistantResponse,
        shouldGenerateForm: false,
      });
    }

  } catch (error) {
    console.error('Erreur dans l\'API conversation:', error);
    return Response.json(
      { 
        assistantMessage: 'Désolé, j\'ai eu un petit problème technique. Peux-tu répéter ta demande ?',
        shouldGenerateForm: false,
      },
      { status: 500 }
    );
  }
}