'use client';

import { motion, AnimatePresence } from 'motion/react';
import { FormDefinition, FormField } from '@/lib/types';
import { X, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormPreviewProps {
  formDefinition: FormDefinition | null;
  onClose: () => void;
  previewLink?: string | null;
  isGenerating?: boolean;
  onFinalize?: () => void;
}

export function FormPreview({ formDefinition, onClose, previewLink, isGenerating, onFinalize }: FormPreviewProps) {
  if (!formDefinition) return null;

  const renderField = (field: FormField, index: number) => {
    return (
      <motion.div
        key={field.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-blue-500">*</span>}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </motion.span>
        </label>

        {field.type === 'textarea' ? (
          <div className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-400">{field.placeholder || 'Votre réponse...'}</p>
          </div>
        ) : field.type === 'select' ? (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-400">{field.placeholder || 'Sélectionnez une option'}</p>
            {field.options && field.options.length > 0 && (
              <div className="mt-2 space-y-1">
                {field.options.slice(0, 3).map((option, i) => (
                  <div key={i} className="text-xs text-gray-500">• {option}</div>
                ))}
                {field.options.length > 3 && (
                  <div className="text-xs text-gray-400">+ {field.options.length - 3} autres</div>
                )}
              </div>
            )}
          </div>
        ) : field.type === 'radio' || field.type === 'checkbox' ? (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-4 h-4 border-2 border-gray-300 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`} />
                <span className="text-sm text-gray-600">{option}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-400">{field.placeholder || 'Votre réponse...'}</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Prévisualisation du formulaire</h3>
          {isGenerating && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Titre et description */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-2xl font-bold text-gray-900">{formDefinition.title}</h1>
            {formDefinition.description && (
              <p className="text-gray-600">{formDefinition.description}</p>
            )}
          </motion.div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Champs du formulaire */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-6">
              {formDefinition.fields.map((field, index) => renderField(field, index))}
            </div>
          </AnimatePresence>

          {/* Bouton de soumission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: formDefinition.fields.length * 0.1 + 0.2 }}
          >
            {!previewLink ? (
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                size="lg"
                onClick={onFinalize}
                disabled={!onFinalize || isGenerating}
              >
                {isGenerating ? 'Génération en cours...' : 'Valider et obtenir le lien'}
              </Button>
            ) : (
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white" size="lg" disabled>
                ✓ Formulaire créé !
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer avec lien */}
      {previewLink && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-200 bg-blue-50"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-700 font-medium mb-1">Formulaire créé !</p>
              <p className="text-xs text-blue-600 truncate">{previewLink}</p>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 flex-shrink-0"
            >
              <a href={previewLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Ouvrir
              </a>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
