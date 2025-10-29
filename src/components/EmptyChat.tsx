'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PlanetBackground } from './PlanetBackground';
import { svgPaths } from '@/lib/svg-icons';

interface EmptyChatProps {
  onSubmit: (text: string) => void;
}

export function EmptyChat({ onSubmit }: EmptyChatProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden bg-[#0a0e1a]">
      {/* Arrière-plan planète */}
      <PlanetBackground />
      
      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-[800px] px-6">
        {/* Badge animé */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div 
            className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 flex items-center gap-2.5"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(29, 161, 242, 0.3)",
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="size-4 text-primary" />
            </motion.div>
            <span className="text-sm text-primary">Assistant de création de formulaires</span>
          </motion.div>
        </motion.div>

        {/* Titre principal */}
        <motion.div
          className="text-center mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-white text-5xl md:text-6xl mb-0">
            <span>Quel formulaire veux-tu </span>
            <motion.span
              className="text-primary inline-block"
              animate={{
                textShadow: [
                  "0 0 20px rgba(29, 161, 242, 0.5)",
                  "0 0 40px rgba(29, 161, 242, 0.8)",
                  "0 0 20px rgba(29, 161, 242, 0.5)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{
                scale: 1.1,
                textShadow: "0 0 60px rgba(29, 161, 242, 1)",
              }}
            >
              créer
            </motion.span>
            <span> aujourd'hui ?</span>
          </h1>
        </motion.div>

        {/* Sous-titre */}
        <motion.p
          className="text-center text-[#657786] mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Décris ton formulaire et je le créerai automatiquement pour toi
        </motion.p>

        {/* Zone de saisie style Bolt */}
        <motion.div
          className="relative mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Lueur autour de la zone de saisie */}
          <motion.div 
            className="absolute -inset-[2px] rounded-[20px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ opacity: 1 }}
          />
          
          <div className="relative bg-[#1a1f2e] rounded-[18px] border border-[#2a3441] shadow-2xl overflow-hidden group">
            {/* Barre supérieure comme un IDE */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a3441]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <div className="size-4">
                  <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                    <g clipPath="url(#clip0_input)">
                      <path d={svgPaths.p21cdc640} stroke="#1DA1F2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33247" />
                      <path d="M13.3247 1.33247V3.9974" stroke="#1DA1F2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33247" />
                      <path d="M14.6571 2.66493H11.9922" stroke="#1DA1F2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33247" />
                      <path d={svgPaths.p2c80500} stroke="#1DA1F2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33247" />
                    </g>
                    <defs>
                      <clipPath id="clip0_input">
                        <rect fill="white" height="15.9896" width="15.9896" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <span className="text-xs text-[#657786]">Nouveau formulaire</span>
              </div>
            </div>

            {/* Zone de saisie principale */}
            <div className="flex items-start gap-3 p-4">
              <motion.div
                whileHover={{ 
                  rotate: 180,
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary text-[#657786] transition-all"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </motion.div>
              
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Décris ton formulaire ici..."
                className="flex-1 border-0 shadow-none resize-none min-h-[60px] max-h-[200px] focus-visible:ring-0 text-[15px] bg-transparent text-white placeholder:text-[#657786]"
                rows={2}
              />
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="shrink-0 h-10 rounded-xl gap-2 bg-primary hover:bg-primary/90 text-white disabled:opacity-30 shadow-lg shadow-primary/20 disabled:shadow-none transition-all"
                >
                  Créer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Outils supportés */}
        <motion.div
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span className="text-xs text-[#657786]">Supporte</span>
          <div className="flex items-center gap-4">
            {['Google Forms', 'Tally', 'Typeform'].map((tool, index) => (
              <motion.div
                key={tool}
                className="px-3 py-1.5 bg-[#1a1f2e] border border-[#2a3441] rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  borderColor: 'rgba(29, 161, 242, 0.5)',
                  boxShadow: "0 0 20px rgba(29, 161, 242, 0.2)",
                }}
              >
                <span className="text-xs text-[#657786]">{tool}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
