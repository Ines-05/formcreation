import { ConversationManager } from '@/lib/conversation-manager';
import { ConversationState } from '@/lib/conversation-types';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  message: z.string(),
  conversationState: z.any().optional(), // ConversationState peut être complexe
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversationState } = ChatRequestSchema.parse(body);

    // Initialiser l'état si pas fourni
    const currentState: ConversationState = conversationState || 
      ConversationManager.initializeConversation();

    // Traiter le message avec le gestionnaire de conversation
    const response = await ConversationManager.processMessage(message, currentState);

    return Response.json({
      message: response.message,
      formDefinition: response.formDefinition,
      suggestedResponses: response.suggestedResponses,
      conversationState: response.updatedState,
      needsUserInput: response.needsUserInput,
      nextPhase: response.nextPhase,
    });

  } catch (error) {
    console.error('Erreur dans l\'API chat:', error);
    return Response.json(
      { 
        error: 'Erreur lors du traitement de la conversation',
        message: 'Désolé, j\'ai eu un problème. Peux-tu réessayer ?'
      },
      { status: 500 }
    );
  }
}