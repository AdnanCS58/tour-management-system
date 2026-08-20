import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await dbConnect();

    const tour = await Tour.findOne({ 
      invitationCode: params.code.toUpperCase() 
    })
      .select('name destination startDate endDate members owner')
      .populate('owner', 'name avatar');

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Return only public information
    const publicTourInfo = {
      name: tour.name,
      destination: tour.destination,
      startDate: tour.startDate,
      endDate: tour.endDate,
      membersCount: tour.members.length,
      owner: {
        name: tour.owner.name,
        avatar: tour.owner.avatar
      }
    };

    return NextResponse.json(publicTourInfo);
  } catch (error) {
    console.error('Get tour info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour information' },
      { status: 500 }
    );
  }
}