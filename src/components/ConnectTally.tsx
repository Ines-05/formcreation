'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TallyConnectionCardProps {
  userId: string;
  isConnected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onCancel?: () => void;
}

export function TallyConnectionCard({
  userId,
  isConnected,
  onConnect,
  onDisconnect,
  onCancel,
}: TallyConnectionCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState('');
  const [isNowConnected, setIsNowConnected] = useState(isConnected);

  const handleLocalConnect = () => {
    setIsNowConnected(true);
    if (onConnect) {
      onConnect();
    }
  };

  const handleLocalDisconnect = () => {
    setIsNowConnected(false);
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const handleConnect = async () => {
    setError('');
    setIsConnecting(true);

    try {
      const response = await fetch('/api/user/tally/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Clé API invalide. Veuillez vérifier votre clé.');
        return;
      }

      console.log('✅ Tally connected successfully');
      setApiKey('');
      handleLocalConnect();
    } catch (err) {
      console.error('Error connecting Tally:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte Tally ?')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/user/tally/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        handleLocalDisconnect();
      } else {
        alert('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Erreur lors de la déconnexion');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg border-gray-200 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Connexion à Tally</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {isNowConnected 
            ? 'Votre compte Tally est connecté.'
            : 'Pour obtenir votre clé API Tally, suivez ces étapes :'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isNowConnected ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Connecté avec succès à Tally
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full"
            >
              {isDisconnecting ? 'Déconnexion...' : 'Déconnecter'}
            </Button>
          </div>
        ) : !showInput ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-700 space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>Connectez-vous à votre compte <a href="https://tally.so" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Tally</a></li>
                <li>Allez dans les <strong>Settings</strong></li>
                <li>Accédez à la section <strong>API keys</strong></li>
                <li>Cliquez sur <strong>Create API key</strong></li>
                <li>Copiez la clé générée et revenez ici pour la coller</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowInput(true)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                size="lg"
              >
                Entrer ma clé API
              </Button>
              <Button
                onClick={() => onCancel?.()}
                variant="outline"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div>
              <Input
                id="tallyApiKey"
                type="text"
                placeholder="Entrer votre clé API pour l'authentification"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnecting}
                className="w-full"
                autoFocus
              />
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleConnect}
                disabled={!apiKey || isConnecting}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                {isConnecting ? 'Connexion...' : 'Connecter'}
              </Button>
              <Button
                onClick={() => {
                  setShowInput(false);
                  setApiKey('');
                  setError('');
                  onCancel?.();
                }}
                variant="outline"
                disabled={isConnecting}
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
