import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/models/Cart";
import { getAuthUser } from "@/lib/authMiddleware";
import { z } from "zod";

const cartAddSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1).default(1),
  personalization: z
    .object({
      customImage: z.string(),
      canvasJson: z.string(),
    })
    .optional(),
});

const cartUpdateSchema = z.object({
  itemId: z.string(),
  qty: z.number().int().min(1),
});

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    let cart = await Cart.findOne({ userId: user.userId }).populate({
      path: "items.productId",
      select: "title price images stock category isPersonalizable",
    });

    if (!cart) {
      cart = new Cart({ userId: user.userId, items: [] });
      await cart.save();
    }

    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error("GET Cart Error:", error);
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

    const parsed = cartAddSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { productId, qty, personalization } = parsed.data;

    let cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      cart = new Cart({ userId: user.userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex((item: any) => {
      const matchProduct = item.productId.toString() === productId;
      if (!matchProduct) return false;

      if (personalization && item.personalization) {
        return item.personalization.customImage === personalization.customImage;
      }
      if (!personalization && !item.personalization) {
        return true;
      }
      return false;
    });

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].qty += qty;
    } else {
      cart.items.push({
        productId,
        qty,
        personalization,
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    return NextResponse.json({ message: "Item added to cart", cart });
  } catch (error: any) {
    console.error("POST Cart Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();

    const parsed = cartUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { itemId, qty } = parsed.data;

    const cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    item.qty = qty;
    cart.updatedAt = new Date();
    await cart.save();

    return NextResponse.json({ message: "Cart updated", cart });
  } catch (error: any) {
    console.error("PUT Cart Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);
    cart.updatedAt = new Date();
    await cart.save();

    return NextResponse.json({ message: "Item removed from cart", cart });
  } catch (error: any) {
    console.error("DELETE Cart Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
