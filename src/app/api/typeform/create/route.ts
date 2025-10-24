import { NextRequest, NextResponse } from 'next/server';
import { createTypeform } from '@/lib/typeform';
import { FormDefinition } from '@/lib/types';

/**
 * Endpoint pour créer un formulaire Typeform
 * 
 * POST /api/typeform/create
 * Body: { formDefinition: FormDefinition, userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formDefinition, userId } = body;

    if (!formDefinition || !userId) {
      return NextResponse.json(
        { error: 'formDefinition and userId are required' },
        { status: 400 }
      );
    }

    // TODO: Récupérer l'access token valide de l'utilisateur depuis MongoDB
    // const accessToken = await getValidTypeformAccessToken(userId);

    // Pour l'instant, retourner une erreur car MongoDB n'est pas encore implémenté
    return NextResponse.json(
      { 
        error: 'Typeform creation not yet fully implemented',
        message: 'MongoDB integration required to store and retrieve OAuth tokens'
      },
      { status: 501 }
    );

    // Code à activer une fois MongoDB configuré :
    /*
    const result = await createTypeform(formDefinition, accessToken);

    console.log('✅ Typeform created:', result.formId);

    return NextResponse.json({
      success: true,
      formId: result.formId,
      formUrl: result.formUrl,
      editUrl: result.editUrl,
      shareableLink: result.formUrl,
    });
    */

  } catch (error) {
    console.error('❌ Error creating Typeform:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create Typeform',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
