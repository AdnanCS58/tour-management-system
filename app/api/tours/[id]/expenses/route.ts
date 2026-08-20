import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tour from "@/models/Tour";
import Expense from "@/models/Expense";
import Notification from "@/models/Notification";
import User from "@/models/User";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log("🔵 ADD EXPENSE API CALLED");

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      category,
      amount,
      date,
      description,
      splitType,
      participants,
    } = body;

    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------

    if (!title || !category || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "Please provide title, category, and amount" },
        { status: 400 },
      );
    }

    const totalAmount = Number(amount);

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Expense amount must be greater than 0" },
        { status: 400 },
      );
    }

    if (!["equal", "unequal"].includes(splitType)) {
      return NextResponse.json(
        { error: "Invalid split type" },
        { status: 400 },
      );
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: "Please provide expense participants" },
        { status: 400 },
      );
    }

    await dbConnect();

    // --------------------------------------------------
    // Find tour
    // --------------------------------------------------

    const tour = await Tour.findById(params.id);

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // --------------------------------------------------
    // Check membership
    // --------------------------------------------------

    const currentUserId = session.user.id.toString();

    const isOwner = tour.owner?.toString() === currentUserId;

    const isMember = tour.members.some(
      (member: any) => member.user?.toString() === currentUserId,
    );

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: "Not authorized to add expenses to this tour" },
        { status: 403 },
      );
    }

    // --------------------------------------------------
    // Get actual tour member IDs
    // --------------------------------------------------

    const tourMemberIds = tour.members.map((member: any) =>
      member.user?.toString(),
    );

    if (!tourMemberIds.includes(tour.owner.toString())) {
      tourMemberIds.push(tour.owner.toString());
    }

    // --------------------------------------------------
    // Validate participants
    // --------------------------------------------------

    const normalizedParticipants: {
      user: string;
      amountPaid: number;
      share: number;
    }[] = [];

    const participantIds = new Set<string>();

    for (const participant of participants) {
      if (!participant?.user) {
        return NextResponse.json(
          { error: "Invalid participant data" },
          { status: 400 },
        );
      }

      const userId = participant.user.toString();

      if (!tourMemberIds.includes(userId)) {
        return NextResponse.json(
          { error: "All participants must be members of this tour" },
          { status: 400 },
        );
      }

      if (participantIds.has(userId)) {
        return NextResponse.json(
          { error: "Duplicate participant detected" },
          { status: 400 },
        );
      }

      participantIds.add(userId);

      const amountPaid = Number(participant.amountPaid || 0);

      if (!Number.isFinite(amountPaid) || amountPaid < 0) {
        return NextResponse.json(
          { error: "Invalid amount paid for a participant" },
          { status: 400 },
        );
      }

      normalizedParticipants.push({
        user: userId,
        amountPaid: roundMoney(amountPaid),
        share: 0,
      });
    }

    // --------------------------------------------------
    // Calculate shares
    // --------------------------------------------------

    if (splitType === "equal") {
      const participantCount = normalizedParticipants.length;

      if (participantCount === 0) {
        return NextResponse.json(
          { error: "At least one participant is required" },
          { status: 400 },
        );
      }

      const baseShare =
        Math.floor((totalAmount / participantCount) * 100) / 100;

      let remaining = roundMoney(totalAmount - baseShare * participantCount);

      normalizedParticipants.forEach((participant) => {
        let share = baseShare;

        if (remaining > 0) {
          share = roundMoney(share + Math.min(remaining, 0.01));
          remaining = roundMoney(remaining - 0.01);
        }

        participant.share = share;
      });
    } else {
      let totalShare = 0;

      normalizedParticipants.forEach((participant, index) => {
        const originalParticipant = participants[index];

        const share = Number(originalParticipant.share || 0);

        if (!Number.isFinite(share) || share < 0) {
          throw new Error("Invalid share amount for a participant");
        }

        participant.share = roundMoney(share);
        totalShare += participant.share;
      });

      totalShare = roundMoney(totalShare);

      if (Math.abs(totalShare - totalAmount) > 0.01) {
        return NextResponse.json(
          {
            error: `Total shares (৳${totalShare.toFixed(
              2,
            )}) must equal expense amount (৳${totalAmount.toFixed(2)})`,
          },
          { status: 400 },
        );
      }
    }

    // --------------------------------------------------
    // Validate actual payments
    // --------------------------------------------------

    const totalPaid = roundMoney(
      normalizedParticipants.reduce(
        (sum, participant) => sum + participant.amountPaid,
        0,
      ),
    );

    if (Math.abs(totalPaid - totalAmount) > 0.01) {
      return NextResponse.json(
        {
          error: `Total paid (৳${totalPaid.toFixed(
            2,
          )}) must equal expense amount (৳${totalAmount.toFixed(2)})`,
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Create expense
    // --------------------------------------------------

    const expenseData = {
      tour: params.id,
      title: title.trim(),
      category,
      amount: roundMoney(totalAmount),
      date: date ? new Date(date) : new Date(),
      description: description?.trim() || "",
      splitType,
      paidBy: null,
      participants: normalizedParticipants,
    };

    console.log("📊 Final expense data:", expenseData);

    const expense = await Expense.create(expenseData);

    console.log("✅ Expense created:", expense._id.toString());

    // --------------------------------------------------
    // Create notifications for OTHER members only
    // --------------------------------------------------

    // Get the name of the user who added the expense
    const currentUser = await User.findById(session.user.id).select("name");

    // Collect all recipients (excluding the current user)
    const recipients = new Set<string>();

    // Add all tour members except the current user
    tour.members.forEach((member: any) => {
      const memberId = member.user.toString();
      if (memberId !== currentUserId) {
        recipients.add(memberId);
      }
    });

    // Add owner if owner is not the current user
    if (tour.owner.toString() !== currentUserId) {
      recipients.add(tour.owner.toString());
    }

    // Create notifications for each recipient
    for (const recipientId of Array.from(recipients)) {
      await Notification.create({
        tour: params.id,
        user: recipientId, // Recipient who should receive this notification
        type: "expense_added",
        title: "New Expense Added",
        message: `${currentUser?.name || "A member"} added expense "${title}" of ৳${totalAmount.toFixed(2)}`,
        read: false,
      });
    }

    console.log(`✅ Notifications sent to ${recipients.size} members`);

    // --------------------------------------------------
    // Add expense to tour
    // --------------------------------------------------

    tour.expenses.push(expense._id);

    tour.activities.push({
      user: session.user.id,
      action: "added_expense",
      details: `Added expense: ${title} (৳${totalAmount})`,
      timestamp: new Date(),
    });

    await tour.save();

    // --------------------------------------------------
    // Populate response
    // --------------------------------------------------

    const populatedExpense = await Expense.findById(expense._id)
      .populate("participants.user", "name email avatar")
      .lean();

    return NextResponse.json(populatedExpense, { status: 201 });
  } catch (error) {
    console.error("❌ ADD EXPENSE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to add expense: " + (error as Error).message,
      },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log("🔵 GET EXPENSES API CALLED");

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

    const expenses = await Expense.find({
      tour: params.id,
    })
      .populate("participants.user", "name email avatar")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("❌ GET EXPENSES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 },
    );
  }
}