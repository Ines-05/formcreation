import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Form } from '@/models/Form';

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

    const form = await Form.findOne({ formId, isActive: true });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      form: {
        formId: form.formId,
        title: form.title,
        description: form.description,
        definition: form.definition,
        createdAt: form.createdAt,
        submissionCount: form.submissionCount,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching form:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}
