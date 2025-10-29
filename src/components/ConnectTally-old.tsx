'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, ExternalLink } from 'lucide-react';

interface ConnectTallyFormProps {
  userId: string;
  onConnected?: () => void;
}

export function ConnectTallyForm({ userId, onConnected }: ConnectTallyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState('');

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
      onConnected?.();
    } catch (err) {
      console.error('Error connecting Tally:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showInput ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={() => setShowInput(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            size="lg"
          >
            <Key className="mr-2 h-4 w-4" />
            Se connecter avec une clé API
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div>
            <Label htmlFor="tallyApiKey" className="text-sm font-medium">Entrez votre clé API Tally</Label>
            <Input
              id="tallyApiKey"
              type="password"
              placeholder="tly-xxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isConnecting}
              className="mt-1"
              autoFocus
            />
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 mt-1"
              >
                {error}
              </motion.p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleConnect}
              disabled={!apiKey || isConnecting}
              className="flex-1"
            >
              {isConnecting ? '🔄 Connexion...' : '✅ Connecter'}
            </Button>
            <Button
              onClick={() => {
                setShowInput(false);
                setApiKey('');
                setError('');
              }}
              variant="outline"
              disabled={isConnecting}
            >
              Annuler
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface TallyConnectionCardProps {
  userId: string;
  isConnected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function TallyConnectionCard({
  userId,
  isConnected,
  onConnect,
  onDisconnect,
}: TallyConnectionCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState('');

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
      onConnect?.();
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
        onDisconnect?.();
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
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {isConnected ? '✅' : '�'} Connexion Tally
          </CardTitle>
          <CardDescription>
            {isConnected
              ? 'Votre clé API Tally est active. Les formulaires seront créés dans votre compte.'
              : 'Connectez-vous à Tally avec votre clé API pour créer des formulaires.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="p-3 bg-green-100 border-2 border-green-300 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  ✅ Connecté avec succès à Tally
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                {isDisconnecting ? 'Déconnexion...' : 'Déconnecter'}
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div 
                className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Comment obtenir votre clé API Tally :
                </h4>
                <ol className="text-sm space-y-2 text-gray-700 list-decimal list-inside">
                  <li>
                    Allez sur{' '}
                    <a 
                      href="https://tally.so" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      tally.so
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Cliquez sur votre avatar → <strong>"Settings"</strong></li>
                  <li>Allez dans <strong>"API keys"</strong></li>
                  <li>Cliquez <strong>"Create API key"</strong></li>
                  <li>Copiez la clé et utilisez le bouton ci-dessous</li>
                </ol>
              </motion.div>
              
              <ConnectTallyForm userId={userId} onConnected={onConnect} />
              
              <motion.div 
                className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-green-800">
                  <strong>🔒 Sécurisé :</strong> Votre clé API est chiffrée et stockée en toute sécurité
                </p>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
