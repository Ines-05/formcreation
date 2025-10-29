'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Copy, ExternalLink, Loader2, Trash2, X } from 'lucide-react';
import { useState } from 'react';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'radio' | 'checkbox' | 'section';
  label: string;
  description?: string;
  required?: boolean;
  options?: string[];
}

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
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const handleCopy = async () => {
    if (formLink) {
      try {
        await navigator.clipboard.writeText(formLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = formLink;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr) {
          console.error('Failed to copy:', fallbackErr);
        }
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary">
      {/* Header - Style Twitter */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">Prévisualisation du formulaire</span>
          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Génération...</span>
            </div>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-secondary p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-border">
            <div className="p-8">
              <div className="space-y-6">
                {/* Titre éditable */}
                {title && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    {editingTitle ? (
                      <Input
                        value={title}
                        onChange={(e) => onUpdateTitle?.(e.target.value)}
                        onBlur={() => setEditingTitle(false)}
                        autoFocus
                        className="text-2xl font-bold border-2 border-primary"
                      />
                    ) : (
                      <h1 
                        className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setEditingTitle(true)}
                      >
                        {title}
                      </h1>
                    )}
                    
                    {editingDescription ? (
                      <Textarea
                        value={description || ''}
                        onChange={(e) => onUpdateDescription?.(e.target.value)}
                        onBlur={() => setEditingDescription(false)}
                        autoFocus
                        className="border-2 border-primary"
                        rows={2}
                      />
                    ) : (
                      <p 
                        className="text-gray-600 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setEditingDescription(true)}
                      >
                        {description || 'Cliquez pour ajouter une description'}
                      </p>
                    )}
                  </motion.div>
                )}

                <AnimatePresence>
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="space-y-2 group relative"
                    >
                      {field.type !== 'section' && (
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteField?.(field.id)}
                            className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {field.type === 'section' ? (
                        <div className="pt-4 pb-2 border-b border-gray-200">
                          <Input
                            value={field.label}
                            onChange={(e) => onUpdateField?.(field.id, { label: e.target.value })}
                            className="text-xl font-bold border-none p-0 focus-visible:ring-0"
                          />
                          {field.description && (
                            <Input
                              value={field.description}
                              onChange={(e) => onUpdateField?.(field.id, { description: e.target.value })}
                              className="text-sm text-gray-600 border-none p-0 focus-visible:ring-0 mt-1"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <Input
                                value={field.label}
                                onChange={(e) => onUpdateField?.(field.id, { label: e.target.value })}
                                className="flex-1 border-none p-0 focus-visible:ring-0 font-medium"
                                placeholder="Question"
                              />
                              <Checkbox
                                checked={field.required}
                                onCheckedChange={(checked) => 
                                  onUpdateField?.(field.id, { required: checked as boolean })
                                }
                                id={`required-${field.id}`}
                              />
                              <Label 
                                htmlFor={`required-${field.id}`}
                                className="text-sm text-gray-600 whitespace-nowrap"
                              >
                                Requis
                              </Label>
                            </div>
                            
                            {field.description !== undefined && (
                              <Input
                                value={field.description}
                                onChange={(e) => onUpdateField?.(field.id, { description: e.target.value })}
                                className="text-sm text-gray-500 border-none p-0 focus-visible:ring-0"
                                placeholder="Description (optionnelle)"
                              />
                            )}
                            
                            {field.type === 'text' || field.type === 'email' ? (
                              <Input 
                                type={field.type} 
                                placeholder={`Votre ${field.label.toLowerCase()}`}
                                disabled
                                className="bg-gray-50"
                              />
                            ) : field.type === 'textarea' ? (
                              <Textarea 
                                placeholder={`Votre réponse`}
                                disabled
                                rows={3}
                                className="bg-gray-50"
                              />
                            ) : field.type === 'radio' && field.options ? (
                              <RadioGroup disabled>
                                <div className="space-y-2">
                                  {field.options.map((option, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <RadioGroupItem value={option} id={`${field.id}-${i}`} disabled />
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...(field.options || [])];
                                          newOptions[i] = e.target.value;
                                          onUpdateField?.(field.id, { options: newOptions });
                                        }}
                                        className="flex-1 border-none p-0 focus-visible:ring-0 text-sm"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>
                            ) : field.type === 'checkbox' && field.options ? (
                              <div className="space-y-2">
                                {field.options.map((option, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <Checkbox id={`${field.id}-${i}`} disabled />
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(field.options || [])];
                                        newOptions[i] = e.target.value;
                                        onUpdateField?.(field.id, { options: newOptions });
                                      }}
                                      className="flex-1 border-none p-0 focus-visible:ring-0 text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer avec bouton de validation */}
      {!formLink && (
        <div className="p-4 border-t border-border bg-white">
          <Button 
            onClick={onValidate} 
            className="w-full"
            disabled={isGenerating || fields.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              'Valider et obtenir le lien'
            )}
          </Button>
        </div>
      )}

      {/* Lien de partage */}
      {formLink && (
        <div className="p-4 border-t border-border bg-white">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">✅ Formulaire créé avec succès !</p>
            <div className="flex gap-2">
              <Input
                value={formLink}
                readOnly
                className="flex-1 font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? '✓' : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(formLink, '_blank')}
                className="shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
