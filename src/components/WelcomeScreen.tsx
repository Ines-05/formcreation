'use client';

import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm text-blue-600">
            <Sparkles className="w-4 h-4" />
            Assistant de création de formulaires
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Quel formulaire veux-tu{' '}
            <span className="text-blue-500">
              créer
            </span>{' '}
            aujourd'hui ?
          </h1>
          <p className="text-lg text-gray-600">
            Décris ton formulaire et je le créerai automatiquement pour toi
          </p>
        </div>

        {/* Input Area */}
        <div className="mb-8">
          <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-2 shadow-sm hover:border-blue-300 transition-colors">
            <div className="flex items-start gap-3">
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
                <Plus className="w-5 h-5 text-gray-500" />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Décris ton formulaire ici..."
                className="flex-1 bg-transparent border-0 focus:outline-none text-gray-900 placeholder:text-gray-400 py-3 text-base"
                autoFocus
              />
              
              <Button
                onClick={handleSubmit}
                disabled={!input.trim()}
                size="lg"
                className="rounded-xl shrink-0 gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6"
              >
                Créer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-sm text-gray-600 text-center mb-4">Exemples de formulaires :</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full text-sm text-gray-700 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500">
            Supporte Google Forms, Tally et Typeform
          </p>
        </div>
      </div>
    </div>
  );
}
