import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tour from "@/models/Tour";
import User from "@/models/User";
import Expense from "@/models/Expense";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const tour = await Tour.findById(params.id);

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const currentUserId = session.user.id.toString();
    const isOwner = tour.owner?.toString() === currentUserId;
    const isMember = tour.members.some(
      (member: any) => member.user?.toString() === currentUserId,
    );

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Populate owner
    const owner = await User.findById(tour.owner).select("name email avatar").lean();

    // Populate members
    const memberPromises = tour.members.map(async (member: any) => {
      const user = await User.findById(member.user).select("name email avatar contactInfo").lean();
      return { ...member.toObject(), user };
    });
    const members = await Promise.all(memberPromises);

    // Populate expenses
    const expensePromises = tour.expenses.map(async (expenseId: any) => {
      const expense = await Expense.findById(expenseId)
        .populate("participants.user", "name email")
        .lean();
      return expense;
    });
    const expenses = (await Promise.all(expensePromises)).filter(e => e !== null);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Calculate balances
    const balances: { [key: string]: { paid: number; share: number; balance: number } } = {};
    
    members.forEach((member: any) => {
      const userId = member.user?._id?.toString();
      balances[userId] = { paid: 0, share: 0, balance: 0 };
    });

    expenses.forEach((expense: any) => {
      const participants = expense.participants || [];
      participants.forEach((participant: any) => {
        const userId = participant.user?._id?.toString();
        if (userId && balances[userId]) {
          balances[userId].paid += participant.amountPaid || 0;
          balances[userId].share += participant.share || 0;
        }
      });
    });

    Object.keys(balances).forEach(userId => {
      balances[userId].balance = balances[userId].paid - balances[userId].share;
    });

    const reportData = {
      tour: {
        id: tour._id,
        name: tour.name,
        destination: tour.destination,
        startDate: tour.startDate,
        endDate: tour.endDate,
        description: tour.description,
        invitationCode: tour.invitationCode,
        coverImage: tour.coverImage,
        createdAt: tour.createdAt,
      },
      owner,
      members,
      expenses,
      totalExpenses,
      balances,
      generatedAt: new Date(),
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}