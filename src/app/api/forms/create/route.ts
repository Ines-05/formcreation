import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import { Form } from '@/models/Form';
import { shortenUrlWithBitly } from '@/lib/bitly';
import { FormDefinition } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { formDefinition, title, description } = body as {
      formDefinition: FormDefinition;
      title?: string;
      description?: string;
    };

    if (!formDefinition || !formDefinition.fields || formDefinition.fields.length === 0) {
      return NextResponse.json(
        { error: 'Invalid form definition' },
        { status: 400 }
      );
    }

    // Générer un ID unique pour le formulaire
    const formId = nanoid(10); // Ex: "aBc123XyZ9"

    // Construire l'URL complète du formulaire
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareableLink = `${baseUrl}/form/${formId}`;

    // Raccourcir le lien avec Bitly
    const shortLink = await shortenUrlWithBitly(shareableLink);

    // Créer le formulaire dans la base de données
    const form = await Form.create({
      formId,
      title: title || formDefinition.title || 'Formulaire sans titre',
      description: description || formDefinition.description,
      definition: formDefinition,
      createdBy: 'anonymous', // TODO: Ajouter l'authentification plus tard
      shareableLink,
      shortLink,
      isActive: true,
      submissionCount: 0,
    });

    console.log('✅ Form created:', formId);

    return NextResponse.json({
      success: true,
      formId: form.formId,
      shareableLink: form.shareableLink,
      shortLink: form.shortLink,
      message: 'Formulaire créé avec succès !',
    });

  } catch (error) {
    console.error('❌ Error creating form:', error);
    return NextResponse.json(
      { error: 'Failed to create form', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
