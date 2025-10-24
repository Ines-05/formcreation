'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { FormDefinition, FormSubmission } from '@/lib/types';
import { TallyPreview } from '@/components/TallyPreview';
import { TallyConnectionCard } from '@/components/ConnectTally';
import { ToolSelector, FormTool } from '@/components/ToolSelector';
import { GoogleFormsConnectionCard } from '@/components/GoogleFormsConnect';
import { TypeformConnectionCard } from '@/components/TypeformConnect';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  formDefinition?: FormDefinition;
  shareableLink?: string;
  shortLink?: string;
  formId?: string;
  tallyFormId?: string;
  tallyEmbedUrl?: string;
  needsValidation?: boolean;
  requiresToolSelection?: boolean;
  requiresToolConnection?: FormTool;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isValidatingForm, setIsValidatingForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTallyConnected, setIsTallyConnected] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [selectedTool, setSelectedTool] = useState<FormTool | null>(null);
  const [userId] = useState('user-demo-123');
  
  // Nouveaux states pour la preview
  const [currentFormDefinition, setCurrentFormDefinition] = useState<FormDefinition | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setIsMounted(true);
    checkTallyConnection();
    checkGoogleConnection();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkTallyConnection = async () => {
    try {
      const response = await fetch(`/api/user/tally/status?userId=${userId}`);
      const data = await response.json();
      setIsTallyConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Tally connection:', error);
    }
  };

  const checkGoogleConnection = async () => {
    try {
      const response = await fetch(`/api/auth/google/status?userId=${userId}`);
      const data = await response.json();
      setIsGoogleConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    console.log('📝 Message utilisateur:', userMessage.content);
    console.log('🔧 Outil sélectionné:', selectedTool);
    console.log('🔌 Tally connecté:', isTallyConnected);
    console.log('🔌 Google connecté:', isGoogleConnected);
    
    try {
      const lowerContent = userMessage.content.toLowerCase();
      const wantsToCreateForm = 
        lowerContent.includes('formulaire') ||
        lowerContent.includes('form') ||
        lowerContent.includes('créer') ||
        lowerContent.includes('créer un') ||
        lowerContent.includes('j\'ai besoin') ||
        lowerContent.includes('je veux');

      if (wantsToCreateForm && !selectedTool) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '🎯 Super ! Avant de créer ton formulaire, choisis l\'outil que tu veux utiliser :',
          timestamp: new Date(),
          requiresToolSelection: true,
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      if (selectedTool && !isToolConnected(selectedTool)) {
        const toolName = selectedTool === 'tally' ? 'Tally' : selectedTool === 'google-forms' ? 'Google Forms' : selectedTool;
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `🔐 Parfait ! Pour créer des formulaires avec ${toolName}, tu dois d'abord connecter ton compte. Clique sur le bouton ci-dessous pour commencer :`,
          timestamp: new Date(),
          requiresToolConnection: selectedTool,
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Si l'utilisateur demande explicitement "un autre" formulaire, on nettoie le contexte
      const newFormRequestRegex = /\b(autre|encore|another|un autre|créer un autre|nouveau|nouvelle)\b/i;
      const isNewFormRequest = newFormRequestRegex.test(userMessage.content);

      let conversationHistory;
      if (isNewFormRequest) {
        console.log('♻️ Détection d\'une demande de nouveau formulaire — envoi du message seul pour éviter de réutiliser l\'ancien contexte');
        // Envoyer uniquement le message de l'utilisateur pour forcer une génération "propre"
        conversationHistory = [{ role: 'user', content: userMessage.content }];
      } else {
        // Filtrer le contexte pour enlever les anciens formulaires / messages de prévisualisation
        const filtered = [...messages]
          .filter(m => !m.formDefinition && !m.needsValidation && !m.requiresToolSelection && !m.requiresToolConnection)
          .slice(-10);

        conversationHistory = [...filtered, userMessage].map(msg => ({ role: msg.role, content: msg.content }));
      }

      console.log('📡 Envoi à /api/conversation...');
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory
        }),
      });

      console.log('📡 Réponse conversation:', response.status);
      const data = await response.json();
      console.log('📦 Données reçues:', data);

      if (data.assistantMessage) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.assistantMessage,
          timestamp: new Date(),
          formDefinition: data.formDefinition || undefined,
          needsValidation: data.formDefinition ? true : false,
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Créer le formulaire selon l'outil sélectionné
        if (data.formDefinition) {
          if (selectedTool === 'google-forms' && isGoogleConnected) {
            await createGoogleForm(data.formDefinition, assistantMessage.id);
          } else if (selectedTool === 'tally' && isTallyConnected) {
            await createTallyForm(data.formDefinition, assistantMessage.id);
          }
        }
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

  const createGoogleForm = async (formDefinition: FormDefinition, messageId: string) => {
    console.log('🎨 Création du formulaire Google Forms...');
    try {
      const googleResponse = await fetch('/api/google-forms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formDefinition,
          userId: userId,
        }),
      });

      console.log('📡 Réponse Google Forms reçue:', googleResponse.status);
      const googleData = await googleResponse.json();
      console.log('📦 Données Google Forms:', googleData);

      if (googleData.success) {
        // Activer la prévisualisation en split screen
        setShowPreview(true);
        setPreviewLink(googleData.responderUri);
        setCurrentFormDefinition(formDefinition);
        
        // Message invitant à prévisualiser
        const previewMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✨ Super ! Ton formulaire est créé. Tu peux le voir à gauche.\n\nSi tu veux modifier quelque chose, dis-le moi ! Sinon, clique sur "Finaliser" pour obtenir le lien de partage.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, previewMsg]);
      } else {
        console.error('❌ Erreur Google Forms:', googleData);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création Google Forms:', error);
    }
  };

  const createTallyForm = async (formDefinition: FormDefinition, messageId: string) => {
    console.log('🎨 Création du formulaire Tally...');
    try {
      const tallyResponse = await fetch('/api/tally/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formDefinition,
          userId: userId,
        }),
      });

      const tallyData = await tallyResponse.json();

      if (tallyData.success) {
        setShowPreview(true);
        setPreviewLink(tallyData.shareableLink);
        setCurrentFormDefinition(formDefinition);
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId
            ? { 
                ...msg, 
                tallyFormId: tallyData.formId,
                tallyEmbedUrl: tallyData.embedUrl,
                shareableLink: tallyData.shareableLink,
                shortLink: tallyData.shortLink,
              }
            : msg
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la création Tally:', error);
    }
  };

  const isToolConnected = (tool: FormTool): boolean => {
    if (tool === 'tally') return isTallyConnected;
    if (tool === 'google-forms') return isGoogleConnected;
    if (tool === 'typeform') return false;
    if (tool === 'internal') return true;
    return false;
  };

  const handleToolSelection = (tool: FormTool) => {
    setSelectedTool(tool);
    
    const toolNames: Record<NonNullable<FormTool>, string> = {
      'tally': 'Tally',
      'google-forms': 'Google Forms',
      'typeform': 'Typeform',
      'internal': 'le formulaire hébergé sur cette app',
    };
    
    const toolName = toolNames[tool];
    
    // Retirer le message avec requiresToolSelection
    setMessages(prev => prev.filter(m => !m.requiresToolSelection));
    
    // Ajouter un message simple confirmant le choix
    const confirmationMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ Parfait ! Tu as choisi **${toolName}**.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmationMsg]);
    
    if (isToolConnected(tool)) {
      const readyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ton compte est déjà connecté ! Décris-moi le formulaire que tu veux créer. 🎨`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, readyMsg]);
    } else if (tool !== 'internal') {
      const connectMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🔐 Connecte ton compte ${toolName} pour continuer :`,
        timestamp: new Date(),
        requiresToolConnection: tool,
      };
      setMessages(prev => [...prev, connectMsg]);
    }
  };

  const handleFinalizeForm = () => {
    setShowPreview(false);
    
    const finalMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🎉 Parfait ! Ton formulaire est finalisé.\n\n🔗 **Lien de partage** :\n${previewLink}\n\nPartage ce lien pour commencer à collecter des réponses ! 📊`,
      timestamp: new Date(),
      shareableLink: previewLink || undefined,
    };
    
    setMessages(prev => [...prev, finalMsg]);
    setCurrentFormDefinition(null);
    setPreviewLink(null);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      
      {/* Header simplifié */}
      <div className="bg-white shadow-sm border-b p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Form Builder AI</h1>
            {selectedTool && (
              <p className="text-xs text-gray-500">
                Outil : {selectedTool === 'google-forms' ? 'Google Forms' : selectedTool === 'tally' ? 'Tally' : selectedTool}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          // Page d'accueil style Typeform
          <div className="h-full flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  What would you like to create?
                </h1>
                <p className="text-gray-600 text-lg">
                  Décris ton formulaire et je le créerai pour toi ✨
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type or paste your form questions..."
                  className="w-full p-6 pr-16 border-2 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none text-lg resize-none shadow-sm"
                  rows={6}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-6 right-6 p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              
              <p className="text-center text-sm text-gray-500 mt-6">
                💡 Example: "Create a registration form with name, email, and phone number"
              </p>
            </div>
          </div>
        ) : (
          // Interface avec chat et preview
          <div className="h-full flex">
            {/* Preview à gauche (si active) */}
            {showPreview && previewLink && (
              <div className="w-1/2 border-r bg-white flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">👁️</span>
                    Prévisualisation
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    Voici à quoi ressemble ton formulaire
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <iframe
                    src={previewLink}
                    className="w-full h-full border-0"
                    title="Form Preview"
                  />
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <Button
                    onClick={handleFinalizeForm}
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  >
                    ✅ Finaliser et obtenir le lien
                  </Button>
                </div>
              </div>
            )}

            {/* Chat à droite (ou pleine largeur si pas de preview) */}
            <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'}`}>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      
                      {/* Avatar + Message */}
                      <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                        
                        <div className="flex-1">
                          <div className={`rounded-lg p-4 ${
                            message.role === 'user' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-white border shadow-sm'
                          }`}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            
                            {/* Sélecteur d'outil */}
                            {message.requiresToolSelection && (
                              <div className="mt-4">
                                <ToolSelector onSelectTool={handleToolSelection} />
                              </div>
                            )}

                            {/* Formulaire de connexion */}
                            {message.requiresToolConnection && (
                              <div className="mt-4">
                                {message.requiresToolConnection === 'tally' && (
                                  <TallyConnectionCard
                                    userId={userId}
                                    isConnected={isTallyConnected}
                                    onConnect={() => {
                                      setIsTallyConnected(true);
                                      setMessages(prev => prev.filter(m => !m.requiresToolConnection));
                                      const successMsg: ChatMessage = {
                                        id: Date.now().toString(),
                                        role: 'assistant',
                                        content: '🎉 Excellent ! Ton compte Tally est maintenant connecté. Décris-moi le formulaire que tu veux créer !',
                                        timestamp: new Date(),
                                      };
                                      setMessages(prev => [...prev, successMsg]);
                                    }}
                                    onDisconnect={() => setIsTallyConnected(false)}
                                  />
                                )}
                                {message.requiresToolConnection === 'google-forms' && (
                                  <GoogleFormsConnectionCard
                                    userId={userId}
                                    isConnected={isGoogleConnected}
                                    onConnect={() => {
                                      setIsGoogleConnected(true);
                                      setMessages(prev => prev.filter(m => !m.requiresToolConnection));
                                      const successMsg: ChatMessage = {
                                        id: Date.now().toString(),
                                        role: 'assistant',
                                        content: '🎉 Super ! Ton compte Google est connecté. Maintenant, décris-moi le formulaire que tu souhaites créer !',
                                        timestamp: new Date(),
                                      };
                                      setMessages(prev => [...prev, successMsg]);
                                    }}
                                    onDisconnect={() => setIsGoogleConnected(false)}
                                  />
                                )}
                              </div>
                            )}

                            {/* Lien final après finalisation */}
                            {message.shareableLink && !showPreview && (
                              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={message.shareableLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono"
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      navigator.clipboard.writeText(message.shareableLink!);
                                      alert('Lien copié ! 📋');
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    📋 Copier
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Timestamp */}
                          <div className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-right text-gray-500' : 'text-left text-gray-500'
                          }`}>
                            {isMounted && message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 bg-white border shadow-sm rounded-lg p-4">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input zone */}
              <div className="border-t bg-white p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tape ton message..."
                    className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-purple-600 hover:bg-purple-700 px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
