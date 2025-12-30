'use client';

import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, LayoutDashboard, Eye, EyeOff, X } from 'lucide-react';
import { FormDefinition } from '@/lib/types';
import { ToolSelector, FormTool } from '@/components/ToolSelector';
import { GoogleFormsConnectionCard } from '@/components/GoogleFormsConnect';
import { TypeformConnectionCard } from '@/components/TypeformConnect';
import { TallyConnectionCard } from '@/components/ConnectTally';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ConnectedStatus } from '@/components/ConnectedStatus';
import { FormPreviewModern } from '@/components/FormPreviewModern';
import { FormPreviewCard } from '@/components/FormPreviewCard';
import { FormLinkCard } from '@/components/FormLinkCard';
import { ResizablePanels } from '@/components/ResizablePanels';
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
    const parts: any[] = [];
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
    const elements: any[] = [];
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

  // Fonctions helper pour détection d'outil
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
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages([userMessage]);
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

      const data = await response.json();

      if (data.shouldStartFormCreation) {
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
      } else {
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

        const data = await response.json();

        if (data.shouldStartFormCreation || data.detectedTool) {
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // À la fin du streaming, parser le JSON si présent
            if (formJson) {
              try {
                // Nettoyer le JSON : enlever les espaces/sauts de ligne avant/après
                let cleanedJson = formJson.trim();

                // Si le JSON est suivi de texte, extraire uniquement l'objet JSON
                // Trouver le premier { et le dernier } correspondant
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

                // Mettre à jour le message avec le formDefinition
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, formDefinition: formDef }
                    : msg
                ));
              } catch (e) {
                console.error('Erreur parsing form:', e, 'JSON reçu:', formJson);
              }
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Séparer le texte du message et le JSON du formulaire
          const formMatch = accumulatedText.match(/FORM_UPDATE:([\s\S]*)/);

          if (formMatch) {
            // Extraire le texte avant FORM_UPDATE
            messageText = accumulatedText.split('FORM_UPDATE:')[0].trim();
            // Accumuler le JSON (peut être incomplet pendant le streaming)
            formJson = formMatch[1];
          } else {
            // Pas encore de FORM_UPDATE, tout est du texte
            messageText = accumulatedText;
          }

          // Mettre à jour le message de l'assistant (sans le JSON)
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: messageText }
              : msg
          ));
        }
      }

    } catch (error) {
      console.error('Erreur streaming:', error);
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
      content: `Excellent choix ! Tu as sélectionné ${toolName}. Connecte-toi pour commencer.`,
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
        content: ``,
        timestamp: new Date(),
        requiresToolConnection: tool,
      };
      setMessages(prev => [...prev, connectMsg]);
    }
  };

  const handleFinalizeForm = async () => {
    if (!currentFormDefinition) return;

    setIsLoading(true);

    try {
      let finalLink = '';

      // Créer le formulaire selon l'outil sélectionné
      if (selectedTool === 'typeform') {
        // Créer sur Typeform
        const response = await fetch('/api/typeform/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            formDefinition: currentFormDefinition,
          }),
        });

        const data = await response.json();
        if (data.success) {
          finalLink = data.formUrl;
        } else {
          throw new Error(data.error || 'Erreur lors de la création sur Typeform');
        }

      } else if (selectedTool === 'google-forms') {
        // Créer sur Google Forms
        const response = await fetch('/api/google-forms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            formDefinition: currentFormDefinition,
          }),
        });

        const data = await response.json();
        if (data.success) {
          finalLink = data.responderUri || data.shareableLink;
        } else {
          throw new Error(data.error || 'Erreur lors de la création sur Google Forms');
        }

      } else if (selectedTool === 'tally') {
        // Créer sur Tally
        const response = await fetch('/api/tally/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            formDefinition: currentFormDefinition,
          }),
        });

        const data = await response.json();
        if (data.success) {
          finalLink = data.shareableLink;
        } else {
          throw new Error(data.error || 'Erreur lors de la création sur Tally');
        }

      } else {
        // Créer localement (fallback)
        const response = await fetch('/api/forms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formDefinition: currentFormDefinition,
            title: currentFormDefinition.title,
            description: currentFormDefinition.description,
          }),
        });

        const data = await response.json();
        if (data.success) {
          finalLink = data.shortLink || data.shareableLink;
        } else {
          throw new Error(data.error || 'Erreur lors de la création');
        }
      }

      // Mettre à jour le lien de preview
      setPreviewLink(finalLink);

      // Message de succès
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
    <div className="h-screen bg-gradient-mesh-light flex flex-col">

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

          {/* Bouton Tableau de bord */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/dashboard'}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
          </Button>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          /* Mode split avec panels redimensionnables */
          <ResizablePanels
            defaultSize={50}
            minSize={30}
            maxSize={70}
            left={
              /* Panel Chat */
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 max-w-3xl mx-auto w-full">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`${message.role === 'user'
                        ? 'max-w-[85%] order-2'
                        : 'w-full max-w-3xl mx-auto order-1'
                        }`}>

                        {/* Avatar + Message */}
                        <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <motion.div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-500 text-white'
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {message.role === 'user' ? '👤' : '🤖'}
                          </motion.div>

                          <div className="flex-1 min-w-0 space-y-3">
                            {/* Texte du message */}
                            {message.content && (
                              <div className={`${message.role === 'user'
                                ? 'bg-blue-500 text-white rounded-lg p-4'
                                : 'text-gray-900'
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
                              <ToolSelector onSelectTool={handleToolSelection} />
                            )}

                            {/* Formulaire de connexion */}
                            {message.requiresToolConnection && (
                              <>
                                {message.requiresToolConnection === 'tally' && (
                                  <TallyConnectionCard
                                    userId={userId}
                                    isConnected={isTallyConnected}
                                    onConnect={() => {
                                      setIsTallyConnected(true);
                                      setMessages(prev => prev.filter(m => !m.requiresToolConnection));

                                      // Simple statut de connexion
                                      const connectedMsg: ChatMessage = {
                                        id: Date.now().toString(),
                                        role: 'assistant',
                                        content: '✅ Parfait ! Tu es maintenant connecté à Tally. Décris-moi le formulaire que tu souhaites créer.',
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
                                        content: '✅ Parfait ! Tu es maintenant connecté à Google Forms. Décris-moi le formulaire que tu souhaites créer.',
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
                                        content: '✅ Parfait ! Tu es maintenant connecté à Typeform. Décris-moi le formulaire que tu souhaites créer.',
                                        timestamp: new Date(),
                                      };
                                      setMessages(prev => [...prev, connectedMsg]);
                                    }}
                                    onCancel={handleCancelToolSelection}
                                    onDisconnect={() => setIsTypeformConnected(false)}
                                  />
                                )}
                              </>
                            )}

                            {/* Lien final après finalisation */}
                            {message.shareableLink && (
                              <FormLinkCard
                                link={message.shareableLink}
                                tool={selectedTool && selectedTool !== 'internal' ? selectedTool : 'tally'}
                              />
                            )}
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
            }
            right={
              /* Panel Preview */
              <motion.div
                className="h-full"
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
                      // @ts-ignore
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
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`${message.role === 'user'
                    ? 'max-w-[80%] order-2'
                    : 'w-full max-w-3xl mx-auto order-1'
                    }`}>

                    {/* Avatar + Message */}
                    <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500 text-white'
                          }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {message.role === 'user' ? '👤' : '🤖'}
                      </motion.div>

                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Texte du message */}
                        {message.content && (
                          <div className={`${message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-lg p-4'
                            : 'text-gray-900'
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
                          <ToolSelector onSelectTool={handleToolSelection} />
                        )}

                        {/* Formulaire de connexion */}
                        {message.requiresToolConnection && (
                          <>
                            {message.requiresToolConnection === 'tally' && (
                              <TallyConnectionCard
                                userId={userId}
                                isConnected={isTallyConnected}
                                onConnect={() => {
                                  setIsTallyConnected(true);
                                  setMessages(prev => prev.filter(m => !m.requiresToolConnection));

                                  // Simple statut de connexion
                                  const statusMsg: ChatMessage = {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: 'Connecté à Tally',
                                    timestamp: new Date(),
                                  };
                                  setMessages(prev => [...prev, statusMsg]);

                                  // Message pour créer le formulaire
                                  setTimeout(() => {
                                    const nextMsg: ChatMessage = {
                                      id: (Date.now() + 1).toString(),
                                      role: 'assistant',
                                      content: 'Parfait ! Maintenant, décrivez-moi le formulaire que vous souhaitez créer. Par exemple : "un formulaire de contact" ou "un sondage de satisfaction client".',
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

                                  // Simple statut de connexion
                                  const statusMsg: ChatMessage = {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: 'Connecté à Google Forms',
                                    timestamp: new Date(),
                                  };
                                  setMessages(prev => [...prev, statusMsg]);

                                  // Message pour créer le formulaire
                                  setTimeout(() => {
                                    const nextMsg: ChatMessage = {
                                      id: (Date.now() + 1).toString(),
                                      role: 'assistant',
                                      content: 'Parfait ! Maintenant, décrivez-moi le formulaire que vous souhaitez créer. Par exemple : "un formulaire de contact" ou "un sondage de satisfaction client".',
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

                                  // Simple statut de connexion
                                  const statusMsg: ChatMessage = {
                                    id: Date.now().toString(),
                                    role: 'assistant',
                                    content: 'Connecté à Typeform',
                                    timestamp: new Date(),
                                  };
                                  setMessages(prev => [...prev, statusMsg]);

                                  // Message pour créer le formulaire
                                  setTimeout(() => {
                                    const nextMsg: ChatMessage = {
                                      id: (Date.now() + 1).toString(),
                                      role: 'assistant',
                                      content: 'Parfait ! Maintenant, décrivez-moi le formulaire que vous souhaitez créer. Par exemple : "un formulaire de contact" ou "un sondage de satisfaction client".',
                                      timestamp: new Date(),
                                    };
                                    setMessages(prev => [...prev, nextMsg]);
                                  }, 300);
                                }}
                                onCancel={handleCancelToolSelection}
                                onDisconnect={() => setIsTypeformConnected(false)}
                              />
                            )}
                          </>
                        )}

                        {/* Lien final après finalisation */}
                        {message.shareableLink && (
                          <FormLinkCard
                            link={message.shareableLink}
                            tool={selectedTool && selectedTool !== 'internal' ? selectedTool : 'tally'}
                          />
                        )}
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
        )}
      </div>
    </div>
  );
}
