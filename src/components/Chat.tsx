'use client';

import { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { ChatMessage, ChatState } from '@/lib/chat-types';
import { ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { DynamicForm } from './DynamicForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Chat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [{
      id: nanoid(),
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA pour créer des formulaires. Décrivez-moi le type de formulaire dont vous avez besoin et je le générerai pour vous. Par exemple : "Je veux un formulaire d\'inscription pour un atelier de cuisine" ou "J\'ai besoin d\'un questionnaire de satisfaction client".',
      timestamp: new Date(),
    }],
    isLoading: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSendMessage = async (content: string) => {
    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Appeler l'API du chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatState.messages, userMessage],
          conversationSummary: chatState.conversationSummary,
        }),
      });

      const data = await response.json();

      if (data.message) {
        const assistantMessage: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          ui: data.formDefinition ? (
            <DynamicForm
              formDefinition={data.formDefinition}
              onSubmit={handleFormSubmit}
              isSubmitting={false}
            />
          ) : undefined,
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          conversationSummary: data.conversationSummary,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      const errorMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  };

  const handleFormSubmit = async (formData: Record<string, string | string[] | number | boolean>) => {
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          formId: 'chat-generated-form',
          conversationId: nanoid(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const successMessage: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: '✅ Parfait ! Votre formulaire a été soumis avec succès. Les données ont été enregistrées. Y a-t-il autre chose que je puisse faire pour vous ?',
          timestamp: new Date(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, successMessage],
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Assistant IA - Générateur de Formulaires
          </CardTitle>
          <CardDescription>
            Discutez avec l&apos;IA pour créer des formulaires personnalisés
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatState.messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            {chatState.isLoading && (
              <div className="flex justify-start">
                <Card className="bg-gray-100">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">L&apos;IA réfléchit...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={chatState.isLoading}
        />
      </Card>
    </div>
  );
}