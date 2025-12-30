import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Form } from '@/models/Form';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Récupérer tous les formulaires de l'utilisateur
    const forms = await Form.find({ userId }).sort({ createdAt: -1 });

    // Transformer les données pour le dashboard
    const formsWithStats = forms.map(form => ({
      formId: form._id.toString(),
      title: form.title || 'Formulaire sans titre',
      description: form.description,
      submissionCount: form.submissionCount || 0,
      createdAt: form.createdAt.toISOString(),
      shareableLink: form.shareableLink,
      shortLink: form.shortLink,
      tool: form.tool || 'unknown',
      platform: form.platform || 'internal'
    }));

    // Calculer les statistiques
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const stats = {
      totalForms: forms.length,
      formsThisMonth: forms.filter(f => {
        const formDate = new Date(f.createdAt);
        return formDate.getMonth() === currentMonth && formDate.getFullYear() === currentYear;
      }).length,
      favoriteTools: forms.reduce((acc, form) => {
        const tool = form.tool || 'unknown';
        acc[tool] = (acc[tool] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      success: true,
      forms: formsWithStats,
      stats
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, formId, title, description, shareableLink, shortLink, tool, platform } = body;

    if (!userId || !formId) {
      return NextResponse.json({ error: 'User ID and Form ID are required' }, { status: 400 });
    }

    // Créer ou mettre à jour le formulaire
    const formData = {
      userId,
      formId,
      title: title || 'Nouveau formulaire',
      description,
      shareableLink,
      shortLink,
      tool,
      platform,
      createdAt: new Date(),
      submissionCount: 0
    };

    const existingForm = await Form.findOne({ userId, formId });
    
    if (existingForm) {
      // Mettre à jour
      await Form.findOneAndUpdate({ userId, formId }, formData);
    } else {
      // Créer nouveau
      await Form.create(formData);
    }

    return NextResponse.json({
      success: true,
      message: 'Form saved successfully'
    });

  } catch (error) {
    console.error('Error saving form:', error);
    return NextResponse.json(
      { error: 'Failed to save form' },
      { status: 500 }
    );
  }
}