import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Tour from '@/models/Tour';
import Expense from '@/models/Expense';

// GET - Get system statistics (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [totalUsers, totalTours, totalExpenses, totalExpenseAmount] = await Promise.all([
      User.countDocuments(),
      Tour.countDocuments(),
      Expense.countDocuments(),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
    ]);

    const stats = {
      totalUsers,
      totalTours,
      totalExpenses,
      totalExpenseAmount: totalExpenseAmount[0]?.total || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}