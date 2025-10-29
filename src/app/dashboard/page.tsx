'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Users, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface FormStats {
  formId: string;
  title: string;
  description?: string;
  submissionCount: number;
  createdAt: string;
  shareableLink: string;
  shortLink?: string;
}

export default function Dashboard() {
  const [forms, setForms] = useState<FormStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Charger les formulaires depuis l'API
    // Pour l'instant, juste un placeholder
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm shadow-sm border-b p-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
          </div>
        </div>
      </motion.div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Formulaires créés</p>
                  <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Réponses totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forms.reduce((sum, form) => sum + form.submissionCount, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ce mois-ci</p>
                  <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des formulaires */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Mes formulaires</h2>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            ) : forms.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Aucun formulaire créé</p>
                <p className="text-sm text-gray-500 mb-4">Commence par créer ton premier formulaire !</p>
                <Button onClick={() => window.location.href = '/'}>
                  Créer un formulaire
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {forms.map((form) => (
                  <div key={form.formId} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{form.title}</h3>
                        {form.description && (
                          <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{form.submissionCount} réponses</span>
                          <span>•</span>
                          <span>Créé le {new Date(form.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(form.shortLink || form.shareableLink, '_blank')}
                        >
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(form.shortLink || form.shareableLink);
                            alert('Lien copié ! 📋');
                          }}
                        >
                          Copier le lien
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
