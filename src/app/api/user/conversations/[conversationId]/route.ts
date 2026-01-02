import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { auth } from '@clerk/nextjs/server';

export async function GET(
    req: Request,
    { params }: { params: { conversationId: string } }
) {
    try {
        const { userId } = await auth();
        const { conversationId } = await params;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const conversation = await Conversation.findOne({ conversationId, userId });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, conversation });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
