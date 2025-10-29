'use client';

import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

interface ConnectedStatusProps {
  toolName: string;
}

export function ConnectedStatus({ toolName }: ConnectedStatusProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 max-w-md"
    >
      <div className="flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Connecté à {toolName}
          </p>
          <p className="text-xs text-blue-700">
            Prêt à créer votre formulaire
          </p>
        </div>
      </div>
    </motion.div>
  );
}
