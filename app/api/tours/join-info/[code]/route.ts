import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tour from "@/models/Tour";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await dbConnect();

    const tour = await Tour.findOne({
      invitationCode: params.code,
    })
      .populate("owner", "name avatar")
      .lean();

    if (!tour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      );
    }

    // Because TypeScript sees owner as ObjectId even after populate,
    // explicitly treat the populated result as a user object.
    const owner = tour.owner as unknown as {
      _id: string;
      name?: string;
      avatar?: string;
    };

    const tourInfo = {
      id: tour._id,
      name: tour.name,
      destination: tour.destination,
      startDate: tour.startDate,
      endDate: tour.endDate,
      description: tour.description,
      coverImage: tour.coverImage,
      membersCount: tour.members.length,
      owner: {
        name: owner?.name || "Unknown",
        avatar: owner?.avatar || "",
      },
    };

    return NextResponse.json(tourInfo);
  } catch (error) {
    console.error("Join info error:", error);

    return NextResponse.json(
      { error: "Failed to get tour information" },
      { status: 500 }
    );
  }
}