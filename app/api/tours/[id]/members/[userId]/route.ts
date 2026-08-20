import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';
import User from '@/models/User';

// Remove member from tour
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
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
        { error: 'Only tour owner can remove members' },
        { status: 403 }
      );
    }

    // Don't allow removing the owner
    if (params.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove tour owner' },
        { status: 400 }
      );
    }

    // Remove member from tour
    tour.members.pull({ user: params.userId });

    tour.activities.push({
      user: session.user.id,
      action: 'removed_member',
      details: `Removed member from tour`,
    });

    await tour.save();

    // Remove tour from user's tours
    await User.findByIdAndUpdate(params.userId, {
      $pull: { tours: tour._id },
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}