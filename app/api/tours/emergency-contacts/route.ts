import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';

// PUT - Update emergency contacts
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emergencyContacts } = await req.json();

    await dbConnect();

    const tour = await Tour.findById(params.id);
    
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const isOwner = tour.owner.toString() === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Only owner can update emergency contacts' }, { status: 403 });
    }

    tour.emergencyContacts = emergencyContacts;
    await tour.save();

    return NextResponse.json({ message: 'Emergency contacts updated', emergencyContacts });
  } catch (error) {
    console.error('Update emergency contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to update emergency contacts' },
      { status: 500 }
    );
  }
}