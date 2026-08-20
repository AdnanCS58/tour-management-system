import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Tour from '@/models/Tour';
import mongoose from 'mongoose';

// GET - Get user profile
export async function GET(req: NextRequest) {
  console.log('🔵 GET PROFILE API CALLED');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('👤 User ID:', session.user.id);

    await dbConnect();
    console.log('✅ Database connected');

    // Find user without password
    const user = await User.findById(session.user.id)
      .select('-password')
      .lean();

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      toursCount: user.tours?.length || 0,
    });

    // Populate tours manually
    let populatedTours = [];
    if (user.tours && user.tours.length > 0) {
      const tourPromises = user.tours.map(async (tourId: any) => {
        const tour = await Tour.findById(tourId)
          .select('name destination startDate endDate')
          .lean();
        return tour;
      });
      
      populatedTours = (await Promise.all(tourPromises)).filter(t => t !== null);
    }

    const profileData = {
      ...user,
      tours: populatedTours,
    };

    console.log('✅ Profile data prepared');
    return NextResponse.json(profileData);
  } catch (error) {
    console.error('❌ GET PROFILE ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  console.log('🔵 UPDATE PROFILE API CALLED');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('📝 Update data:', body);

    const { name, avatar, contactInfo, shareContact } = body;

    await dbConnect();

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
    if (shareContact !== undefined) updateData.shareContact = shareContact;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ Profile updated');
    return NextResponse.json(user);
  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update profile: ' + (error as Error).message },
      { status: 500 }
    );
  }
}