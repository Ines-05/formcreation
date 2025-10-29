'use client';

import { FormDefinition } from '@/lib/types';
import { ChevronRight, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface FormPreviewCardProps {
  formDefinition: FormDefinition;
  onExpand: () => void;
}

export function FormPreviewCard({ formDefinition, onExpand }: FormPreviewCardProps) {
  const fieldCount = formDefinition.fields.length;
  
  return (
    <motion.button
      onClick={onExpand}
      className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 rounded-lg p-3 sm:p-4 transition-all hover:shadow-md group text-left"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Icône */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        
        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
              {formDefinition.title || 'Nouveau formulaire'}
            </h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded flex-shrink-0">
              {fieldCount} champ{fieldCount > 1 ? 's' : ''}
            </span>
          </div>
          
          {formDefinition.description && (
            <p className="text-xs sm:text-sm text-gray-600 truncate mb-2">
              {formDefinition.description}
            </p>
          )}
          
          {/* Aperçu des champs */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 flex-wrap">
            {formDefinition.fields.slice(0, 3).map((field, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span className="truncate max-w-[80px] sm:max-w-none">{field.label}</span>
              </span>
            ))}
            {fieldCount > 3 && (
              <span className="text-gray-400">+{fieldCount - 3}</span>
            )}
          </div>
        </div>
        
        {/* Flèche */}
        <div className="flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
