import { generateText } from 'ai';
import { formModel } from '@/lib/ai';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  message: z.string(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversationHistory } = ChatRequestSchema.parse(body);

    // Construire le contexte
    const conversationContext = conversationHistory
      .slice(-10)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // D'abord, détecter l'intention de l'utilisateur
    const intentPrompt = `Analyse ce message pour déterminer si l'utilisateur veut créer un formulaire.

${conversationContext ? `Conversation précédente:\n${conversationContext}\n\n` : ''}Message actuel: ${message}

L'utilisateur exprime-t-il le désir ou l'intention de créer un formulaire (sondage, questionnaire, etc.) ?

Réponds UNIQUEMENT par "OUI" ou "NON" suivi d'une brève explication (1 phrase).

Exemples OUI:
- "je veux créer un formulaire"
- "aide-moi à faire un sondage"
- "j'ai besoin d'un questionnaire"
- "tu peux m'aider à créer un formulaire ?"
- "je voudrais faire un formulaire de contact"

Exemples NON:
- "bonjour"
- "comment ça marche ?"
- "c'est quoi Tally ?"
- "merci"`;

    const { text: intentResult } = await generateText({
      model: formModel,
      prompt: intentPrompt,
    });

    const shouldStartFormCreation = intentResult.toLowerCase().startsWith('oui');

    if (shouldStartFormCreation) {
      // L'utilisateur veut créer un formulaire
      return Response.json({ 
        shouldStartFormCreation: true,
        reply: null
      });
    }

    // Conversation normale
    const conversationPrompt = `Tu es un assistant amical et intelligent spécialisé dans la création de formulaires. Tu aides les utilisateurs avec Google Forms, Tally et Typeform.

${conversationContext ? `Conversation précédente:\n${conversationContext}\n\n` : ''}Message actuel: ${message}

INSTRUCTIONS:
- Réponds de manière naturelle et conversationnelle
- Si c'est une salutation, réponds chaleureusement et présente-toi brièvement
- Si l'utilisateur pose une question, réponds-y
- Si l'utilisateur demande des informations sur les outils, explique brièvement
- Reste concis (2-4 phrases max)
- Sois amical et utilise des emojis si approprié

EXEMPLES:
- User: "bonjour" → "👋 Bonjour ! Je suis ton assistant de création de formulaires. Je peux t'aider à créer des formulaires avec Google Forms, Tally ou Typeform. Que puis-je faire pour toi ?"
- User: "comment ça marche ?" → "C'est simple ! Dis-moi quel type de formulaire tu veux créer (sondage, inscription, contact...), je te guiderai pour choisir l'outil adapté et le construire ensemble. 😊"
- User: "c'est quoi Tally ?" → "Tally est un outil de création de formulaires moderne et gratuit. Il offre une interface intuitive et de nombreuses fonctionnalités. C'est parfait pour des formulaires simples et élégants ! 📋"`;

    const { text: reply } = await generateText({
      model: formModel,
      prompt: conversationPrompt,
    });

    return Response.json({ 
      shouldStartFormCreation: false,
      reply 
    });

  } catch (error) {
    console.error('Erreur chat:', error);
    return Response.json(
      { error: 'Erreur lors de la conversation' },
      { status: 500 }
    );
  }
}
