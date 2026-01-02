import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const conversations = await Conversation.find({ userId })
            .sort({ lastUpdated: -1 })
            .select('conversationId title lastUpdated')
            .limit(20);

        return NextResponse.json({ success: true, conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { conversationId, title, messages } = body;

        await connectDB();

        const conversation = await Conversation.findOneAndUpdate(
            { conversationId, userId },
            {
                $set: { title, messages, lastUpdated: new Date() },
                $setOnInsert: { createdAt: new Date() }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, conversation });
    } catch (error) {
        console.error('Error saving conversation:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
