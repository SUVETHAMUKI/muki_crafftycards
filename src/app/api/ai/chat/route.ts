import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from "@/lib/db";
import { getAuthUser } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limiter = rateLimit(req, 5, 60 * 1000);
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many chatbot requests. Please wait a minute." }, { status: 429 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    let orderContextText = "No orders found.";
    const user = getAuthUser(req);

    if (user) {
      await connectToDatabase();
      const userOrders = await Order.find({ userId: user.userId }).sort({ createdAt: -1 }).limit(3);

      if (userOrders.length > 0) {
        orderContextText = userOrders
          .map(
            (o) =>
              `- Order ID: ${o._id}, Placed: ${o.createdAt.toLocaleDateString()}, Total: ₹${o.total}, Payment: ${o.paymentStatus}, Delivery Status: ${o.orderStatus}`
          )
          .join("\n");
      }
    }

    const systemPrompt = `You are "Muki Assistant", the friendly AI support chatbot for Muki Crafty Cards (a premium handcrafted greeting card marketplace).
Answer customer questions based on the store information and user order context.

FAQs:
- Shipping time: 3 to 5 business days across India.
- Shipping charges: ₹40 flat rate; free shipping on orders above ₹500.
- Personalization: Customers can add custom text and photos to card templates using our Personalization Studio canvas editor on the card details page.
- Returns: Custom cards cannot be returned or cancelled once processed. Standard cards can be returned within 7 days if unused.
- Loyalty rewards: Earn 1 point per ₹10 spent. Redeem points at checkout: 10 points = ₹1 off.
- Artisan commission: Artisans design templates and earn 10% commission on every card sold.

Current Authenticated User Context:
- User Logged In: ${user ? `Yes (${user.email})` : "No (Guest User)"}
- User Recent Orders:
${orderContextText}

Guidelines:
- Keep answers concise, polite, and helpful (max 2-3 sentences).
- If the user asks about order status, look up the info in the Order Context above and summarize it.
- If the user is not logged in and asks about their orders, tell them to log in first.
- If you don't know the answer, tell them to contact support at support@mukicraftycards.com.
- Do NOT make up any order details or reference order IDs not listed above.`;

    if (!apiKey) {
      return NextResponse.json({
        response: `Hello! I am Muki Assistant. (AI Sandbox mode). Here is your order status:\n${orderContextText.replace(
          /-/g,
          "•"
        )}\n\nConfigure GEMINI_API_KEY in env variables to enable smart AI responses.`,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I will act as Muki Assistant and help the user with their questions and order lookup queries using this context.",
          },
        ],
      },
    ];

    const recentMessages = messages.slice(-6);
    recentMessages.forEach((msg: any) => {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    });

    const result = await model.generateContent({ contents });
    const responseText = result.response.text().trim();

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
