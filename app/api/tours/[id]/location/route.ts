import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';

// Update user location
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lat, lng } = await req.json();

    await dbConnect();

    const tour = await Tour.findOne({
      _id: params.id,
      'members.user': session.user.id,
    });

    if (!tour) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Update member location
    await Tour.updateOne(
      { _id: params.id, 'members.user': session.user.id },
      {
        $set: {
          'members.$.lastLocation': {
            lat,
            lng,
            updatedAt: new Date(),
          },
        },
      }
    );

    return NextResponse.json({ message: 'Location updated' });
  } catch (error) {
    console.error('Update location error:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// Toggle location sharing
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await req.json();

    await dbConnect();

    const tour = await Tour.findOne({
      _id: params.id,
      'members.user': session.user.id,
    });

    if (!tour) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await Tour.updateOne(
      { _id: params.id, 'members.user': session.user.id },
      {
        $set: {
          'members.$.locationSharing': enabled,
        },
      }
    );

    return NextResponse.json({ message: 'Location sharing updated' });
  } catch (error) {
    console.error('Toggle location sharing error:', error);
    return NextResponse.json(
      { error: 'Failed to update location sharing' },
      { status: 500 }
    );
  }
}