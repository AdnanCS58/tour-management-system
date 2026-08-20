import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tour from "@/models/Tour";
import Document from "@/models/Document";
import User from "@/models/User";
import Notification from "@/models/Notification";

// POST - Upload document
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, type, fileData, fileName, fileType, fileSize, description } =
      body;

    if (!title) {
      return NextResponse.json(
        { error: "Please provide a document title" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check if user is a member
    const tour = await Tour.findById(params.id);

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const isMember = tour.members.some(
      (member: any) => member.user.toString() === session.user.id,
    );
    const isOwner = tour.owner.toString() === session.user.id;

    if (!isMember && !isOwner) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const document = await Document.create({
      tour: params.id,
      title,
      type,
      fileData: fileData || "",
      fileName: fileName || "",
      fileType: fileType || "",
      fileSize: fileSize || 0,
      uploadedBy: session.user.id,
      description: description || "",
    });

    // Get uploader name for notification
    const uploader = await User.findById(session.user.id).select("name");

    // Create notifications for all other members
    const otherMembers = tour.members.filter(
      (member: any) => member.user.toString() !== session.user.id,
    );

    for (const member of otherMembers) {
      await Notification.create({
        tour: params.id,
        user: member.user,
        type: "document_uploaded",
        title: "Document Uploaded",
        message: `${uploader?.name || "A member"} uploaded document: ${title}`,
        read: false,
      });
    }

    // Add activity
    tour.activities.push({
      user: session.user.id,
      action: "uploaded_document",
      details: `Uploaded document: ${title}`,
      timestamp: new Date(),
    });
    await tour.save();

    const populatedDocument = await Document.findById(document._id)
      .populate("uploadedBy", "name email avatar")
      .lean();

    return NextResponse.json(populatedDocument, { status: 201 });
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 },
    );
  }
}

// GET - Get all documents for a tour
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

    const isMember = tour.members.some(
      (member: any) => member.user.toString() === session.user.id,
    );
    const isOwner = tour.owner.toString() === session.user.id;

    if (!isMember && !isOwner) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const documents = await Document.find({ tour: params.id })
      .populate("uploadedBy", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}