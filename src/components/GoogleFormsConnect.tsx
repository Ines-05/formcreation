'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GoogleFormsConnectProps {
  userId: string;
  onConnected?: () => void;
  onCancel?: () => void;
}

export function GoogleFormsConnect({ userId, onConnected, onCancel }: GoogleFormsConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    setIsConnecting(true);

    try {
      // Rediriger vers le flux OAuth Google
      const response = await fetch('/api/auth/google/authorize', {
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
          'Google OAuth',
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
      console.error('Error connecting Google:', err);
      setError('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setIsConnecting(false);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch(`/api/auth/google/status?userId=${userId}`);
      const data = await response.json();
      
      console.log('✅ Google connection status:', data);
      
      if (data.isConnected) {
        console.log('✅ Calling onConnected callback');
        onConnected?.();
      } else {
        console.log('❌ Not connected yet');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          Connexion avec Google
        </h4>
        <ol className="text-sm space-y-1 text-gray-700 list-decimal list-inside">
          <li>Cliquez sur le bouton &quot;Se connecter avec Google&quot;</li>
          <li>Autorisez l&apos;accès à votre compte Google</li>
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
        className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Connexion en cours...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Se connecter avec Google
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

interface GoogleFormsConnectionCardProps {
  userId: string;
  isConnected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onCancel?: () => void;
}

export function GoogleFormsConnectionCard({
  userId,
  isConnected,
  onConnect,
  onDisconnect,
  onCancel,
}: GoogleFormsConnectionCardProps) {
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
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte Google ?')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/auth/google/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          {isNowConnected ? '✅' : '🔗'} Compte Google Forms
        </CardTitle>
        <CardDescription>
          {isNowConnected
            ? 'Votre compte Google est connecté. Les formulaires seront créés dans votre Google Drive.'
            : 'Connectez votre compte Google pour créer des formulaires dans votre espace.'}
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
          <GoogleFormsConnect userId={userId} onConnected={handleLocalConnect} onCancel={onCancel} />
        )}
      </CardContent>
    </Card>
  );
}
