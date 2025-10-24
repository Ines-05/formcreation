import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserTallyApiKey } from '@/models/UserTallyApiKey';
import { encrypt } from '@/lib/encryption';

/**
 * Endpoint pour sauvegarder l'API Key Tally d'un utilisateur
 * 
 * POST /api/user/tally/connect
 * Body: { userId: string, apiKey: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, apiKey } = body;

    if (!userId || !apiKey) {
      return NextResponse.json(
        { error: 'userId and apiKey are required' },
        { status: 400 }
      );
    }

    // Valider le format de l'API Key
    if (!apiKey.startsWith('tly-')) {
      return NextResponse.json(
        { error: 'Invalid Tally API Key format. It should start with "tly-"' },
        { status: 400 }
      );
    }

    // Tester l'API Key en faisant un appel simple
    console.log('🔍 Testing Tally API Key...');
    const testResponse = await fetch('https://api.tally.so/forms', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ Invalid Tally API Key:', errorText);
      return NextResponse.json(
        { error: 'Invalid Tally API Key. Please verify your key and try again.' },
        { status: 401 }
      );
    }

    console.log('✅ Tally API Key is valid');

    // Chiffrer l'API Key
    const encryptedApiKey = encrypt(apiKey);

    // Connecter à MongoDB
    await connectDB();

    // Sauvegarder ou mettre à jour l'API Key de l'utilisateur
    await UserTallyApiKey.findOneAndUpdate(
      { userId },
      {
        userId,
        tallyApiKey: encryptedApiKey,
        connectedAt: new Date(),
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log('✅ User Tally API Key saved:', userId);

    return NextResponse.json({
      success: true,
      message: 'Tally API Key connected successfully',
    });

  } catch (error) {
    console.error('❌ Error connecting Tally API Key:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect Tally API Key',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
