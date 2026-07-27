import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limiter = rateLimit(req, 10, 60 * 1000);
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    await connectToDatabase();
    const body = await req.json();

    // Auto-generate username if not provided or empty
    if (!body.username) {
      const base = body.name || (body.email ? body.email.split("@")[0] : "user");
      const clean = base
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .padEnd(3, "0")
        .slice(0, 15);
      body.username = `${clean}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, username, email, phone, password, role } = parsed.data;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      phone,
      passwordHash,
      role,
    });

    await user.save();

    return NextResponse.json(
      { message: "Registration successful", userId: user._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
