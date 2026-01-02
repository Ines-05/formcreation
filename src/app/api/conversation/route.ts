import { generateText, generateObject } from 'ai';
import { formModel } from '@/lib/ai';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

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
    const { userId } = await auth();
    // On permet l'accès anonyme pour le moment mais on log
    if (!userId) console.log('Anonymous chat request');

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
          prompt: `Tu es un expert en création de formulaires. Génère un formulaire basé sur cette conversation:

${conversationContext}

Dernier message: ${message}

RÈGLES INTELLIGENTES DE GÉNÉRATION:

1. **DÉTECTION AUTOMATIQUE DES TYPES**:
   - "Nom", "Prénom", "Titre", "Ville" → text (REQUIS si c'est un champ d'identification)
   - "Email", "E-mail", "Adresse email" → email (TOUJOURS REQUIS)
   - "Téléphone", "Tel", "Mobile" → text (pas number !)
   - "Âge", "Nombre", "Quantité" → number
   - "Date de naissance", "Date" → text avec placeholder
   - "Commentaire", "Description", "Avis", "Message" → textarea
   - Tout ce qui implique un niveau/satisfaction/note → radio avec options pertinentes
   - Spécialité/Domaine/Catégorie → radio ou select avec options du domaine
   - Préférences/Intérêts multiples → checkbox avec options
   - Questions Oui/Non → radio avec ["Oui", "Non"]

2. **GÉNÉRATION AUTOMATIQUE DES OPTIONS** (OBLIGATOIRE pour select/radio/checkbox):
   - "Sexe"/"Genre" → radio: ["Homme", "Femme", "Autre"]
   - "Civilité" → select: ["M.", "Mme", "Mlle"]
   - "Satisfaction" → radio: ["Très satisfait", "Satisfait", "Peu satisfait", "Pas satisfait"]
   - "Spécialité UI/UX" → radio: ["UI Design", "UX Design", "UI/UX Design", "Autre"]
   - "Expérience" → radio: ["Débutant", "Intermédiaire", "Avancé", "Expert"]
   - "Taille entreprise" → select: ["1-10", "11-50", "51-200", "200+"]
   - "Pays" → select: ["France", "Belgique", "Suisse", "Canada", "Autre"]
   
   **IMPORTANT**: Adapte les options au contexte de la demande !

3. **CHAMPS REQUIS AUTOMATIQUES**:
   - Nom, Prénom, Email: TOUJOURS required: true
   - Champs essentiels au contexte du formulaire: required: true
   - Champs optionnels (commentaires, suggestions): required: false

4. **BONNES PRATIQUES**:
   - Labels clairs en français
   - Placeholders utiles (ex: "Votre nom complet", "exemple@email.com")
   - IDs en camelCase (ex: "nomComplet", "adresseEmail", "niveauSatisfaction")
   - Titre et description pertinents au contexte

5. **EXEMPLES CONCRETS**:
   - Si l'utilisateur dit "spécialité UI UX" → crée un radio avec options appropriées
   - Si l'utilisateur dit "niveau d'expérience" → crée un radio avec niveaux
   - Si l'utilisateur dit "commentaires" → crée un textarea
   - Si l'utilisateur dit "email" → type email avec required: true

**CRITIQUES**:
- JAMAIS de select/radio/checkbox sans options
- TOUJOURS au moins 2 options pour les champs à choix
- Les téléphones sont text, PAS number
- Sois INTELLIGENT: déduis le type et les options du contexte

Génère maintenant le formulaire qui correspond EXACTEMENT aux besoins exprimés.`,
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

🚫 **STRICT SCOPE / HORS-SUJET :**
- Ta SEULE ET UNIQUE TÂCHE est d'aider à la création de formulaires.
- Si l'utilisateur pose une question qui n'est pas directement liée à la création de formulaires (ex: "Qui est le président de la république ?", questions de culture générale, aide au code générique, etc.), tu dois REFUSER d'y répondre poliment.
- Ta réponse dans ce cas doit être courte : "Désolé, je suis un assistant spécialisé exclusivement dans la création de formulaires. Comment puis-je vous aider pour votre prochain formulaire ?"
- Ne fais AUCUNE exception.

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