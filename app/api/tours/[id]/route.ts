import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Tour from '@/models/Tour';
import User from '@/models/User';
import Expense from '@/models/Expense';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔵 GET SINGLE TOUR API CALLED');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const tour = await Tour.findById(params.id);

    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    const currentUserId =
      session.user.id.toString();

    // --------------------------------------------------
    // SECURITY CHECK
    // --------------------------------------------------

    const isOwner =
      tour.owner?.toString() === currentUserId;

    const isMember = tour.members.some(
      (member: any) =>
        member.user?.toString() === currentUserId
    );

    if (!isOwner && !isMember) {
      return NextResponse.json(
        {
          error:
            'You are not a member of this tour',
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // Convert tour to object
    // --------------------------------------------------

    const tourObj: any = tour.toObject();

    // --------------------------------------------------
    // Populate owner
    // --------------------------------------------------

    if (tourObj.owner) {
      const owner = await User.findById(
        tourObj.owner
      )
        .select('name email avatar')
        .lean();

      tourObj.owner = owner;
    }

    // --------------------------------------------------
    // Populate members
    // --------------------------------------------------

    if (
      tourObj.members &&
      tourObj.members.length > 0
    ) {
      const memberPromises =
        tourObj.members.map(
          async (member: any) => {
            if (member.user) {
              const user =
                await User.findById(member.user)
                  .select(
                    'name email avatar'
                  )
                  .lean();

              return {
                ...member,
                user,
              };
            }

            return member;
          }
        );

      tourObj.members =
        await Promise.all(
          memberPromises
        );
    }

    // --------------------------------------------------
    // Populate expenses
    // --------------------------------------------------

    if (
      tourObj.expenses &&
      tourObj.expenses.length > 0
    ) {
      const expensePromises =
        tourObj.expenses.map(
          async (expenseId: any) => {
            const expense =
              await Expense.findById(
                expenseId
              )
                .populate(
                  'participants.user',
                  'name email avatar'
                )
                .lean();

            return expense;
          }
        );

      tourObj.expenses =
        (
          await Promise.all(
            expensePromises
          )
        ).filter(
          (expense) => expense !== null
        );
    } else {
      tourObj.expenses = [];
    }

    console.log(
      '✅ Tour data prepared:',
      {
        id: tourObj._id,
        name: tourObj.name,
        expenseCount:
          tourObj.expenses?.length || 0,
        memberCount:
          tourObj.members?.length || 0,
      }
    );

    return NextResponse.json(
      tourObj
    );
  } catch (error) {
    console.error(
      '❌ GET SINGLE TOUR ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Failed to fetch tour: ' +
          (error as Error).message,
      },
      { status: 500 }
    );
  }
}