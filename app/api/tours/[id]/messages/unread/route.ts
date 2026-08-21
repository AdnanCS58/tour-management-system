import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';
import Message from '@/models/Message';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const tour = await Tour.findById(params.id);
    
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const isMember = tour.members.some(
      (member: any) => member.user.toString() === session.user.id
    );
    const isOwner = tour.owner.toString() === session.user.id;

    if (!isMember && !isOwner) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Count ALL messages from OTHER users
    const totalOthersMessages = await Message.countDocuments({
      tour: params.id,
      sender: { $ne: session.user.id },
    });

    // Count ALL messages (including own)
    const totalMessages = await Message.countDocuments({
      tour: params.id,
    });

    return NextResponse.json({ 
      unreadCount: totalOthersMessages,
      totalMessages: totalMessages,
      totalOthersMessages: totalOthersMessages,
    });
  } catch (error) {
    console.error('Unread count error:', error);
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}