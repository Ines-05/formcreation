import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Form } from '@/models/Form';
import { createTallyForm, getTallyEmbedUrl, getTallyShareUrl } from '@/lib/tally';
import { FormDefinition } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { formDefinition, userId } = body as {
      formDefinition: FormDefinition;
      userId?: string;
    };

    if (!formDefinition || !formDefinition.fields || formDefinition.fields.length === 0) {
      return NextResponse.json(
        { error: 'Invalid form definition' },
        { status: 400 }
      );
    }

    // Créer le formulaire sur Tally avec le token de l'utilisateur si disponible
    const tallyForm = await createTallyForm(
      formDefinition.title,
      formDefinition.description,
      formDefinition.fields,
      userId // Passer le userId pour utiliser son token OAuth
    );

    // Générer les URLs Tally
    const tallyShareUrl = getTallyShareUrl(tallyForm.id);
    const tallyEmbedUrl = getTallyEmbedUrl(tallyForm.id);
    
    // Utiliser directement le lien Tally (pas besoin de Bitly)
    const shortLink = tallyShareUrl;

    // Sauvegarder dans MongoDB avec les nouveaux champs
    const form = await Form.create({
      formId: tallyForm.id, // On utilise l'ID Tally comme formId
      userId: userId || 'anonymous', // ID de l'utilisateur
      title: formDefinition.title,
      description: formDefinition.description,
      definition: formDefinition,
      createdBy: userId || 'anonymous',
      shareableLink: tallyShareUrl,
      shortLink,
      tool: 'tally', // Outil utilisé
      platform: 'tally', // Plateforme externe
      isActive: true,
      submissionCount: 0,
    });

    console.log('✅ Tally form created and saved:', tallyForm.id);

    return NextResponse.json({
      success: true,
      formId: tallyForm.id,
      tallyFormData: tallyForm,
      embedUrl: tallyEmbedUrl,
      shareableLink: tallyShareUrl,
      shortLink,
      message: 'Formulaire Tally créé avec succès !',
    });

  } catch (error) {
    console.error('❌ Error creating Tally form:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create Tally form', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
