import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';
import Message from '@/models/Message';

// Add this new GET endpoint for unread count
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

    // Get all messages
    const messages = await Message.find({ tour: params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();

    // Count unread messages (messages not sent by current user)
    const unreadCount = messages.filter(
      (msg: any) => msg.sender?._id?.toString() !== session.user.id
    ).length;

    return NextResponse.json({ messages, unreadCount });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Please provide a message' },
        { status: 400 }
      );
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

    const message = await Message.create({
      tour: params.id,
      sender: session.user.id,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .lean();

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}