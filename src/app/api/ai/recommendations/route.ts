import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      const products = await Product.find({ status: "approved" })
        .sort({ ratingAvg: -1, reviewCount: -1 })
        .limit(3);
      return NextResponse.json({ products });
    }

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const products = await Product.find({
      _id: { $ne: currentProduct._id },
      status: "approved",
      $or: [
        { category: currentProduct.category },
        { tags: { $in: currentProduct.tags } }
      ],
    })
      .sort({ ratingAvg: -1, reviewCount: -1 })
      .limit(3);

    if (products.length < 3) {
      const fillCount = 3 - products.length;
      const existingIds = [currentProduct._id, ...products.map((p) => p._id)];
      const fillProducts = await Product.find({
        _id: { $nin: existingIds },
        status: "approved",
      })
        .sort({ ratingAvg: -1 })
        .limit(fillCount);

      products.push(...fillProducts);
    }

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("GET Recommendations Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
