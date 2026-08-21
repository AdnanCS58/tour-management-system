import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tour from "@/models/Tour";
import User from "@/models/User";
import { generateInvitationCode } from "@/lib/utils";

// POST - Create a new tour
export async function POST(req: NextRequest) {
  console.log("🔵 CREATE TOUR API CALLED");

  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.id) {
      console.log("❌ No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📝 Request body keys:", Object.keys(body));
    console.log("📝 coverImages type:", typeof body.coverImages);
    console.log("📝 coverImages is array:", Array.isArray(body.coverImages));
    console.log("📝 coverImages length:", body.coverImages?.length);
    console.log("📝 coverImage length:", body.coverImage?.length);

    const {
      name,
      destination,
      startDate,
      endDate,
      description,
      coverImage,
      coverImages,
    } = body;

    if (!name || !destination || !startDate || !endDate) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Please provide all required fields" },
        { status: 400 },
      );
    }

    console.log("🔌 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected");

    // Generate unique invitation code
    let invitationCode = generateInvitationCode();
    console.log("🎫 Generated code:", invitationCode);

    let existingTour = await Tour.findOne({ invitationCode });
    while (existingTour) {
      invitationCode = generateInvitationCode();
      existingTour = await Tour.findOne({ invitationCode });
    }

    // Create tour
    console.log("🏗️ Creating tour...");
    const tourData: any = {
      name,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      coverImage: coverImage || "",
      invitationCode,
      owner: session.user.id,
      members: [{ user: session.user.id, joinedAt: new Date() }],
      expenses: [],
      activities: [
        {
          user: session.user.id,
          action: "created",
          details: "Tour created",
          timestamp: new Date(),
        },
      ],
    };

    // Set coverImages separately
    if (coverImages && Array.isArray(coverImages) && coverImages.length > 0) {
      tourData.coverImages = coverImages;
    } else if (coverImage) {
      tourData.coverImages = [coverImage];
    } else {
      tourData.coverImages = [];
    }

    const tour = await Tour.create(tourData);

    console.log("✅ Tour created with ID:", tour._id);
    console.log("📊 Tour data:", {
      id: tour._id,
      name: tour.name,
      destination: tour.destination,
      owner: tour.owner,
      members: tour.members,
    });

    // Add tour to user's tours list
    console.log("👤 Updating user with tour...");
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $push: { tours: tour._id } },
      { new: true },
    );
    console.log("✅ User updated:", updatedUser ? "Yes" : "No");
    console.log("📊 User tours:", updatedUser?.tours);

    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    console.error("❌ CREATE TOUR ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create tour: " + (error as Error).message },
      { status: 500 },
    );
  }
}

// GET - Get all tours for current user
export async function GET(req: NextRequest) {
  console.log("🔵 GET TOURS API CALLED");

  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.id) {
      console.log("❌ No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 User ID:", session.user.id);

    console.log("🔌 Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected");

    // First, let's find ALL tours to debug
    const allTours = await Tour.find({});
    console.log("📊 ALL TOURS IN DATABASE:", allTours.length);
    allTours.forEach((tour) => {
      console.log(
        `  - ID: ${tour._id}, Name: ${tour.name}, Owner: ${tour.owner}`,
      );
    });

    // Now find tours for this user
    console.log("🔍 Finding tours for user:", session.user.id);
    const tours = await Tour.find({
      $or: [{ owner: session.user.id }, { "members.user": session.user.id }],
    });

    console.log(`📊 Found ${tours.length} tours for user`);
    tours.forEach((tour) => {
      console.log(`  - ID: ${tour._id}, Name: ${tour.name}`);
    });

    return NextResponse.json(tours);
  } catch (error) {
    console.error("❌ GET TOURS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch tours: " + (error as Error).message },
      { status: 500 },
    );
  }
}
