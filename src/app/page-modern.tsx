'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import { FormDefinition } from '@/lib/types';
import { ToolSelector, FormTool } from '@/components/ToolSelector';
import { GoogleFormsConnectionCard } from '@/components/GoogleFormsConnect';
import { TypeformConnectionCard } from '@/components/TypeformConnect';
import { TallyConnectionCard } from '@/components/ConnectTally';
import { EmptyChat } from '@/components/EmptyChat';
import { motion } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  formDefinition?: FormDefinition;
  shareableLink?: string;
  formId?: string;
  needsValidation?: boolean;
  requiresToolSelection?: boolean;
  requiresToolConnection?: FormTool;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isTallyConnected, setIsTallyConnected] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isTypeformConnected, setIsTypeformConnected] = useState(false);
  const [selectedTool, setSelectedTool] = useState<FormTool | null>(null);
  const [userId] = useState('user-demo-123');

  // States pour la preview
  const [currentFormDefinition, setCurrentFormDefinition] = useState<FormDefinition | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);

  const formatInline = (inputText: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    while ((match = regex.exec(inputText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(inputText.slice(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**')) {
        parts.push(<strong key={parts.length}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*')) {
        parts.push(<em key={parts.length}>{token.slice(1, -1)}</em>);
      } else if (token.startsWith('`')) {
        parts.push(<code key={parts.length} className="px-1 py-0.5 rounded bg-gray-100">{token.slice(1, -1)}</code>);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < inputText.length) {
      parts.push(inputText.slice(lastIndex));
    }
    return parts;
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split(/\r?\n/);
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-1">
            {listItems.map((li, idx) => (
              <li key={idx}>{formatInline(li)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line) => {
      const bullet = line.match(/^\s*[-*]\s+(.*)$/);
      if (bullet) {
        listItems.push(bullet[1]);
        return;
      }
      if (line.trim() === '') {
        flushList();
        elements.push(<div key={`br-${elements.length}`} className="h-2" />);
        return;
      }
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="leading-relaxed">
          {formatInline(line)}
        </p>
      );
    });
    flushList();
    return <>{elements}</>;
  };

  const autoResizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    setIsMultiline(el.scrollHeight > 56 || el.value.includes('\n'));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setIsMounted(true);
    checkTallyConnection();
    checkGoogleConnection();
    checkTypeformConnection();
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

  const checkTypeformConnection = async () => {
    try {
      const response = await fetch(`/api/auth/typeform/status?userId=${userId}`);
      const data = await response.json();
      setIsTypeformConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Typeform connection:', error);
    }
  };

  const handleInitialSubmit = async (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages([userMessage]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '🎯 Super ! Avant de créer ton formulaire, choisis l\'outil que tu veux utiliser :',
        timestamp: new Date(),
        requiresToolSelection: true,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
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

    try {
      const lowerContent = userMessage.content.toLowerCase();
      const wantsToCreateForm =
        lowerContent.includes('formulaire') ||
        lowerContent.includes('form') ||
        lowerContent.includes('créer') ||
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

      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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
          needsValidation: data.formDefinition ? true : false,
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (data.formDefinition) {
          if (selectedTool === 'google-forms' && isGoogleConnected) {
            await createGoogleForm(data.formDefinition, assistantMessage.id);
          } else if (selectedTool === 'tally' && isTallyConnected) {
            await createTallyForm(data.formDefinition, assistantMessage.id);
          } else if (selectedTool === 'typeform' && isTypeformConnected) {
            await createTypeformForm(data.formDefinition);
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
    try {
      const googleResponse = await fetch('/api/google-forms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formDefinition,
          userId: userId,
        }),
      });

      const googleData = await googleResponse.json();

      if (googleData.success) {
        setShowPreview(true);
        setPreviewLink(googleData.responderUri);
        setCurrentFormDefinition(formDefinition);

        const previewMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✨ Super ! Ton formulaire est créé. Tu peux le voir dans la prévisualisation.\n\nSi tu veux modifier quelque chose, dis-le moi !`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, previewMsg]);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création Google Forms:', error);
    }
  };

  const createTallyForm = async (formDefinition: FormDefinition, messageId: string) => {
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
      }
    } catch (error) {
      console.error('Erreur lors de la création Tally:', error);
    }
  };

  const createTypeformForm = async (formDefinition: FormDefinition) => {
    try {
      const typeformResponse = await fetch('/api/typeform/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formDefinition,
          userId: userId,
        }),
      });

      const typeformData = await typeformResponse.json();

      if (typeformData.success) {
        setShowPreview(true);
        setPreviewLink(typeformData.formUrl);
        setCurrentFormDefinition(formDefinition);

        const previewMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✨ Super ! Ton formulaire Typeform est créé. Tu peux le voir dans la prévisualisation.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, previewMsg]);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création Typeform:', error);
    }
  };

  const isToolConnected = (tool: FormTool): boolean => {
    if (tool === 'tally') return isTallyConnected;
    if (tool === 'google-forms') return isGoogleConnected;
    if (tool === 'typeform') return isTypeformConnected;
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

    setMessages(prev => prev.filter(m => !m.requiresToolSelection));

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

  // Si pas de messages, afficher l'écran d'accueil immersif
  if (messages.length === 0) {
    return <EmptyChat onSubmit={handleInitialSubmit} />;
  }

  return (
    <div className="h-screen bg-white flex flex-col">

      {/* Header moderne */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm shadow-sm border-b p-4 flex-shrink-0"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Form Builder AI</h1>
              {selectedTool && (
                <p className="text-xs text-gray-500">
                  Outil : {selectedTool === 'google-forms' ? 'Google Forms' : selectedTool === 'tally' ? 'Tally' : selectedTool}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        {/* Interface avec chat et preview */}
        <div className="h-full flex">
          {/* Preview à gauche (si active) */}
          {showPreview && previewLink && (
            <motion.div
              className="w-1/2 border-r bg-white flex flex-col"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
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
            </motion.div>
          )}

          {/* Chat à droite (ou pleine largeur si pas de preview) */}
          <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>

                    {/* Avatar + Message */}
                    <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                          }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {message.role === 'user' ? '👤' : '🤖'}
                      </motion.div>

                      <div className="flex-1">
                        <motion.div
                          className={`rounded-lg p-4 ${message.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border shadow-sm'
                            }`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="whitespace-pre-wrap">{renderMarkdown(message.content)}</div>

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
                              {message.requiresToolConnection === 'typeform' && (
                                <TypeformConnectionCard
                                  userId={userId}
                                  isConnected={isTypeformConnected}
                                  onConnect={() => {
                                    setIsTypeformConnected(true);
                                    setMessages(prev => prev.filter(m => !m.requiresToolConnection));
                                    const successMsg: ChatMessage = {
                                      id: Date.now().toString(),
                                      role: 'assistant',
                                      content: '🎉 Génial ! Ton compte Typeform est connecté. Décris-moi maintenant le formulaire que tu souhaites créer !',
                                      timestamp: new Date(),
                                    };
                                    setMessages(prev => [...prev, successMsg]);
                                  }}
                                  onDisconnect={() => setIsTypeformConnected(false)}
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
                        </motion.div>

                        {/* Timestamp */}
                        <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-right text-gray-500' : 'text-left text-gray-500'
                          }`}>
                          {isMounted && message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-2 bg-white border shadow-sm rounded-lg p-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input zone */}
            <motion.div
              className="border-t bg-white p-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full flex items-center gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResizeInput(); }}
                  onInput={autoResizeInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !isLoading) {
                        (e.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
                      }
                    }
                  }}
                  placeholder="Décrivez votre formulaire..."
                  rows={1}
                  className={`flex-1 resize-none overflow-hidden h-12 md:h-14 px-5 md:px-6 py-3 md:py-4 border ${isMultiline ? 'rounded-lg' : 'rounded-full'} bg-gray-50 placeholder-gray-400 text-[15px] md:text-base focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-12 md:h-14 px-5 md:px-6 rounded-full bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
