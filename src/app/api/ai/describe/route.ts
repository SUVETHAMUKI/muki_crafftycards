import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthUser } from "@/lib/authMiddleware";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || (user.role !== "artisan" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limiter = rateLimit(req, 10, 60 * 1000);
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        description:
          "This is a fallback description representing your handcrafted card. Configure your GEMINI_API_KEY environment variable to generate creative AI product description drafts automatically.",
      });
    }

    const { title, category, tags } = await req.json();

    if (!title || !category) {
      return NextResponse.json({ error: "Title and Category are required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Write a charming, creative, and persuasive e-commerce product description (around 100-150 words) for a handcrafted greeting card.
Product Title: "${title}"
Category: "${category}"
Tags: ${tags ? tags.join(", ") : "none"}

Focus on the emotional value, craftsmanship, and why this card is perfect for the recipient. Keep the tone warm and friendly.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ description: text });
  } catch (error: any) {
    console.error("Gemini Describe Error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
