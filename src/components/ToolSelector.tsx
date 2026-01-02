'use client';


import Image from 'next/image';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export type FormTool = 'tally' | 'typeform' | 'google-forms' | 'internal';

interface ToolSelectorProps {
  onSelectTool: (tool: FormTool) => void;
  title?: string;
  description?: string;
}

const tools = [
  {
    id: 'google-forms' as FormTool,
    name: 'Google Forms',
    description: 'Gratuit et simple d\'utilisation',
    logo: '/googeform.png',
    features: ['Formulaires simples', 'Intégration Google'],
  },
  {
    id: 'tally' as FormTool,
    name: 'Tally',
    description: 'Simple, gratuit et puissant',
    logo: '/logo_v2.png',
    features: ['Formulaires simples', 'Interface moderne'],
  },
  {
    id: 'typeform' as FormTool,
    name: 'Typeform',
    description: 'Expérience interactive et engageante',
    logo: '/typeformlogo.jpg',
    features: ['Design élégant', 'Expérience utilisateur'],
  },
];

export function ToolSelector({
  onSelectTool,
  title = "Sur quelle plateforme veux-tu créer ton formulaire ?",
  description = "Choisis l'outil qui te convient le mieux"
}: ToolSelectorProps) {
  return (
    <div className="glass-card p-6 w-full relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {tools.map((tool, index) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectTool(tool.id)}
            className="group relative bg-white/50 hover:bg-white border text-left border-white/60 hover:border-primary/50 text-foreground rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="relative w-8 h-8">
                    <Image
                      src={tool.logo}
                      alt={`${tool.name} logo`}
                      fill
                      className="object-contain"
                      sizes="32px"
                    />
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-primary group-hover:bg-primary text-white flex items-center justify-center transition-colors">
                  <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{tool.name}</h4>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{tool.description}</p>
              </div>

              {/* Footer/Features */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100/50">
                {tool.features.map((feature, i) => (
                  <span key={i} className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
