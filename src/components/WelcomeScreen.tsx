'use client';

import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ArrowRight, Plus, Sparkles, LayoutDashboard, Command } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface WelcomeScreenProps {
  onSubmit: (description: string) => void;
}

export function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
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

  const suggestions = [
    "Un formulaire de contact avec nom, email et message",
    "Un sondage de satisfaction client",
    "Un formulaire d'inscription à un événement"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-mesh-light p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="flex justify-end mb-8">
          <Button
            variant="outline"
            className="rounded-full gap-2 bg-white/80 hover:bg-white text-gray-700 hover:text-primary border-white/60 shadow-sm backdrop-blur-md transition-all"
            onClick={() => window.location.href = '/dashboard'}
          >
            <LayoutDashboard className="w-4 h-4" />
            Tableau de bord
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-sm font-medium text-primary shadow-lg shadow-primary/5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Assistant IA Génératif v2.0</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
            Créez des formulaires <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-glow">
              intelligents
            </span> en secondes.
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Dites simplement ce dont vous avez besoin. L'IA génère la structure, les questions et le design pour Typeform, Google Forms ou Tally.
          </p>
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-2 shadow-2xl hover:shadow-primary/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                  <Command className="w-6 h-6" />
                </div>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Décris ton formulaire (ex: inscription webinar, sondage satisfaction)..."
                  className="flex-1 bg-transparent border-0 focus:outline-none text-gray-900 placeholder:text-gray-400 py-4 text-lg font-medium"
                  autoFocus
                />

                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  size="lg"
                  className={`
                    rounded-xl shrink-0 gap-2 h-14 px-8 text-base font-semibold transition-all duration-300
                    ${input.trim()
                      ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg hover:shadow-primary/30 hover:scale-105'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  Générer
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm font-medium text-gray-500 text-center mb-4 uppercase tracking-wider">Essayez avec :</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className="px-5 py-2.5 bg-white/60 backdrop-blur-sm hover:bg-white border border-white/40 hover:border-primary/30 rounded-full text-sm font-medium text-gray-600 hover:text-primary transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
        >
          {/* Logos placeholders opacity-50 */}
          <div className="text-xs font-semibold text-gray-400">Compatible avec</div>
          <div className="flex gap-4">
            <span className="text-gray-500 font-bold">Google Forms</span>
            <span className="text-gray-500 font-bold">Typeform</span>
            <span className="text-gray-500 font-bold">Tally</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
