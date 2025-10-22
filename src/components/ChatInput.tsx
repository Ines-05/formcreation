'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-white">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Décrivez le formulaire que vous souhaitez créer..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={!input.trim() || isLoading}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}