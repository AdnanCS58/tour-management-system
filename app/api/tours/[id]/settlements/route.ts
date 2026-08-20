import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tour from "@/models/Tour";
import Settlement from "@/models/Settlement";
import User from "@/models/User";

// POST - Create settlement
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { from, to, amount, note } = await req.json();

    if (!from || !to || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Please provide valid settlement details" },
        { status: 400 },
      );
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

    const settlement = await Settlement.create({
      tour: params.id,
      from,
      to,
      amount,
      note: note || "",
      status: 'pending',
    });

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .lean();

    return NextResponse.json(populatedSettlement, { status: 201 });
  } catch (error) {
    console.error("Create settlement error:", error);
    return NextResponse.json(
      { error: "Failed to create settlement" },
      { status: 500 },
    );
  }
}

// GET - Get all settlements for a tour
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

    const settlements = await Settlement.find({ tour: params.id })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .populate('confirmedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(settlements);
  } catch (error) {
    console.error("Get settlements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settlements" },
      { status: 500 },
    );
  }
}