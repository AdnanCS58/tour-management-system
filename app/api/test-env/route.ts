import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const mongoUri = process.env.MONGODB_URI;
  
  return NextResponse.json({
    mongoUriExists: !!mongoUri,
    mongoUri: mongoUri ? mongoUri.replace(/:[^:]*@/, ':****@') : null,
    nextAuthSecretExists: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });
}