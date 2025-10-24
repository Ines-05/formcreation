'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConnectTallyFormProps {
  userId: string;
  onConnected?: () => void;
}

export function ConnectTallyForm({ userId, onConnected }: ConnectTallyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
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
        setError(data.error || 'Failed to connect Tally API Key');
        return;
      }

      console.log('✅ Tally connected successfully');
      setApiKey('');
      onConnected?.();
    } catch (err) {
      console.error('Error connecting Tally:', err);
      setError('Failed to connect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tallyApiKey">Tally API Key</Label>
        <Input
          id="tallyApiKey"
          type="password"
          placeholder="tly-xxxxxxxxxxxxxxxxxxxxxx"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isConnecting}
          className="mt-1"
        />
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
      <Button
        onClick={handleConnect}
        disabled={!apiKey || isConnecting}
        className="w-full"
      >
        {isConnecting ? '🔄 Connexion...' : '🔗 Connecter mon compte Tally'}
      </Button>
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? '✅' : '🔗'} Compte Tally
        </CardTitle>
        <CardDescription>
          {isConnected
            ? 'Votre compte Tally est connecté. Les formulaires seront créés dans votre compte.'
            : 'Connectez votre compte Tally pour créer des formulaires dans votre propre espace.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Connecté avec succès
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
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Comment obtenir votre API Key Tally :</h4>
              <ol className="text-sm space-y-1 text-gray-700 list-decimal list-inside">
                <li>Allez sur <a href="https://tally.so" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">tally.so</a></li>
                <li>Cliquez sur votre avatar → "Settings"</li>
                <li>Allez dans "API keys"</li>
                <li>Cliquez "Create API key"</li>
                <li>Copiez la clé et collez-la ci-dessous</li>
              </ol>
            </div>
            <ConnectTallyForm userId={userId} onConnected={onConnect} />
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-800">
                ✅ Les formulaires seront créés dans votre compte Tally personnel
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
