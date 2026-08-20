import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  console.log('🔵 SIGNUP API CALLED');
  
  try {
    const body = await req.json();
    console.log('📝 Signup data:', {
      name: body.name,
      email: body.email,
      hasAvatar: !!body.avatar,
      hasContact: !!body.contactInfo,
    });

    const { name, email, password, avatar, contactInfo } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all fields
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: avatar || '',
      contactInfo: contactInfo || '',
      shareContact: false, // Default to false, user can change in profile
    });

    console.log('✅ User created:', {
      id: user._id,
      name: user.name,
      email: user.email,
      hasAvatar: !!user.avatar,
      hasContact: !!user.contactInfo,
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          contactInfo: user.contactInfo,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ SIGNUP ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to create user: ' + (error as Error).message },
      { status: 500 }
    );
  }
}