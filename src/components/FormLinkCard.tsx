'use client';

import { CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { useState } from 'react';

interface FormLinkCardProps {
  link: string;
  tool?: 'tally' | 'google-forms' | 'typeform';
}

export function FormLinkCard({ link, tool = 'tally' }: FormLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getToolName = () => {
    switch (tool) {
      case 'google-forms': return 'Google Forms';
      case 'typeform': return 'Typeform';
      case 'tally': return 'Tally';
      default: return 'l\'outil';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm"
    >
      {/* Header avec icône de succès */}
      <div className="flex items-start sm:items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-blue-900 text-base sm:text-lg">Formulaire créé avec succès !</h3>
          <p className="text-xs sm:text-sm text-blue-700">Votre formulaire est maintenant en ligne</p>
        </div>
      </div>

      {/* Lien */}
      <div className="bg-white rounded-lg border border-blue-200 p-3 sm:p-4 mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium">Lien de partage :</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 min-w-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs sm:text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 flex-shrink-0 ${copied ? 'bg-blue-100 border-blue-300' : ''}`}
          >
            <Copy className="w-4 h-4" />
            <span className="text-xs sm:text-sm">{copied ? 'Copié !' : 'Copier'}</span>
          </Button>
        </div>
      </div>

      {/* Bouton d'ouverture */}
      <Button
        asChild
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="truncate">Ouvrir dans {getToolName()}</span>
        </a>
      </Button>

      {/* Message d'encouragement */}
      <p className="text-xs text-blue-700 text-center mt-3">
        Partagez ce lien pour commencer à collecter des réponses ! 📊
      </p>
    </motion.div>
  );
}
