import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/authMiddleware";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const dbUser = await User.findById(user.userId).populate({
      path: "wishlist",
      select: "title price images stock category isPersonalizable ratingAvg",
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ wishlist: dbUser.wishlist });
  } catch (error: any) {
    console.error("GET Wishlist Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const index = dbUser.wishlist.indexOf(productId);
    let message = "";
    if (index > -1) {
      dbUser.wishlist.splice(index, 1);
      message = "Removed from wishlist";
    } else {
      dbUser.wishlist.push(productId);
      message = "Added to wishlist";
    }

    await dbUser.save();

    return NextResponse.json({ message, wishlist: dbUser.wishlist });
  } catch (error: any) {
    console.error("POST Wishlist Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
