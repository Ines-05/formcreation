'use client';

import { ChatMessage } from '@/lib/chat-types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <Card className={cn(
        "max-w-[80%]",
        isUser 
          ? "bg-blue-600 text-white" 
          : "bg-gray-100 text-gray-900"
      )}>
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Message content */}
            <div className="text-sm">
              {message.content}
            </div>
            
            {/* Generated UI (formulaires) */}
            {message.ui && (
              <div className="mt-3">
                {message.ui}
              </div>
            )}
            
            {/* Timestamp */}
            <div className={cn(
              "text-xs opacity-70",
              isUser ? "text-blue-100" : "text-gray-500"
            )}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}