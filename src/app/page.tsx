'use client';

import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, LayoutDashboard, User } from 'lucide-react';
import { FormDefinition } from '@/lib/types';
import { ToolSelector, FormTool } from '@/components/ToolSelector';
import { GoogleFormsConnectionCard } from '@/components/GoogleFormsConnect';
import { TypeformConnectionCard } from '@/components/TypeformConnect';
import { TallyConnectionCard } from '@/components/ConnectTally';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { FormPreviewModern } from '@/components/FormPreviewModern';
import { FormPreviewCard } from '@/components/FormPreviewCard';
import { FormLinkCard } from '@/components/FormLinkCard';
import { ResizablePanels } from '@/components/ResizablePanels';
import { motion, AnimatePresence } from 'motion/react';
import { SignedIn, useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from '@/components/Sidebar';
import { AuthCard } from '@/components/AuthCard';

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
  requiresAuth?: boolean;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [isMounted, setIsMounted] = useState(false);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [isTallyConnected, setIsTallyConnected] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isTypeformConnected, setIsTypeformConnected] = useState(false);
  const [selectedTool, setSelectedTool] = useState<FormTool | null>(null);

  const { user, isLoaded } = useUser();
  const userId = user?.id || 'anonymous';
  const [conversationId, setConversationId] = useState<string | null>(null);

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
        parts.push(<strong key={parts.length} className="font-semibold">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*')) {
        parts.push(<em key={parts.length} className="italic">{token.slice(1, -1)}</em>);
      } else if (token.startsWith('`')) {
        parts.push(<code key={parts.length} className="px-1.5 py-0.5 rounded-md bg-white/20 font-mono text-sm">{token.slice(1, -1)}</code>);
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
          <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-1 my-2">
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const autoResizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    setIsMultiline(el.scrollHeight > 56 || el.value.includes('\n'));
  };

  const safeJSON = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return null;
  };

  const checkTallyConnection = async () => {
    if (userId === 'anonymous') return;
    try {
      const response = await fetch(`/api/user/tally/status?userId=${userId}`);
      const data = await safeJSON(response);
      if (data) setIsTallyConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Tally connection:', error);
    }
  };

  const checkGoogleConnection = async () => {
    if (userId === 'anonymous') return;
    try {
      const response = await fetch(`/api/auth/google/status?userId=${userId}`);
      const data = await safeJSON(response);
      if (data) setIsGoogleConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const checkTypeformConnection = async () => {
    if (userId === 'anonymous') return;
    try {
      const response = await fetch(`/api/auth/typeform/status?userId=${userId}`);
      const data = await safeJSON(response);
      if (data) setIsTypeformConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking Typeform connection:', error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (isLoaded && userId !== 'anonymous') {
      checkTallyConnection();
      checkGoogleConnection();
      checkTypeformConnection();
    }
  }, [isLoaded, userId]);

  // Gérer la connexion réussie pendant une conversation
  useEffect(() => {
    if (isLoaded && userId !== 'anonymous' && messages.some(m => m.requiresAuth)) {
      setMessages(prev => {
        // Enlever les messages qui demandaient de se connecter
        const filtered = prev.filter(m => !m.requiresAuth);

        // Ajouter un message de succès
        const authSuccessMsg: ChatMessage = {
          id: `auth-success-${Date.now()}`,
          role: 'assistant',
          content: `✅ Super ! Vous êtes maintenant connecté en tant que **${user?.firstName || 'utilisateur'}**. Votre session est active et nous pouvons désormais sauvegarder et exporter vos formulaires.`,
          timestamp: new Date(),
        };

        return [...filtered, authSuccessMsg];
      });

      // Si on n'a pas encore d'ID de conversation, on en génère un pour pouvoir sauvegarder
      if (!conversationId) {
        setConversationId(uuidv4());
      }
    }
  }, [userId, isLoaded, messages, user?.firstName, conversationId]);

  useEffect(() => {
    scrollToBottom();
    // Sauvegarder la conversation si elle a un ID et qu'on est connecté
    if (messages.length > 0 && conversationId && userId !== 'anonymous') {
      saveConversation();
    }
  }, [messages]);

  const saveConversation = async () => {
    if (!conversationId || userId === 'anonymous') return;

    try {
      const response = await fetch('/api/user/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId,
          title: messages[0]?.content?.slice(0, 50) || 'Nouvelle conversation',
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            formDefinition: m.formDefinition
          }))
        })
      });
      // On ne parse pas forcément le JSON ici si on n'en a pas besoin
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/user/conversations/${id}`);
      const data = await safeJSON(res);
      if (data && data.success) {
        setConversationId(id);
        const savedMessages = data.conversation.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(savedMessages);

        // Trouver le dernier formulaire dans l'historique pour la preview
        const lastWithForm = [...savedMessages].reverse().find(m => m.formDefinition);
        if (lastWithForm) {
          setCurrentFormDefinition(lastWithForm.formDefinition);
          setShowPreview(true);
        } else {
          setCurrentFormDefinition(null);
          setShowPreview(false);
        }
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setCurrentFormDefinition(null);
    setShowPreview(false);
    setSelectedTool(null);
  };
  const getToolDisplayName = (tool: string): string => {
    const names: { [key: string]: string } = {
      'typeform': 'Typeform',
      'google': 'Google Forms',
      'tally': 'Tally',
    };
    return names[tool] || tool;
  };

  const getToolConnectionStatus = (tool: string): { isConnected: boolean } => {
    switch (tool) {
      case 'typeform':
        return { isConnected: isTypeformConnected };
      case 'google':
        return { isConnected: isGoogleConnected };
      case 'tally':
        return { isConnected: isTallyConnected };
      default:
        return { isConnected: false };
    }
  };

  const handleInitialSubmit = async (text: string) => {
    const convId = conversationId || uuidv4();
    if (!conversationId) setConversationId(convId);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages([userMessage]);

    if (userId === 'anonymous') {
      const authMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Je serais ravi de vous aider à créer votre formulaire ! Cependant, vous devez être connecté pour sauvegarder vos créations et les exporter vers Google Forms, Tally ou Typeform.",
        timestamp: new Date(),
        requiresAuth: true,
      };
      setMessages(prev => [...prev, authMessage]);
      return;
    }

    setIsLoading(true);

    try {
      // Appeler l'API chat pour détecter l'intention
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: [],
        }),
      });

      const data = await safeJSON(response);

      if (data && data.shouldStartFormCreation) {
        // L'utilisateur veut créer un formulaire
        const detectedTool = data.detectedTool; // 'typeform', 'google', 'tally', ou null

        if (detectedTool) {
          // L'utilisateur a mentionné un outil spécifique au premier message
          const toolStatus = getToolConnectionStatus(detectedTool);

          if (toolStatus.isConnected) {
            // ✅ Outil déjà connecté → Confirmer et commencer le streaming directement
            const toolFormTool = detectedTool === 'typeform' ? 'typeform' : detectedTool === 'google' ? 'google-forms' : 'tally';
            setSelectedTool(toolFormTool as FormTool);
            const toolName = getToolDisplayName(detectedTool);
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `✅ Parfait ! J'ai détecté que ton compte ${toolName} est déjà connecté. Je vais créer ton formulaire maintenant...`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Lancer le streaming immédiatement
            setTimeout(() => handleStreamingGeneration(text), 1000);
          } else {
            // ❌ Outil pas connecté → Afficher card de connexion
            const toolFormTool = detectedTool === 'typeform' ? 'typeform' : detectedTool === 'google' ? 'google-forms' : 'tally';
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `Super ! Tu veux utiliser ${getToolDisplayName(detectedTool)}. Connecte-toi d'abord pour que je puisse créer ton formulaire.`,
              timestamp: new Date(),
              requiresToolConnection: toolFormTool as FormTool,
            };
            setMessages(prev => [...prev, assistantMessage]);
            setSelectedTool(toolFormTool as FormTool);
          }
        } else {
          // Pas d'outil mentionné → Afficher ToolSelector
          await new Promise(resolve => setTimeout(resolve, 500));
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '🎯 Super ! Avant de créer ton formulaire, choisis l\'outil que tu veux utiliser :',
            timestamp: new Date(),
            requiresToolSelection: true,
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else if (data) {
        // Conversation normale
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || 'Comment puis-je t\'aider ?',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, j\'ai eu un petit problème. Comment puis-je t\'aider avec la création de formulaires ?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const convId = conversationId || uuidv4();
    if (!conversationId) setConversationId(convId);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (userId === 'anonymous') {
      const authMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Vous devez être connecté pour continuer cette conversation et sauvegarder votre formulaire.",
        timestamp: new Date(),
        requiresAuth: true,
      };
      setMessages(prev => [...prev, authMessage]);
      return;
    }

    setIsLoading(true);

    // Reset input height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setIsMultiline(false);


    try {
      // Si l'utilisateur a choisi un outil mais n'est pas connecté
      if (selectedTool && !isToolConnected(selectedTool)) {
        const toolName = selectedTool === 'tally' ? 'Tally' : selectedTool === 'google-forms' ? 'Google Forms' : 'Typeform';
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Excellent choix ! Tu as sélectionné ${toolName}. Connecte-toi pour commencer.`,
          timestamp: new Date(),
          requiresToolConnection: selectedTool,
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Si l'outil est connecté, utiliser le streaming pour générer le formulaire progressivement
      if (selectedTool && isToolConnected(selectedTool)) {
        await handleStreamingGeneration(userMessage.content);
      } else {
        // Pas d'outil sélectionné → Utiliser l'API chat pour détecter l'intention ET l'outil
        const response = await fetch('/api/chat', {
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

        const data = await safeJSON(response);

        if (data && (data.shouldStartFormCreation || data.detectedTool)) {
          // L'utilisateur veut créer un formulaire OU change d'outil
          const detectedTool = data.detectedTool; // 'typeform', 'google', 'tally', ou null

          if (detectedTool) {
            // L'utilisateur a mentionné un outil spécifique
            // Vérifier si c'est un changement d'outil
            const isToolChange = selectedTool !== null && selectedTool !== (
              detectedTool === 'typeform' ? 'typeform' :
                detectedTool === 'google' ? 'google-forms' :
                  'tally'
            );

            const toolStatus = getToolConnectionStatus(detectedTool);
            const toolFormTool = detectedTool === 'typeform' ? 'typeform' : detectedTool === 'google' ? 'google-forms' : 'tally';
            const toolName = getToolDisplayName(detectedTool);

            if (toolStatus.isConnected) {
              // ✅ Outil déjà connecté → Confirmer et commencer le streaming directement
              setSelectedTool(toolFormTool as FormTool);
              const message = isToolChange
                ? `✅ Pas de problème ! On switch à ${toolName}. Ton compte est déjà connecté. Je vais créer ton formulaire maintenant...`
                : `✅ Parfait ! J'ai détecté que ton compte ${toolName} est déjà connecté. Je vais créer ton formulaire maintenant...`;

              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: message,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, assistantMessage]);

              // Lancer le streaming immédiatement
              setTimeout(() => handleStreamingGeneration(userMessage.content), 1000);
            } else {
              // ❌ Outil pas connecté → Afficher card de connexion
              const message = isToolChange
                ? `Pas de problème ! On switch à ${toolName}. Connecte-toi pour que je puisse créer ton formulaire.`
                : `Super ! Tu veux utiliser ${toolName}. Connecte-toi d'abord pour que je puisse créer ton formulaire.`;

              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: message,
                timestamp: new Date(),
                requiresToolConnection: toolFormTool as FormTool,
              };
              setMessages(prev => [...prev, assistantMessage]);
              setSelectedTool(toolFormTool as FormTool);
            }
          } else {
            // Pas d'outil mentionné → Afficher ToolSelector seulement si aucun outil n'a été sélectionné
            if (!selectedTool && data.shouldStartFormCreation) {
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '🎯 Super ! Avant de créer ton formulaire, choisis l\'outil que tu veux utiliser :',
                timestamp: new Date(),
                requiresToolSelection: true,
              };
              setMessages(prev => [...prev, assistantMessage]);
            } else if (data.shouldStartFormCreation) {
              // L'utilisateur veut créer mais ne mentionne pas d'outil → Continuer avec l'outil actuel
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Bien sûr ! Dis-moi ce que tu veux dans ton formulaire.',
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, assistantMessage]);
            }
          }
        } else {
          // Conversation normale
          const conversationResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.reply || 'Comment puis-je t\'aider ?',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, conversationResponse]);
        }
        setIsLoading(false);
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

  const handleCancelToolSelection = () => {
    setSelectedTool(null);
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Pas de problème. Veux-tu choisir un autre outil ?',
      timestamp: new Date(),
      requiresToolSelection: true,
    };
    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleStreamingGeneration = async (userInput: string) => {
    try {
      const response = await fetch('/api/generate-form-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userInput,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          currentForm: currentFormDefinition,
        }),
      });

      if (!response.ok) throw new Error('Streaming failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let accumulatedText = '';
      const assistantMessageId = Date.now().toString();

      // Créer le message de l'assistant qui sera mis à jour progressivement
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        let formJson = '';
        let messageText = '';

        // Fonction pour tenter de parser le JSON partiel
        const tryParsePartialJson = (jsonString: string) => {
          try {
            // Tenter de trouver le dernier objet complet
            let lastValidJson = jsonString.trim();
            if (!lastValidJson.startsWith('{')) return null;

            // Si le JSON ne finit pas par }, on tente de fermer les accolades pour voir
            // Mais plus simplement, on peut essayer de parser à chaque chunk
            // car le modèle émet souvent des FORM_UPDATE complets ou structurés

            // Recherche du dernier } pour extraire ce qui est potentiellement parseable
            const lastBrace = lastValidJson.lastIndexOf('}');
            if (lastBrace !== -1) {
              const substring = lastValidJson.substring(0, lastBrace + 1);
              return JSON.parse(substring);
            }
            return null;
          } catch (e) {
            return null;
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // À la fin du streaming, assurer le parsing final
            if (formJson) {
              try {
                let cleanedJson = formJson.trim();
                const firstBrace = cleanedJson.indexOf('{');
                if (firstBrace !== -1) {
                  let braceCount = 0;
                  let lastBrace = firstBrace;
                  for (let i = firstBrace; i < cleanedJson.length; i++) {
                    if (cleanedJson[i] === '{') braceCount++;
                    if (cleanedJson[i] === '}') {
                      braceCount--;
                      if (braceCount === 0) {
                        lastBrace = i;
                        break;
                      }
                    }
                  }
                  cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
                }
                const formDef = JSON.parse(cleanedJson);
                setCurrentFormDefinition(formDef);
                setShowPreview(true);
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId ? { ...msg, formDefinition: formDef } : msg
                ));
              } catch (e) {
                console.error('Erreur parsing final:', e);
              }
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          const formMatch = accumulatedText.match(/FORM_UPDATE:([\s\S]*)/);
          if (formMatch) {
            messageText = accumulatedText.split('FORM_UPDATE:')[0].trim();
            formJson = formMatch[1];

            // Tentative de preview en temps réel
            const partialForm = tryParsePartialJson(formJson);
            if (partialForm && partialForm.fields && partialForm.fields.length > 0) {
              setCurrentFormDefinition(partialForm);
              setShowPreview(true);
            }
          } else {
            messageText = accumulatedText;
          }

          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, content: messageText } : msg
          ));
        }
      }

    } catch (error) {
      console.error('Erreur streaming:', error);
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

    if (userId === 'anonymous') {
      const authMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `C'est un excellent choix ! Mais pour utiliser **${toolNames[tool]}**, vous devez d'abord vous connecter ou créer un compte.`,
        timestamp: new Date(),
        requiresAuth: true,
      };
      setMessages(prev => [...prev, authMsg]);
      return;
    }

    if (isToolConnected(tool)) {
      const confirmationMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Excellent choix ! Tu as sélectionné **${toolName}**. J'ai détecté que ton compte est déjà connecté. Décris-moi le formulaire que tu veux créer ! 🎨`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmationMsg]);
    } else {
      const confirmationMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Excellent choix ! Tu as sélectionné **${toolName}**. Connecte-toi pour commencer.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmationMsg]);

      if (tool !== 'internal') {
        const connectMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: ``,
          timestamp: new Date(),
          requiresToolConnection: tool,
        };
        setMessages(prev => [...prev, connectMsg]);
      }
    }
  };

  const handleFinalizeForm = async () => {
    if (!currentFormDefinition) return;

    setIsLoading(true);

    try {
      let finalLink = '';

      // Créer le formulaire selon l'outil sélectionné
      if (selectedTool === 'typeform') {
        const response = await fetch('/api/typeform/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            formDefinition: currentFormDefinition,
          }),
        });

        const data = await safeJSON(response);
        if (data && data.success) {
          finalLink = data.formUrl;
        } else {
          throw new Error(data?.error || 'Erreur lors de la création sur Typeform');
        }

      } else if (selectedTool === 'google-forms') {
        const response = await fetch('/api/google-forms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            formDefinition: currentFormDefinition,
          }),
        });

        const data = await safeJSON(response);
        if (data && data.success) {
          finalLink = data.responderUri || data.shareableLink;
        } else {
          throw new Error(data?.error || 'Erreur lors de la création sur Google Forms');
        }

      } else if (selectedTool === 'tally') {
        const response = await fetch('/api/tally/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            formDefinition: currentFormDefinition,
          }),
        });

        const data = await safeJSON(response);
        if (data && data.success) {
          finalLink = data.shareableLink;
        } else {
          throw new Error(data?.error || 'Erreur lors de la création sur Tally');
        }

      } else {
        const response = await fetch('/api/forms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formDefinition: currentFormDefinition,
            title: currentFormDefinition.title,
            description: currentFormDefinition.description,
          }),
        });

        const data = await safeJSON(response);
        if (data && data.success) {
          finalLink = data.shortLink || data.shareableLink;
        } else {
          throw new Error(data?.error || 'Erreur lors de la création');
        }
      }

      setPreviewLink(finalLink);

      const toolName = selectedTool === 'google-forms' ? 'Google Forms' :
        selectedTool === 'typeform' ? 'Typeform' :
          selectedTool === 'tally' ? 'Tally' : 'local';

      const finalMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🎉 Parfait ! Ton formulaire a été créé avec succès sur ${toolName}.\n\nTon lien de partage est prêt ci-dessous. Partage-le pour commencer à collecter des réponses ! 📊`,
        timestamp: new Date(),
        shareableLink: finalLink,
      };

      setMessages(prev => [...prev, finalMsg]);

    } catch (error) {
      console.error('Error finalizing form:', error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Désolé, une erreur s'est produite lors de la création du formulaire. ${error instanceof Error ? error.message : ''}\n\nVeux-tu réessayer ?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Si pas de messages, afficher l'écran d'accueil WelcomeScreen
  if (messages.length === 0) {
    return <WelcomeScreen onSubmit={handleInitialSubmit} />;
  }

  return (
    <div className="h-screen bg-gradient-mesh-light flex overflow-hidden text-foreground">

      {/* Sidebar Historique (visible seulement si connecté) */}
      <SignedIn>
        <Sidebar
          currentId={conversationId}
          onSelect={loadConversation}
          onNew={startNewConversation}
        />
      </SignedIn>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Contenu principal */}
        <div className="flex-1 overflow-hidden pt-4 pb-4">
          {showPreview ? (
            /* Mode split avec panels redimensionnables */
            <ResizablePanels
              defaultSize={50}
              minSize={30}
              maxSize={70}
              left={
                /* Panel Chat */
                <div className="flex flex-col h-full bg-transparent">
                  <div className="flex-1 overflow-y-auto px-4 space-y-4 max-w-3xl mx-auto w-full scrollbar-hide">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className={`${message.role === 'user'
                          ? 'max-w-[85%] order-2'
                          : 'w-full max-w-3xl mx-auto order-1'
                          }`}>

                          {/* Avatar + Message */}
                          <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <motion.div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${message.role === 'user'
                                ? 'bg-gradient-to-br from-primary to-purple-600 text-white'
                                : 'bg-white text-primary border border-gray-100'
                                }`}
                            >
                              {message.role === 'user' ? <User className="w-4 h-4" /> : <span className="font-bold font-mono text-sm">F</span>}
                            </motion.div>

                            <div className="flex-1 min-w-0 space-y-3">
                              {/* Texte du message */}
                              {message.content && (
                                <div className={`${message.role === 'user'
                                  ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-md'
                                  : 'bg-white/80 backdrop-blur-md border border-white/50 text-gray-900 rounded-2xl rounded-tl-sm p-5 shadow-sm'
                                  }`}>
                                  <div className="whitespace-pre-wrap break-words">{renderMarkdown(message.content)}</div>
                                </div>
                              )}

                              {/* Carte de prévisualisation du formulaire (inline dans le chat) */}
                              {message.formDefinition && message.role === 'assistant' && (
                                <FormPreviewCard
                                  formDefinition={message.formDefinition}
                                  onExpand={() => setShowPreview(true)}
                                />
                              )}

                              {/* Sélecteur d'outil */}
                              {message.requiresToolSelection && (
                                <div className="mt-2">
                                  <ToolSelector onSelectTool={handleToolSelection} />
                                </div>
                              )}

                              {/* Formulaire de connexion */}
                              {message.requiresToolConnection && (
                                <div className="mt-2">
                                  {message.requiresToolConnection === 'tally' && (
                                    <TallyConnectionCard
                                      userId={userId}
                                      isConnected={isTallyConnected}
                                      onConnect={() => {
                                        setIsTallyConnected(true);
                                        setMessages(prev => prev.filter(m => !m.requiresToolConnection));
                                        const connectedMsg: ChatMessage = {
                                          id: Date.now().toString(),
                                          role: 'assistant',
                                          content: '✅ Parfait ! Tu es maintenant connecté à Tally.',
                                          timestamp: new Date(),
                                        };
                                        setMessages(prev => [...prev, connectedMsg]);
                                      }}
                                      onCancel={handleCancelToolSelection}
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
                                        const connectedMsg: ChatMessage = {
                                          id: Date.now().toString(),
                                          role: 'assistant',
                                          content: '✅ Parfait ! Tu es maintenant connecté à Google Forms.',
                                          timestamp: new Date(),
                                        };
                                        setMessages(prev => [...prev, connectedMsg]);
                                      }}
                                      onCancel={handleCancelToolSelection}
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
                                        const connectedMsg: ChatMessage = {
                                          id: Date.now().toString(),
                                          role: 'assistant',
                                          content: '✅ Parfait ! Tu es maintenant connecté à Typeform.',
                                          timestamp: new Date(),
                                        };
                                        setMessages(prev => [...prev, connectedMsg]);
                                      }}
                                      onCancel={handleCancelToolSelection}
                                      onDisconnect={() => setIsTypeformConnected(false)}
                                    />
                                  )}
                                </div>
                              )}

                              {/* Auth requise */}
                              {message.requiresAuth && (
                                <div className="mt-2 text-left">
                                  <AuthCard />
                                </div>
                              )}

                              {/* Lien final après finalisation */}
                              {message.shareableLink && (
                                <div className="mt-2">
                                  <FormLinkCard
                                    link={message.shareableLink}
                                    tool={selectedTool && selectedTool !== 'internal' ? selectedTool : 'tally'}
                                  />
                                </div>
                              )}
                            </div>
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

                  {/* Input zone */}
                  <motion.div
                    className="p-4"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <form
                      onSubmit={handleSubmit}
                      className={`
                        relative flex items-end gap-2 p-2 bg-white/80 backdrop-blur-xl max-w-3xl mx-auto
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
                  </motion.div>
                </div>
              }
              right={
                /* Panel Preview */
                <motion.div
                  className="h-full bg-white/50 backdrop-blur-sm border-l border-white/40"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormPreviewModern
                    title={currentFormDefinition?.title || ''}
                    description={currentFormDefinition?.description}
                    fields={currentFormDefinition?.fields || []}
                    isGenerating={isLoading}
                    onValidate={handleFinalizeForm}
                    formLink={previewLink || undefined}
                    onClose={() => setShowPreview(false)}
                    onUpdateTitle={(title) => setCurrentFormDefinition(prev => prev ? { ...prev, title } : null)}
                    onUpdateDescription={(desc) => setCurrentFormDefinition(prev => prev ? { ...prev, description: desc } : null)}
                    onUpdateField={(id, updates) => {
                      setCurrentFormDefinition(prev => {
                        if (!prev) return null;

                        const newFields = prev.fields.map(f => f.id === id ? { ...f, ...updates } : f);
                        return { ...prev, fields: newFields };
                      });
                    }}
                    onDeleteField={(id) => {
                      setCurrentFormDefinition(prev => {
                        if (!prev) return null;
                        const newFields = prev.fields.filter(f => f.id !== id);
                        return { ...prev, fields: newFields };
                      });
                    }}
                  />
                </motion.div>
              }
            />
          ) : (
            /* Mode plein écran chat uniquement */
            <div className="flex flex-col h-full items-center">
              <div className="flex-1 overflow-y-auto px-4 space-y-4 max-w-3xl w-full scrollbar-hide py-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className={`${message.role === 'user'
                      ? 'max-w-[85%] order-2'
                      : 'w-full max-w-3xl mx-auto order-1'
                      }`}>

                      {/* Avatar + Message */}
                      <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <motion.div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-purple-600 text-white'
                            : 'bg-white text-primary border border-gray-100'
                            }`}
                        >
                          {message.role === 'user' ? <User className="w-4 h-4" /> : <span className="font-bold font-mono text-sm">F</span>}
                        </motion.div>

                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Texte du message */}
                          {message.content && (
                            <div className={`${message.role === 'user'
                              ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-md'
                              : 'bg-white/80 backdrop-blur-md border border-white/50 text-gray-900 rounded-2xl rounded-tl-sm p-5 shadow-sm'
                              }`}>
                              <div className="whitespace-pre-wrap break-words">{renderMarkdown(message.content)}</div>
                            </div>
                          )}

                          {/* Carte de prévisualisation du formulaire (inline dans le chat) */}
                          {message.formDefinition && message.role === 'assistant' && (
                            <FormPreviewCard
                              formDefinition={message.formDefinition}
                              onExpand={() => setShowPreview(true)}
                            />
                          )}

                          {/* Sélecteur d'outil */}
                          {message.requiresToolSelection && (
                            <div className="mt-2">
                              <ToolSelector onSelectTool={handleToolSelection} />
                            </div>
                          )}


                          {/* Formulaire de connexion */}
                          {message.requiresToolConnection && (
                            <div className="mt-2">
                              {message.requiresToolConnection === 'tally' && (
                                <TallyConnectionCard
                                  userId={userId}
                                  isConnected={isTallyConnected}
                                  onConnect={() => {
                                    setIsTallyConnected(true);
                                    setMessages(prev => prev.filter(m => !m.requiresToolConnection));
                                    const connectedMsg: ChatMessage = {
                                      id: Date.now().toString(),
                                      role: 'assistant',
                                      content: '✅ Parfait ! Tu es maintenant connecté à Tally.',
                                      timestamp: new Date(),
                                    };
                                    setMessages(prev => [...prev, connectedMsg]);

                                    setTimeout(() => {
                                      const nextMsg: ChatMessage = {
                                        id: (Date.now() + 1).toString(),
                                        role: 'assistant',
                                        content: 'Parfait ! Maintenant, décrivez-moi le formulaire que vous souhaitez créer.',
                                        timestamp: new Date(),
                                      };
                                      setMessages(prev => [...prev, nextMsg]);
                                    }, 300);
                                  }}
                                  onCancel={handleCancelToolSelection}
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
                                    const connectedMsg: ChatMessage = {
                                      id: Date.now().toString(),
                                      role: 'assistant',
                                      content: '✅ Parfait ! Tu es maintenant connecté à Google Forms.',
                                      timestamp: new Date(),
                                    };
                                    setMessages(prev => [...prev, connectedMsg]);

                                    setTimeout(() => {
                                      const nextMsg: ChatMessage = {
                                        id: (Date.now() + 1).toString(),
                                        role: 'assistant',
                                        content: 'Parfait ! Maintenant, décrivez-moi le formulaire que vous souhaitez créer.',
                                        timestamp: new Date(),
                                      };
                                      setMessages(prev => [...prev, nextMsg]);
                                    }, 300);
                                  }}
                                  onCancel={handleCancelToolSelection}
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
                                    const connectedMsg: ChatMessage = {
                                      id: Date.now().toString(),
                                      role: 'assistant',
                                      content: '✅ Parfait ! Tu es maintenant connecté à Typeform.',
                                      timestamp: new Date(),
                                    };
                                    setMessages(prev => [...prev, connectedMsg]);

                                    setTimeout(() => {
                                      const nextMsg: ChatMessage = {
                                        id: (Date.now() + 1).toString(),
                                        role: 'assistant',
                                        content: 'Parfait ! Maintenant, décrivez-moi le formulaire que vous souhaitez créer.',
                                        timestamp: new Date(),
                                      };
                                      setMessages(prev => [...prev, nextMsg]);
                                    }, 300);
                                  }}
                                  onCancel={handleCancelToolSelection}
                                  onDisconnect={() => setIsTypeformConnected(false)}
                                />
                              )}
                            </div>
                          )}

                          {/* Auth requise */}
                          {message.requiresAuth && (
                            <div className="mt-2 text-left">
                              <AuthCard />
                            </div>
                          )}

                          {/* Lien final après finalisation */}
                          {message.shareableLink && (
                            <div className="mt-2">
                              <FormLinkCard
                                link={message.shareableLink}
                                tool={selectedTool && selectedTool !== 'internal' ? selectedTool : 'tally'}
                              />
                            </div>
                          )}
                        </div>
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

              {/* Input zone */}
              <motion.div
                className="p-4 w-full"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <form
                  onSubmit={handleSubmit}
                  className={`
                    relative flex items-end gap-2 p-2 bg-white/80 backdrop-blur-xl max-w-3xl mx-auto
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
                    className="w-11 h-11 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-lg shadow-purple-500/25 shrink-0 mb-0.5 mr-0.5 transition-all"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
