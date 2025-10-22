import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Form } from '@/models/Form';
import { FormSubmission } from '@/models/FormSubmission';
import { getBitlyClickStats } from '@/lib/bitly';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ formId: string }> }
) {
  try {
    await connectDB();

    const { formId } = await context.params;

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Récupérer le formulaire
    const form = await Form.findOne({ formId });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Récupérer toutes les soumissions
    const submissions = await FormSubmission.find({ formId }).sort({ submittedAt: -1 });

    // Récupérer les statistiques Bitly si disponible
    let bitlyStats = null;
    if (form.shortLink) {
      bitlyStats = await getBitlyClickStats(form.shortLink);
    }

    // Calculer des statistiques
    const submissionsByDate: Record<string, number> = {};
    submissions.forEach(sub => {
      const date = sub.submittedAt.toISOString().split('T')[0];
      submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        formInfo: {
          formId: form.formId,
          title: form.title,
          description: form.description,
          createdAt: form.createdAt,
          shareableLink: form.shareableLink,
          shortLink: form.shortLink,
          isActive: form.isActive,
        },
        submissions: {
          total: form.submissionCount,
          recent: submissions.slice(0, 10).map(sub => ({
            id: sub._id,
            submittedAt: sub.submittedAt,
            data: sub.data,
          })),
          byDate: submissionsByDate,
        },
        bitlyStats: bitlyStats ? {
          totalClicks: bitlyStats.total_clicks,
          clicksByDate: bitlyStats.link_clicks,
        } : null,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching form stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form stats' },
      { status: 500 }
    );
  }
}
