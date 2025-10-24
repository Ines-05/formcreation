import { NextRequest, NextResponse } from 'next/server';

const TALLY_API_KEY = process.env.TALLY_API_KEY;
const TALLY_API_URL = 'https://api.tally.so';

export async function GET(request: NextRequest) {
  try {
    if (!TALLY_API_KEY) {
      return NextResponse.json(
        { error: 'TALLY_API_KEY is not defined' },
        { status: 500 }
      );
    }

    // Test minimal - créer un formulaire basique
    const testForm = {
      name: 'Test Form',
      status: 'PUBLISHED',
      blocks: [
        {
          uuid: '6ef8675d-33cb-419b-a81e-93982e726f2e',
          type: 'FORM_TITLE',
          groupUuid: '073c835f-7ad4-459c-866d-4108b6b7e2e1',
          groupType: 'TEXT',
          payload: {
            html: 'Test Form Title',
          },
        },
        {
          uuid: '48b4cdf3-2c9d-47d3-b8fb-b0ccabc5cd84',
          type: 'TITLE',
          groupUuid: '93034250-5f05-4710-b8e0-5c9145c5b9ea',
          groupType: 'QUESTION',
          payload: {
            html: "What's your name?",
          },
        },
        {
          uuid: '884ff838-97f9-4ac9-8db1-31aa052df988',
          type: 'INPUT_TEXT',
          groupUuid: '3287d15c-c2b2-4f84-a915-bc57380a4b51',
          groupType: 'INPUT_TEXT',
          payload: {
            isRequired: true,
          },
        },
      ],
    };

    console.log('📤 Testing Tally API with:', JSON.stringify(testForm, null, 2));

    const response = await fetch(`${TALLY_API_URL}/forms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TALLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testForm),
    });

    const responseText = await response.text();
    console.log('📥 Tally API response:', response.status, responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Tally API error', details: responseText, status: response.status },
        { status: 500 }
      );
    }

    const formData = JSON.parse(responseText);
    return NextResponse.json({
      success: true,
      message: 'Test form created successfully!',
      formData,
    });

  } catch (error) {
    console.error('❌ Error testing Tally API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test Tally API', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
