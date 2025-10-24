'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { DynamicForm } from '@/components/DynamicForm';
import { FormDefinition, FormSubmission } from '@/lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  formDefinition?: FormDefinition;
  shareableLink?: string;
  shortLink?: string;
  formId?: string; // ID du formulaire dans la DB
  needsValidation?: boolean; // Indique si le formulaire attend validation
}

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Salut ! 👋 Je suis ton assistant pour créer des formulaires. Décris-moi le formulaire que tu souhaites créer et je t\'aiderai à le construire !',
      timestamp: new Date(),
    }
  ]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isValidatingForm, setIsValidatingForm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Ajouter le message utilisateur et vider l'input
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Construire l'historique pour l'API
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory
        }),
      });

      const data = await response.json();

      if (data.assistantMessage) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.assistantMessage,
          timestamp: new Date(),
          formDefinition: data.formDefinition || undefined,
          needsValidation: data.formDefinition ? true : false, // Si formulaire généré, attendre validation
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Erreur lors de la conversation:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, j\'ai eu un problème technique. Peux-tu répéter ta demande ?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateForm = async (messageId: string, formDefinition: FormDefinition) => {
    setIsValidatingForm(true);
    try {
      // Créer le formulaire dans la base de données
      const response = await fetch('/api/forms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formDefinition,
          title: formDefinition.title,
          description: formDefinition.description,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour le message avec les liens
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                shareableLink: data.shareableLink,
                shortLink: data.shortLink,
                formId: data.formId,
                needsValidation: false 
              }
            : msg
        ));

        // Ajouter un message de confirmation
        const confirmMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🎉 Super ! Ton formulaire est maintenant prêt à être partagé !\n\nTu peux utiliser ce lien pour le partager avec d'autres personnes. Ils pourront le remplir et tu pourras voir toutes les réponses en me demandant les statistiques. 📊`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMessage]);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Il y a eu un problème lors de la création du lien. Peux-tu réessayer ?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsValidatingForm(false);
    }
  };

  const handleFormSubmit = async (formData: FormSubmission) => {
    setIsSubmittingForm(true);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          formId: 'conversation-form',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const successMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '✅ Parfait ! Ton formulaire a été soumis avec succès. Merci pour les informations ! 🎉\n\nVeux-tu créer un autre formulaire ?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Il y a eu un problème lors de la soumission. Peux-tu réessayer ?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Form Builder Assistant</h1>
          <p className="text-gray-600 text-sm">Discute avec moi pour créer ton formulaire parfait</p>
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  
                  {/* Avatar */}
                  <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {message.role === 'user' ? '👤' : '🤖'}
                    </div>
                    
                    <div className="flex-1">
                      {/* Bulle de message */}
                      <div className={`rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {/* Formulaire intégré dans le message - PRÉVISUALISATION */}
                        {message.formDefinition && message.needsValidation && (
                          <div className="mt-4 space-y-3">
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                              <p className="text-sm font-semibold text-amber-800 mb-2">
                                � Prévisualisation du formulaire
                              </p>
                              <p className="text-xs text-amber-700">
                                Teste le formulaire ci-dessous. Si ça te convient, clique sur &quot;Valider et obtenir le lien&quot; pour le partager.
                              </p>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg border">
                              <DynamicForm
                                formDefinition={message.formDefinition}
                                onSubmit={handleFormSubmit}
                                isSubmitting={isSubmittingForm}
                              />
                            </div>

                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() => handleValidateForm(message.id, message.formDefinition!)}
                                disabled={isValidatingForm}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isValidatingForm ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Création du lien...
                                  </>
                                ) : (
                                  <>✅ Valider et obtenir le lien</>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Liens de partage - APRÈS VALIDATION */}
                        {message.shortLink && !message.needsValidation && (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-semibold text-green-800 mb-2">🔗 Lien de partage :</p>
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={message.shortLink}
                                readOnly
                                className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(message.shortLink!);
                                  alert('Lien copié ! 📋');
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                📋 Copier
                              </Button>
                            </div>
                            <p className="text-xs text-green-700 mt-2">
                              Partage ce lien pour collecter des réponses ! Demande-moi les statistiques quand tu veux. 📊
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-right text-gray-500' : 'text-left text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicateur de frappe */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    🤖
                  </div>
                  <div className="bg-white border shadow-sm rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">L&apos;assistant réfléchit...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input en bas */}
          <div className="flex-shrink-0 border-t bg-white p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écris ton message ici..."
                disabled={isLoading}
                className="flex-1 text-base"
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
