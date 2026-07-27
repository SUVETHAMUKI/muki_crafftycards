import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { getAuthUser } from "@/lib/authMiddleware";
import { productSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id).populate("artisanId", "name username email");
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.status !== "approved") {
      const user = getAuthUser(req);
      const isOwner = user && user.userId === product.artisanId._id.toString();
      const isAdmin = user && user.role === "admin";
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("GET Product ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isOwner = user.userId === product.artisanId.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (isAdmin) {
      const { status, title, description, price, category, tags, stock, images, isPersonalizable } = body;
      if (status) product.status = status;
      if (title) product.title = title;
      if (description) product.description = description;
      if (price !== undefined) product.price = price;
      if (category) product.category = category;
      if (tags) product.tags = tags;
      if (stock !== undefined) product.stock = stock;
      if (images) product.images = images;
      if (isPersonalizable !== undefined) product.isPersonalizable = isPersonalizable;
    } else {
      const parsed = productSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const { title, description, price, category, tags, stock, images, isPersonalizable } = parsed.data;
      product.title = title;
      product.description = description;
      product.price = price;
      product.category = category;
      product.tags = tags;
      product.stock = stock;
      product.images = images;
      product.isPersonalizable = isPersonalizable;
      product.status = "pending";
    }

    await product.save();

    return NextResponse.json({ message: "Product updated successfully", product });
  } catch (error: any) {
    console.error("PUT Product ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isOwner = user.userId === product.artisanId.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Product ID Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
