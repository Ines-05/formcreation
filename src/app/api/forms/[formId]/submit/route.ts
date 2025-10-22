import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Form } from '@/models/Form';
import { FormSubmission } from '@/models/FormSubmission';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ formId: string }> }
) {
  try {
    await connectDB();

    const { formId } = await context.params;
    const body = await request.json();

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Vérifier que le formulaire existe
    const form = await Form.findOne({ formId, isActive: true });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    // Récupérer les informations de la requête
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Créer la soumission
    const submission = await FormSubmission.create({
      formId,
      data: body.formData || body,
      ipAddress,
      userAgent,
    });

    // Incrémenter le compteur de soumissions
    await Form.updateOne(
      { formId },
      { $inc: { submissionCount: 1 } }
    );

    console.log('✅ Form submission saved:', submission._id);

    return NextResponse.json({
      success: true,
      submissionId: submission._id,
      message: 'Formulaire soumis avec succès !',
    });

  } catch (error) {
    console.error('❌ Error submitting form:', error);
    return NextResponse.json(
      { error: 'Failed to submit form', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
