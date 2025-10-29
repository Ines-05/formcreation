'use client';

import { Card, CardContent } from '@/components/ui/card';

export type FormTool = 'tally' | 'typeform' | 'google-forms' | 'internal';

interface ToolSelectorProps {
  onSelectTool: (tool: FormTool) => void;
}

const tools = [
  {
    id: 'google-forms' as FormTool,
    name: 'Google Forms',
    description: 'Gratuit et simple d\'utilisation',
    icon: '📄',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    features: ['Formulaires simples', 'Intégration Google'],
  },
  {
    id: 'tally' as FormTool,
    name: 'Tally',
    description: 'Simple, gratuit et puissant',
    icon: '📋',
    bgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
    features: ['Formulaires simples', 'Interface moderne'],
  },
  {
    id: 'typeform' as FormTool,
    name: 'Typeform',
    description: 'Expérience interactive et engageante',
    icon: '🔶',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    features: ['Design élégant', 'Expérience utilisateur'],
  },
];

export function ToolSelector({ onSelectTool }: ToolSelectorProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 w-full">
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-1">
          Sur quelle plateforme veux-tu créer ton formulaire ?
        </h3>
        <p className="text-sm text-gray-600">
          Choisis l&apos;outil qui te convient le mieux
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all text-center group"
          >
            {/* Icône */}
            <div className={`w-14 h-14 ${tool.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              <span className={`text-2xl ${tool.iconColor}`}>{tool.icon}</span>
            </div>

            {/* Nom */}
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">{tool.name}</h4>
            
            {/* Description */}
            <p className="text-xs text-gray-600 mb-3">{tool.description}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-3">
              {tool.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Radio button placeholder */}
            <div className="flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors"></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
