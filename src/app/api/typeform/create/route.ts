import { NextRequest, NextResponse } from 'next/server';
import { createTypeform } from '@/lib/typeform';
import { getTypeformTokens, refreshTypeformAccessToken } from '@/lib/typeform-tokens';
import { FormDefinition } from '@/lib/types';

/**
 * Endpoint pour créer un formulaire Typeform
 * 
 * POST /api/typeform/create
 * Body: { formDefinition: FormDefinition, userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 API Typeform - Début de la création');
    
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
    console.log('🔐 Récupération des tokens Typeform...');
    const tokens = await getTypeformTokens(userId);

    if (!tokens) {
      console.error('❌ Aucun token trouvé pour cet utilisateur');
      return NextResponse.json(
        { error: 'User not connected to Typeform' },
        { status: 401 }
      );
    }

    console.log('✅ Tokens récupérés, expiré?', tokens.isExpired);

    // Si le token est expiré, le rafraîchir
    let accessToken = tokens.accessToken;
    if (tokens.isExpired && tokens.refreshToken) {
      console.log('🔄 Token expiré, rafraîchissement...');
      try {
        accessToken = await refreshTypeformAccessToken(userId);
        console.log('✅ Token rafraîchi');
      } catch (refreshError) {
        console.error('❌ Échec du rafraîchissement, utilisation du token actuel');
        // Continuer avec le token actuel, peut-être qu'il fonctionne encore
      }
    }

    // Créer le formulaire Typeform
    console.log('🎨 Création du formulaire Typeform...');
    const result = await createTypeform(formDefinition, accessToken);

    console.log('✅ Typeform créé avec succès:', result.formId);

    return NextResponse.json({
      success: true,
      formId: result.formId,
      formUrl: result.formUrl,
      shareableLink: result.formUrl,
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du Typeform:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create Typeform',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
