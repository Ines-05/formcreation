'use client';

import { FormDefinition } from '@/lib/types';
import { ChevronRight, FileText, Sparkles } from 'lucide-react';
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
      className="w-full glass-card hover:border-primary/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group text-left relative overflow-hidden"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-4 relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          <FileText className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate text-base group-hover:text-primary transition-colors">
                {formDefinition.title || 'Nouveau formulaire'}
              </h3>
              {/* Badge */}
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Generated
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="font-medium">{fieldCount} questions</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="truncate max-w-[200px]">{formDefinition.description || 'Pas de description'}</span>
          </div>

          {/* Fields Preview */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {formDefinition.fields.slice(0, 3).map((field, i) => (
              <span key={i} className="px-2 py-1 bg-secondary rounded-md text-xs text-secondary-foreground border border-gray-100">
                {field.label}
              </span>
            ))}
            {fieldCount > 3 && (
              <span className="text-xs text-gray-400 font-medium">+{fieldCount - 3} de plus</span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
