'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, User } from 'lucide-react';
import { FormDefinition } from '@/lib/types';
import { ToolSelector, FormTool } from '@/components/ToolSelector';
import { GoogleFormsConnectionCard } from '@/components/GoogleFormsConnect';
import { TypeformConnectionCard } from '@/components/TypeformConnect';
import { TallyConnectionCard } from '@/components/ConnectTally';
import { EmptyChat } from '@/components/EmptyChat';
import { motion, AnimatePresence } from 'motion/react';

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
        parts.push(<strong key={parts.length} className="font-semibold text-foreground/90">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*')) {
        parts.push(<em key={parts.length} className="text-foreground/80">{token.slice(1, -1)}</em>);
      } else if (token.startsWith('`')) {
        parts.push(<code key={parts.length} className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-sm">{token.slice(1, -1)}</code>);
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
          <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-1 my-2 text-foreground/90">
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
        <p key={`p-${elements.length}`} className="leading-relaxed text-foreground/90">
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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setIsMultiline(false);
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
    <div className="h-screen bg-gradient-mesh-light flex flex-col font-sans text-foreground overflow-hidden">

      {/* Header - Transparent et épuré */}
      <motion.div
        className="fixed top-0 inset-x-0 z-50 p-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/40 px-6 py-3 flex items-center justify-between rounded-full">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">Form Builder AI</h1>
                {selectedTool && (
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                    {selectedTool === 'google-forms' ? 'Google Forms' : selectedTool === 'tally' ? 'Tally' : selectedTool}
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground font-medium px-3 py-1 bg-gray-100/50 rounded-full">
              Beta
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="flex-1 pt-24 pb-4 overflow-hidden">
        {/* Interface avec chat et preview */}
        <div className="h-full flex max-w-[1600px] mx-auto px-4 gap-6">

          {/* Preview à gauche (si active) */}
          <AnimatePresence>
            {showPreview && previewLink && (
              <motion.div
                className="w-1/2 hidden md:flex flex-col rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-white"
                initial={{ x: -50, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -50, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                  <h2 className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                    <span className="text-lg">👁️</span>
                    Prévisualisation en direct
                  </h2>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  </div>
                </div>
                <div className="flex-1 relative bg-white">
                  <iframe
                    src={previewLink}
                    className="w-full h-full border-0 absolute inset-0"
                    title="Form Preview"
                  />
                </div>
                <div className="p-4 border-t bg-gray-50/50">
                  <Button
                    onClick={handleFinalizeForm}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all rounded-xl h-11"
                  >
                    ✅ Finaliser et obtenir le lien
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat à droite (ou centré si seul) */}
          <div className={`flex flex-col transition-all duration-500 ease-in-out ${showPreview && previewLink ? 'w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
            <div className="flex-1 overflow-y-auto px-2 space-y-6 scrollbar-hide py-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-md shadow-primary/30">
                          <User className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                          <span className="font-bold font-mono text-sm">F</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                      <div className={`text-[11px] font-medium text-muted-foreground/60 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {message.role === 'user' ? 'Vous' : 'Form Assistant'}
                      </div>

                      <motion.div
                        className={`rounded-2xl p-5 shadow-sm
                          ${message.role === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-sm'
                            : 'bg-white/80 backdrop-blur-md border border-white/50 text-foreground rounded-tl-sm'
                          }`}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="whitespace-pre-wrap text-[15px]">{renderMarkdown(message.content)}</div>

                        {/* Sélecteur d'outil */}
                        {message.requiresToolSelection && (
                          <div className="mt-6 pt-4 border-t border-border/50">
                            <ToolSelector onSelectTool={handleToolSelection} />
                          </div>
                        )}

                        {/* Formulaire de connexion */}
                        {message.requiresToolConnection && (
                          <div className="mt-6">
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

                        {/* Lien final */}
                        {message.shareableLink && !showPreview && (
                          <div className="mt-2 p-1 bg-white/50 rounded-lg border border-white/60 w-fit max-w-full">
                            <div className="flex gap-1.5 items-center p-0.5">
                              <input
                                type="text"
                                value={message.shareableLink}
                                readOnly
                                className="flex-1 px-2 py-1 bg-transparent text-xs font-mono text-muted-foreground outline-none min-w-0"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(message.shareableLink!);
                                  alert('Lien copié ! 📋');
                                }}
                                className="h-7 w-7 rounded-md hover:bg-white text-green-600 hover:text-green-700 shrink-0"
                                title="Copier le lien"
                              >
                                <span className="text-xs">📋</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  className="flex justify-start pl-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-1.5 bg-white/50 border border-white/40 shadow-sm rounded-2xl px-5 py-4">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input zone - Flottante */}
            <div className="p-4 md:p-6 pt-2">
              <motion.div
                className="relative max-w-3xl mx-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-[28px] blur-lg -z-10" />

                <form
                  onSubmit={handleSubmit}
                  className={`
                    relative flex items-end gap-2 p-2 bg-white/80 backdrop-blur-xl
                    ${isMultiline ? 'rounded-[28px]' : 'rounded-full'}
                    transition-all duration-300
                  `}
                >
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
                    className="flex-1 resize-none bg-transparent max-h-[200px] py-3.5 px-5 text-[15px] focus:outline-none placeholder:text-muted-foreground/50"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="w-11 h-11 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 shrink-0 mb-0.5 mr-0.5"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </form>

                <div className="text-center mt-3">
                  <p className="text-[10px] text-muted-foreground/40 font-medium">
                    Appuyez sur Entrée pour envoyer
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
