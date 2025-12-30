'use client';

import { CheckCircle, ExternalLink, Copy, PartyPopper } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl shadow-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-90 blur-sm" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

      <div className="relative p-6 sm:p-8 backdrop-blur-md bg-white/10 text-white">
        {/* Header avec icône de succès */}
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner ring-4 ring-white/10 animate-pulse">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-2xl mb-1">C'est prêt ! 🎉</h3>
            <p className="text-emerald-100 text-sm">Votre formulaire {getToolName()} est en ligne.</p>
          </div>
        </div>

        {/* Lien */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/20 mb-6 backdrop-blur-md">
          <p className="text-xs text-emerald-100 mb-2 font-medium uppercase tracking-wider opacity-80">Lien de partage</p>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                value={link}
                readOnly
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCopy}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-none shadow-none"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copié !' : 'Copier'}
              </Button>
              <Button
                asChild
                className="flex-[2] bg-white text-emerald-600 hover:bg-emerald-50 font-semibold shadow-lg"
                size="sm"
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ouvrir le formulaire
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Message d'encouragement */}
        <p className="text-xs text-emerald-100/70 text-center">
          Envoyez ce lien à votre audience pour collecter des réponses.
        </p>
      </div>
    </motion.div>
  );
}
