import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/models/Cart";
import User from "@/models/User";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/authMiddleware";
import { z } from "zod";

const checkoutSchema = z.object({
  shippingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    phone: z.string(),
  }),
  redeemPoints: z.coerce.number().nonnegative().default(0),
});

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { shippingAddress, redeemPoints } = parsed.data;

    const cart = await Cart.findOne({ userId: user.userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (redeemPoints > dbUser.loyaltyPoints) {
      return NextResponse.json({ error: "Insufficient loyalty points" }, { status: 400 });
    }

    const subtotal = cart.items.reduce((acc: number, item: any) => {
      const price = item.productId?.price || 0;
      return acc + price * item.qty;
    }, 0);

    const shipping = subtotal > 500 ? 0 : 40;
    const discountAmount = Math.min(redeemPoints / 10, subtotal);
    const total = subtotal + shipping - discountAmount;

    const orderItems = cart.items.map((item: any) => ({
      productId: item.productId._id,
      qty: item.qty,
      price: item.productId.price,
      personalization: item.personalization,
    }));

    const newOrder = new Order({
      userId: user.userId,
      items: orderItems,
      shippingAddress,
      paymentStatus: "pending",
      orderStatus: "pending",
      total,
      pointsRedeemed: redeemPoints,
      discountAmount,
    });

    await newOrder.save();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrder = null;
    let isMock = true;

    if (keyId && keySecret) {
      try {
        const Razorpay = require("razorpay");
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const amountInPaisa = Math.round(total * 100);

        razorpayOrder = await rzp.orders.create({
          amount: amountInPaisa,
          currency: "INR",
          receipt: newOrder._id.toString(),
        });
        isMock = false;
      } catch (err) {
        console.warn("Razorpay API initialization failed, falling back to mock mode:", err);
      }
    }

    return NextResponse.json({
      orderId: newOrder._id,
      total,
      isMock,
      razorpayOrder,
      keyId: keyId || "mock_key_id",
    });
  } catch (error: any) {
    console.error("Payment Order Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
