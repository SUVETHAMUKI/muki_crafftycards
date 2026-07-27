import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import { getAuthUser } from "@/lib/authMiddleware";
import { sendEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      orderId,
      isMock,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isMock) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return NextResponse.json({ error: "Razorpay configuration missing on server" }, { status: 500 });
      }

      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        order.paymentStatus = "failed";
        await order.save();
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    order.paymentStatus = "paid";
    order.paymentRef = razorpay_payment_id || "mock_payment_ref";
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty },
      });
    }

    const dbUser = await User.findById(user.userId);
    if (dbUser) {
      dbUser.loyaltyPoints -= order.pointsRedeemed;
      const pointsEarned = Math.floor(order.total / 10);
      dbUser.loyaltyPoints += pointsEarned;
      await dbUser.save();
    }

    if (dbUser) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #4f46e5; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Order Confirmation</h2>
          <p>Hi ${dbUser.name},</p>
          <p>Thank you for your purchase from <strong>Muki Crafty Cards</strong>! Your order has been successfully placed and is being processed.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0;"><strong>Order ID:</strong> ${order._id}</p>
            <p style="margin: 5px 0 0 0;"><strong>Amount Paid:</strong> ₹${order.total}</p>
            <p style="margin: 5px 0 0 0;"><strong>Shipping Recipient:</strong> ${order.shippingAddress.name}</p>
          </div>
          <p>We'll notify you as soon as your greeting cards are shipped. In the meantime, you can track the status of your order on your order history page.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">If you have any questions, reply to this email or contact support at support@mukicraftycards.com.</p>
        </div>
      `;

      sendEmail({
        to: dbUser.email,
        subject: `Muki Crafty Cards - Order Confirmed! (ID: ${order._id})`,
        text: `Hi ${dbUser.name},\n\nThank you for your purchase from Muki Crafty Cards! Your order of ID: ${order._id} has been placed. Amount Paid: ₹${order.total}. Track your delivery live in your order history.\n\nWarm regards,\nMuki Support`,
        html: emailHtml,
      }).catch((e) => console.error("Order confirmation email failed to send:", e));
    }

    await Cart.findOneAndDelete({ userId: user.userId });

    return NextResponse.json({
      message: "Payment verified and order completed",
      order,
    });
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
