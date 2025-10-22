import { NextRequest } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { formData, formId } = await req.json();

    if (!formData || !formId) {
      return Response.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Créer le répertoire data s'il n'existe pas
    const dataDir = path.join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Nom du fichier pour stocker les réponses
    const fileName = path.join(dataDir, 'form-responses.json');

    // Lire les réponses existantes ou créer un tableau vide
    let responses = [];
    if (existsSync(fileName)) {
      const fileContent = await readFile(fileName, 'utf-8');
      responses = JSON.parse(fileContent);
    }

    // Ajouter la nouvelle réponse
    const newResponse = {
      id: Date.now().toString(),
      formId,
      responses: formData,
      submittedAt: new Date().toISOString(),
    };

    responses.push(newResponse);

    // Sauvegarder les réponses
    await writeFile(fileName, JSON.stringify(responses, null, 2));

    return Response.json({ 
      success: true, 
      message: 'Réponse enregistrée avec succès',
      responseId: newResponse.id 
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return Response.json(
      { error: 'Erreur lors de la sauvegarde des réponses' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const fileName = path.join(dataDir, 'form-responses.json');

    if (!existsSync(fileName)) {
      return Response.json({ responses: [] });
    }

    const fileContent = await readFile(fileName, 'utf-8');
    const responses = JSON.parse(fileContent);

    return Response.json({ responses });
  } catch (error) {
    console.error('Erreur lors de la lecture des réponses:', error);
    return Response.json(
      { error: 'Erreur lors de la lecture des réponses' },
      { status: 500 }
    );
  }
}