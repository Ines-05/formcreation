'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TypeformConnectProps {
  userId: string;
  onConnected?: () => void;
  onCancel?: () => void;
}

export function TypeformConnect({ userId, onConnected, onCancel }: TypeformConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    setIsConnecting(true);

    try {
      // Rediriger vers le flux OAuth Typeform
      const response = await fetch('/api/auth/typeform/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.authUrl) {
        // Ouvrir la fenêtre OAuth dans une popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          data.authUrl,
          'Typeform OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Écouter la fermeture de la popup
        const checkPopup = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            // Vérifier si la connexion a réussi
            checkConnection();
          }
        }, 500);
      }
    } catch (err) {
      console.error('Error connecting Typeform:', err);
      setError('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setIsConnecting(false);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch(`/api/auth/typeform/status?userId=${userId}`);
      const data = await response.json();
      
      if (data.isConnected) {
        onConnected?.();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          Connexion avec Typeform
        </h4>
        <ol className="text-sm space-y-1 text-gray-700 list-decimal list-inside">
          <li>Cliquez sur le bouton &quot;Se connecter avec Typeform&quot;</li>
          <li>Autorisez l&apos;accès à votre compte Typeform</li>
          <li>Acceptez les permissions pour créer des formulaires</li>
          <li>Vous serez automatiquement redirigé</li>
        </ol>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Connexion en cours...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
              <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
            </svg>
            Se connecter avec Typeform
          </>
        )}
      </Button>

      <div className="flex gap-2">
        <Button
          onClick={() => onCancel?.()}
          variant="outline"
          disabled={isConnecting}
          className="w-full"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}

interface TypeformConnectionCardProps {
  userId: string;
  isConnected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onCancel?: () => void;
}

export function TypeformConnectionCard({
  userId,
  isConnected,
  onConnect,
  onDisconnect,
  onCancel,
}: TypeformConnectionCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
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

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte Typeform ?')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/auth/typeform/disconnect', {
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
        <CardTitle className="flex items-center gap-2">
          {isNowConnected ? '✅' : '🔗'} Compte Typeform
        </CardTitle>
        <CardDescription>
          {isNowConnected
            ? 'Votre compte Typeform est connecté. Les formulaires seront créés dans votre compte.'
            : 'Connectez votre compte Typeform pour créer des formulaires dans votre espace.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isNowConnected ? (
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
          <TypeformConnect userId={userId} onConnected={handleLocalConnect} onCancel={onCancel} />
        )}
      </CardContent>
    </Card>
  );
}
