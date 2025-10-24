import { NextRequest, NextResponse } from 'next/server';
import { createGoogleForm } from '@/lib/google-forms';
import { getGoogleTokens, refreshGoogleAccessToken } from '@/lib/google-tokens';
import { FormDefinition } from '@/lib/types';

/**
 * Endpoint pour créer un formulaire Google Forms
 * 
 * POST /api/google-forms/create
 * Body: { formDefinition: FormDefinition, userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 API Google Forms - Début de la création');
    
    const body = await request.json();
    const { formDefinition, userId } = body;

    console.log('📦 Données reçues:', { formDefinition, userId });

    if (!formDefinition || !userId) {
      console.error('❌ Données manquantes');
      return NextResponse.json(
        { error: 'formDefinition and userId are required' },
        { status: 400 }
      );
    }

    // Récupérer les tokens OAuth de l'utilisateur depuis MongoDB
    console.log('🔐 Récupération des tokens Google...');
    const tokens = await getGoogleTokens(userId);

    if (!tokens) {
      console.error('❌ Aucun token trouvé pour cet utilisateur');
      return NextResponse.json(
        { error: 'User not connected to Google' },
        { status: 401 }
      );
    }

    console.log('✅ Tokens récupérés, expiré?', tokens.isExpired);

    // Si le token est expiré, le rafraîchir
    let accessToken = tokens.accessToken;
    if (tokens.isExpired) {
      console.log('🔄 Token expiré, rafraîchissement...');
      accessToken = await refreshGoogleAccessToken(userId);
      console.log('✅ Token rafraîchi');
    }

    // Créer le formulaire Google
    console.log('🎨 Création du formulaire Google Forms...');
    const result = await createGoogleForm(formDefinition, accessToken);

    console.log('✅ Google Form créé avec succès:', result.formId);

    return NextResponse.json({
      success: true,
      formId: result.formId,
      responderUri: result.responderUri,
      editUrl: result.editUrl,
      shareableLink: result.responderUri,
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du Google Form:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create Google Form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
