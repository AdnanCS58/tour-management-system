import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';
import User from '@/models/User';

// Get single tour
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const tour = await Tour.findOne({
      _id: params.id,
      $or: [
        { owner: session.user.id },
        { 'members.user': session.user.id },
      ],
    })
      .populate('owner', 'name email avatar contactInfo shareContact')
      .populate('members.user', 'name email avatar contactInfo shareContact')
      .populate({
        path: 'expenses',
        populate: {
          path: 'paidBy',
          select: 'name avatar',
        },
      });

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json(tour);
  } catch (error) {
    console.error('Get tour error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour' },
      { status: 500 }
    );
  }
}

// Update tour
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    await dbConnect();

    const tour = await Tour.findOne({
      _id: params.id,
      owner: session.user.id,
    });

    if (!tour) {
      return NextResponse.json(
        { error: 'Not authorized to update this tour' },
        { status: 403 }
      );
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      params.id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    return NextResponse.json(updatedTour);
  } catch (error) {
    console.error('Update tour error:', error);
    return NextResponse.json(
      { error: 'Failed to update tour' },
      { status: 500 }
    );
  }
}

// Delete tour
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const tour = await Tour.findOne({
      _id: params.id,
      owner: session.user.id,
    });

    if (!tour) {
      return NextResponse.json(
        { error: 'Not authorized to delete this tour' },
        { status: 403 }
      );
    }

    // Remove tour from all members' tours list
    await User.updateMany(
      { tours: params.id },
      { $pull: { tours: params.id } }
    );

    await Tour.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tour' },
      { status: 500 }
    );
  }
}