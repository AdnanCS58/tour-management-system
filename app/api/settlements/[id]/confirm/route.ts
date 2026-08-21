import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Settlement from "@/models/Settlement";
import Tour from "@/models/Tour";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log("🔵 CONFIRM SETTLEMENT API CALLED");
  
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const settlement = await Settlement.findById(params.id);

    if (!settlement) {
      return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
    }

    // Only the receiver (to) can confirm
    if (settlement.to.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the receiver can confirm this settlement" },
        { status: 403 },
      );
    }

    if (settlement.status === 'completed') {
      return NextResponse.json(
        { error: "This settlement is already confirmed" },
        { status: 400 },
      );
    }

    // Update settlement
    settlement.status = 'completed';
    settlement.confirmedBy = session.user.id;
    settlement.confirmedAt = new Date();
    await settlement.save();

    // Update tour with settled payment
    const tour = await Tour.findById(settlement.tour);
    
    if (tour) {
      // Use (tour as any) to avoid TypeScript error
      const tourAny = tour as any;
      
      if (!tourAny.settledPayments) {
        tourAny.settledPayments = [];
      }
      
      tourAny.settledPayments.push({
        from: settlement.from,
        to: settlement.to,
        amount: settlement.amount,
        settlementId: settlement._id,
        confirmedAt: new Date(),
      });
      
      tourAny.activities.push({
        user: session.user.id,
        action: 'settlement_confirmed',
        details: `Settlement confirmed: ৳${settlement.amount}`,
        timestamp: new Date(),
      });
      
      await tourAny.save();
    }

    return NextResponse.json({ 
      message: "Settlement confirmed successfully",
      settlement 
    });
  } catch (error) {
    console.error("❌ CONFIRM SETTLEMENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to confirm settlement: " + (error as Error).message },
      { status: 500 },
    );
  }
}