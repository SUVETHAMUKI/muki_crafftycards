import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import { getAuthUser } from "@/lib/authMiddleware";
import { z } from "zod";

const reviewSubmitSchema = z.object({
  productId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  images: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .populate("userId", "name username");

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("GET Reviews Error:", error);
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

    const parsed = reviewSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { productId, rating, comment, images } = parsed.data;

    const existingReview = await Review.findOne({ productId, userId: user.userId });
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
    }

    const review = new Review({
      productId,
      userId: user.userId,
      rating,
      comment,
      images,
    });

    await review.save();

    return NextResponse.json({ message: "Review submitted successfully", review }, { status: 201 });
  } catch (error: any) {
    console.error("POST Review Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
