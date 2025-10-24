'use client';

import { Card, CardContent } from '@/components/ui/card';

export type FormTool = 'tally' | 'typeform' | 'google-forms' | 'internal';

interface ToolSelectorProps {
  onSelectTool: (tool: FormTool) => void;
}

const tools = [
  {
    id: 'tally' as FormTool,
    name: 'Tally',
    description: 'Simple, gratuit et puissant',
    gradient: 'from-purple-500 to-pink-500',
    hoverBorder: 'hover:border-purple-500',
    emoji: '📝',
    features: ['Formulaires illimités', 'Interface moderne', 'Export facile'],
  },
  {
    id: 'typeform' as FormTool,
    name: 'Typeform',
    description: 'Expérience interactive et engageante',
    gradient: 'from-slate-700 to-slate-900',
    hoverBorder: 'hover:border-slate-700',
    emoji: '✨',
    features: ['Design élégant', 'Expérience utilisateur', 'Logique avancée'],
  },
  {
    id: 'google-forms' as FormTool,
    name: 'Google Forms',
    description: 'Intégré à Google Workspace',
    gradient: 'from-blue-500 to-green-500',
    hoverBorder: 'hover:border-blue-500',
    emoji: '📊',
    features: ['Google Drive', 'Collaboration', 'Gratuit'],
  },
  {
    id: 'internal' as FormTool,
    name: 'Hébergé sur mon app',
    description: 'Formulaire intégré directement ici',
    gradient: 'from-indigo-500 to-purple-500',
    hoverBorder: 'hover:border-indigo-500',
    emoji: '🏠',
    features: ['Pas de compte externe', 'Hébergé ici', 'Simple'],
  },
];

export function ToolSelector({ onSelectTool }: ToolSelectorProps) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Sur quelle plateforme veux-tu créer ton formulaire ?</h3>
        <p className="text-sm text-gray-600">
          Choisis l&apos;outil qui te convient le mieux
        </p>
      </div>

      <div className="space-y-3">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-all border-2 ${tool.hoverBorder} hover:shadow-lg group`}
            onClick={() => onSelectTool(tool.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Logo/Icône */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{tool.emoji}</span>
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{tool.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Flèche */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          💡 Tu pourras changer d&apos;outil plus tard si besoin
        </p>
      </div>
    </div>
  );
}
