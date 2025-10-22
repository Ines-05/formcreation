'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DynamicForm } from '@/components/DynamicForm';
import { FormDefinition, FormSubmission } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [formData, setFormData] = useState<{
    title: string;
    description?: string;
    definition: FormDefinition;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        const data = await response.json();

        if (data.success && data.form) {
          setFormData({
            title: data.form.title,
            description: data.form.description,
            definition: data.form.definition,
          });
        } else {
          setError(data.error || 'Formulaire introuvable');
        }
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Erreur lors du chargement du formulaire');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleSubmit = async (submissionData: FormSubmission) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: submissionData }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        setError('Erreur lors de la soumission');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci !</h1>
          <p className="text-gray-600 mb-6">
            Votre formulaire a été soumis avec succès.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {formData?.title}
          </h1>
          {formData?.description && (
            <p className="text-gray-600">{formData.description}</p>
          )}
        </div>

        {formData?.definition && (
          <DynamicForm
            formDefinition={formData.definition}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
