import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tour from "@/models/Tour";
import User from "@/models/User";
import { notifyMemberJoined } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  console.log("🔵 JOIN TOUR API CALLED");

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invitationCode } = await req.json();
    console.log("📝 Invitation code:", invitationCode);

    if (!invitationCode) {
      return NextResponse.json(
        { error: "Please provide invitation code" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Find tour by invitation code
    const tour = await Tour.findOne({
      invitationCode: invitationCode.toUpperCase().trim(),
    });

    if (!tour) {
      console.log("❌ Tour not found with code:", invitationCode);
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 404 },
      );
    }

    console.log("✅ Tour found:", {
      id: tour._id,
      name: tour.name,
    });

    // Check if user is already a member
    const isMember = tour.members.some(
      (member: any) => member.user.toString() === session.user.id,
    );

    if (isMember) {
      return NextResponse.json(
        { error: "You are already a member of this tour" },
        { status: 400 },
      );
    }

    // Check if user is the owner
    if (tour.owner.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You are the owner of this tour" },
        { status: 400 },
      );
    }

    // Add user to tour members
    tour.members.push({
      user: session.user.id,
      joinedAt: new Date(),
    });

    const user = await User.findById(session.user.id);
    const otherMembers = tour.members.filter(
      (member: any) => member.user.toString() !== session.user.id,
    );

    for (const member of otherMembers) {
      await notifyMemberJoined(tour._id, member.user, user.name);
    }

    // Add activity
    tour.activities.push({
      user: session.user.id,
      action: "joined",
      details: "Joined the tour",
      timestamp: new Date(),
    });

    await tour.save();
    console.log("✅ Member added to tour");

    // Add tour to user's tours list
    await User.findByIdAndUpdate(session.user.id, {
      $push: { tours: tour._id },
    });
    console.log("✅ Tour added to user");

    return NextResponse.json({
      message: "Successfully joined the tour",
      tour: {
        _id: tour._id,
        name: tour.name,
        destination: tour.destination,
      },
    });
  } catch (error) {
    console.error("❌ JOIN TOUR ERROR:", error);
    return NextResponse.json(
      { error: "Failed to join tour: " + (error as Error).message },
      { status: 500 },
    );
  }
}
