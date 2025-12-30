'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Copy, ExternalLink, Loader2, Trash2, X, Globe, Lock, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';
import { FormField } from '@/lib/types';

interface FormPreviewProps {
  title: string;
  description?: string;
  fields: FormField[];
  isGenerating: boolean;
  onValidate?: () => void;
  formLink?: string;
  onUpdateTitle?: (title: string) => void;
  onUpdateDescription?: (description: string) => void;
  onUpdateField?: (id: string, updates: Partial<FormField>) => void;
  onDeleteField?: (id: string) => void;
  onClose?: () => void;
}

export function FormPreviewModern({
  title,
  description,
  fields,
  isGenerating,
  onValidate,
  formLink,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateField,
  onDeleteField,
  onClose
}: FormPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const handleCopy = async () => {
    if (formLink) {
      try {
        await navigator.clipboard.writeText(formLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary/30 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-mesh-light opacity-60 z-0 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 px-6 py-4 border-b border-white/20 glass-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="h-8 pl-3 pr-4 bg-secondary/50 rounded-full flex items-center gap-2 text-xs text-muted-foreground border border-white/50">
            <Lock className="w-3 h-3" />
            <span>preview.formulaire.app</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-secondary/50 p-1 rounded-lg border border-white/50 flex">
            <button
              onClick={() => setActiveView('desktop')}
              className={`p-1.5 rounded-md transition-all ${activeView === 'desktop' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:bg-white/50'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('mobile')}
              className={`p-1.5 rounded-md transition-all ${activeView === 'mobile' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:bg-white/50'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className={`relative z-10 flex-1 overflow-y-auto flex flex-col items-center justify-start ${activeView === 'mobile' ? 'py-8' : 'p-0'}`}>
        <div className={`
          relative transition-all duration-500 ease-in-out flex flex-col
          ${activeView === 'mobile' ? 'w-[390px] h-[85vh] min-h-[750px] max-h-[950px] rounded-[3.5rem] border-[14px] border-gray-900 shadow-2xl' : 'w-full h-full rounded-none shadow-none'}
        `}>
          {/* Mobile Notch */}
          {activeView === 'mobile' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-2xl z-20" />
          )}

          {/* Scrollable Form Content */}
          <div className={`
            flex-1 overflow-y-auto custom-scrollbar bg-white
            ${activeView === 'mobile' ? 'rounded-[2.5rem] pt-12' : 'rounded-none border-none'}
          `}>
            {formLink ? (
              <iframe
                src={formLink}
                className="w-full h-full border-none"
                title="Form Preview"
              />
            ) : (
              <>
                {/* Banner/Header Image - African Inspired */}
                <div className="h-40 w-full relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-purple-700">
                  {/* Tribal Pattern Overlay */}
                  <div
                    className="absolute inset-0 opacity-20 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>

                <div className="p-8 space-y-8 max-w-3xl mx-auto">
                  {/* Form Header */}
                  <div className="space-y-3 relative group/header">
                    {title && (
                      <motion.div layout>
                        {editingTitle ? (
                          <Input
                            value={title}
                            onChange={(e) => onUpdateTitle?.(e.target.value)}
                            onBlur={() => setEditingTitle(false)}
                            autoFocus
                            className="text-3xl font-bold border-2 border-primary/20 focus:border-primary bg-transparent"
                          />
                        ) : (
                          <h1
                            onClick={() => setEditingTitle(true)}
                            className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors decoration-clone"
                          >
                            {title}
                          </h1>
                        )}
                      </motion.div>
                    )}

                    <motion.div layout className="relative">
                      {editingDescription ? (
                        <Textarea
                          value={description || ''}
                          onChange={(e) => onUpdateDescription?.(e.target.value)}
                          onBlur={() => setEditingDescription(false)}
                          autoFocus
                          className="text-base text-gray-600 border-2 border-primary/20 focus:border-primary bg-transparent min-h-[80px]"
                        />
                      ) : (
                        <p
                          onClick={() => setEditingDescription(true)}
                          className="text-base text-gray-600 leading-relaxed cursor-pointer hover:text-primary transition-colors pb-2 border-b-2 border-transparent hover:border-primary/10"
                        >
                          {description || 'Ajouter une description pour expliquer le but de ce formulaire...'}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Fields List */}
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {fields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                          className="group relative"
                        >
                          {/* Delete Button */}
                          {field.type !== 'section' && (
                            <div className="absolute -right-3 -top-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 scale-90 group-hover:scale-100">
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => onDeleteField?.(field.id)}
                                className="h-8 w-8 rounded-full shadow-lg ring-2 ring-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          <div className={`
                         rounded-xl border transition-all duration-300
                         ${field.type === 'section' ? 'bg-gray-50/50 border-transparent py-4' : 'bg-white border-gray-100 p-5 hover:shadow-md hover:border-primary/20'}
                      `}>
                            <div className="space-y-4">
                              {/* Label Area */}
                              <div className="space-y-1">
                                {field.type === 'section' ? (
                                  <Input
                                    value={field.label}
                                    onChange={(e) => onUpdateField?.(field.id, { label: e.target.value })}
                                    className="text-lg font-semibold bg-transparent border-none p-0 focus-visible:ring-0 text-primary"
                                  />
                                ) : (
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                      <Input
                                        value={field.label}
                                        onChange={(e) => onUpdateField?.(field.id, { label: e.target.value })}
                                        className="font-medium bg-transparent border-none p-0 focus-visible:ring-0 text-gray-900"
                                        placeholder="Votre question ici"
                                      />
                                      {field.description !== undefined && (
                                        <Input
                                          value={field.description}
                                          onChange={(e) => onUpdateField?.(field.id, { description: e.target.value })}
                                          className="text-xs text-gray-500 bg-transparent border-none p-0 focus-visible:ring-0"
                                          placeholder="Description optionnelle"
                                        />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Checkbox
                                        checked={field.required}
                                        onCheckedChange={(checked) =>
                                          onUpdateField?.(field.id, { required: checked as boolean })
                                        }
                                        id={`req-${field.id}`}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                      />
                                      <Label htmlFor={`req-${field.id}`} className="text-xs text-gray-500 cursor-pointer">Requis</Label>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Render Field Type Mockup */}
                              {field.type !== 'section' && (
                                <div className="opacity-70 pointer-events-none select-none">
                                  {field.type === 'textarea' ? (
                                    <div className="h-24 rounded-lg bg-gray-50 border border-gray-200 w-full" />
                                  ) : field.type === 'radio' ? (
                                    <div className="space-y-2">
                                      {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded-full border border-gray-300" />
                                          <span className="text-sm text-gray-500">{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : field.type === 'checkbox' ? (
                                    <div className="space-y-2">
                                      {(field.options || ['Choix 1', 'Choix 2']).map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded-md border border-gray-300" />
                                          <span className="text-sm text-gray-500">{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-10 rounded-lg bg-gray-50 border border-gray-200 w-full" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {fields.length === 0 && !isGenerating && (
                      <div className="text-center py-12 text-gray-400 italic">
                        <p>Le formulaire est vide pour le moment...</p>
                      </div>
                    )}

                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center py-8"
                      >
                        <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-4 py-2 rounded-full">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">L'IA rédige vos questions...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Action Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="relative z-20 p-4 bg-white/80 backdrop-blur-md border-t border-white/20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] flex justify-center gap-4"
      >
        {!formLink ? (
          <Button
            onClick={onValidate}
            size="lg"
            className="w-full max-w-md bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 rounded-xl h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={isGenerating || fields.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Construction en cours...
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 h-5 w-5 animate-pulse" />
                Valider et Créer le Formulaire
              </>
            )}
          </Button>
        ) : (
          <div className="w-full max-w-2xl bg-green-50/50 border border-green-100 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex-1 flex gap-2 w-full">
              <Input
                value={formLink}
                readOnly
                className="bg-white border-green-200 text-green-800 font-mono text-sm h-11"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="h-11 w-11 shrink-0 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
              >
                {copied ? '✓' : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => window.open(formLink, '_blank')}
                className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white shrink-0 shadow-lg shadow-green-600/20"
              >
                Ouvrir <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
