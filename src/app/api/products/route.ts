import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuthUser } from "@/lib/authMiddleware";
import { productSchema } from "@/lib/validations";
import { ALL_LEGACY_PRODUCTS } from "@/lib/legacyProducts";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Auto-seed legacy products if database is empty or missing legacy items
    try {
      const count = await Product.countDocuments({});
      if (count < 20) {
        console.log("Auto-seeding original muki_cards legacy products into database...");
        let defaultArtisan = await User.findOne({ role: { $in: ["artisan", "admin"] } });
        if (!defaultArtisan) {
          defaultArtisan = await User.findOne({});
        }
        if (!defaultArtisan) {
          defaultArtisan = await User.create({
            name: "Suvetha Muki",
            email: "suvetha.muki.artisan@mukicards.com",
            passwordHash: "$2a$10$defaultArtisanHashForSeedingLegacyProducts1",
            role: "artisan",
            bio: "Master craftswoman and founder of Muki Crafty Cards",
          });
        }
        const artisanId = defaultArtisan._id;
        for (const item of ALL_LEGACY_PRODUCTS) {
          const exists = await Product.findOne({ title: item.title });
          if (!exists) {
            await Product.create({
              ...item,
              artisanId,
            });
          }
        }
      }
    } catch (seedErr) {
      console.error("Auto-seed notice:", seedErr);
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "9999999");
    const artisanId = searchParams.get("artisanId") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10); // Show more cards per page

    const query: any = {};
    query.price = { $gte: minPrice, $lte: maxPrice };

    if (category) {
      if (category === "Love Cards" || category === "Love") {
        query.category = { $in: ["Love Cards", "Love"] };
      } else if (category === "Gift Cards" || category === "Gift") {
        query.category = { $in: ["Gift Cards", "Gift", "Birthday", "Anniversary", "Holiday", "Thank You"] };
      } else if (category === "Mini Cards" || category === "Mini") {
        query.category = { $in: ["Mini Cards", "Mini"] };
      } else if (category === "Offer Cards" || category === "Offer") {
        query.category = { $in: ["Offer Cards", "Offer"] };
      } else if (category === "Vintage Cards" || category === "Vintage") {
        query.category = { $in: ["Vintage Cards", "Vintage"] };
      } else if (category === "Oil Painting Cards" || category === "Oil Painting") {
        query.category = { $in: ["Oil Painting Cards", "Oil Painting"] };
      } else if (category === "Book Marks" || category === "Bookmarks") {
        query.category = { $in: ["Book Marks", "Bookmarks"] };
      } else if (category === "Mini Frames" || category === "Mini Frame") {
        query.category = { $in: ["Mini Frames", "Mini Frame", "Mini frames"] };
      } else {
        query.category = category;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (artisanId) {
      query.artisanId = artisanId;
    }

    const user = getAuthUser(req);
    const requestedStatus = searchParams.get("status");

    if (user && user.role === "admin") {
      if (requestedStatus) {
        query.status = requestedStatus;
      }
    } else if (user && user.role === "artisan" && (artisanId === user.userId || !artisanId)) {
      if (requestedStatus) {
        query.status = requestedStatus;
        if (user.role === "artisan") {
          query.artisanId = user.userId;
        }
      } else {
        query.$or = [
          { status: "approved" },
          { artisanId: user.userId }
        ];
      }
    } else {
      query.status = "approved";
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "rating") {
      sortOption = { ratingAvg: -1 };
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("artisanId", "name username");

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("GET Products Error (falling back to legacy products):", error);

    // Fallback to in-memory ALL_LEGACY_PRODUCTS if DB connection fails
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("search") || searchParams.get("category") || "";
    let filtered = ALL_LEGACY_PRODUCTS;
    if (category) {
      filtered = ALL_LEGACY_PRODUCTS.filter((p) =>
        p.category.toLowerCase().includes(category.toLowerCase()) ||
        p.title.toLowerCase().includes(category.toLowerCase())
      );
    }
    return NextResponse.json({
      products: filtered,
      total: filtered.length,
      page: 1,
      pages: 1,
    });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "artisan") {
    return NextResponse.json({ error: "Only artisans can create products" }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const newProduct = new Product({
      ...parsed.data,
      artisanId: user.userId,
      status: "pending",
      ratingAvg: 0,
      reviewCount: 0,
    });

    await newProduct.save();

    return NextResponse.json({ message: "Product created and pending moderation", product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
