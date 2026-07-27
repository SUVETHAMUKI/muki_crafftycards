import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { requireRole } from "@/lib/authMiddleware";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectToDatabase();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("GET All Orders Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
