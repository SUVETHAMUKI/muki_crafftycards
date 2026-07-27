import { test, expect } from "vitest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User";
import Artisan from "../models/Artisan";
import Product from "../models/Product";
import { connectToDatabase } from "../lib/db";

test("Seed database with initial mockup data", async () => {
  await connectToDatabase();

  await User.deleteMany({});
  await Artisan.deleteMany({});
  await Product.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await User.create({
    name: "Muki Admin",
    username: "mukiadmin",
    email: "admin@mukicraftycards.com",
    passwordHash: passwordHash,
    role: "admin",
  });

  const artisanUser = await User.create({
    name: "Kavin Kumar (Artisan)",
    username: "kavinartisan",
    email: "artisan@mukicraftycards.com",
    passwordHash: passwordHash,
    role: "artisan",
  });

  const customer = await User.create({
    name: "Pandi Customer",
    username: "pandicustomer",
    email: "customer@mukicraftycards.com",
    passwordHash: passwordHash,
    role: "customer",
  });

  const artisanProfile = await Artisan.create({
    userId: artisanUser._id,
    bio: "Independent watercolor illustrator specializing in floral greeting cards and custom pastel typography designs.",
    commissionRate: 0.1,
    portfolioImages: ["/cards/oilpaintingframe.jpg", "/cards/oilpaintingframe1.jpg"],
  });

  const productsData = [
    {
      title: "Pastel Birthday Balloons",
      description:
        "Celebrate their special day with this charming pastel card featuring hand-drawn watercolor balloons and rose gold lettering.",
      price: 120,
      category: "Birthday",
      tags: ["birthday", "watercolor", "pastel", "balloons"],
      stock: 100,
      images: ["/cards/greetingcard.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 5,
      reviewCount: 1,
    },
    {
      title: "Golden Confetti Celebration",
      description:
        "Send high-energy birthday wishes with a vibrant background detailed with floating golden confetti sprinkles.",
      price: 160,
      category: "Birthday",
      tags: ["birthday", "confetti", "gold", "festive"],
      stock: 60,
      images: ["/cards/cheers.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Cute Animals Party",
      description:
        "A lovely children's birthday template illustrated with smiling woodland animals carrying gifts and cake.",
      price: 110,
      category: "Birthday",
      tags: ["birthday", "kids", "animals", "illustration"],
      stock: 80,
      images: ["/cards/bubududu.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Golden Anniversary Roses",
      description:
        "A gorgeous luxury anniversary template detailed with detailed golden foil roses and elegant script typography.",
      price: 150,
      category: "Anniversary",
      tags: ["anniversary", "roses", "gold", "floral"],
      stock: 50,
      images: ["/cards/purplelove.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 4.8,
      reviewCount: 3,
    },
    {
      title: "Modern Watercolor Hearts",
      description:
        "Mark your anniversary milestones with this minimalist design detailed with intertwined pink and purple watercolor hearts.",
      price: 130,
      category: "Anniversary",
      tags: ["anniversary", "hearts", "watercolor", "love"],
      stock: 90,
      images: ["/cards/puzzlelove.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Cozy Snowman Holiday",
      description:
        "Send warm wishes this winter with a cute watercolor snowman card, perfect for Christmas greeting and holiday cheer.",
      price: 95,
      category: "Holiday",
      tags: ["holiday", "christmas", "snowman", "winter"],
      stock: 120,
      images: ["/cards/chritmascard.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Festive Christmas Wreath",
      description:
        "A classic Christmas design featuring a rich green pine wreath decorated with bright red holly berries and golden ribbons.",
      price: 110,
      category: "Holiday",
      tags: ["holiday", "christmas", "wreath", "pine"],
      stock: 100,
      images: ["/cards/newyear.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Elegant Diwali Sparkles",
      description:
        "Celebrate the festival of lights with this premium card decorated with warm oil diyas and circular mandala art.",
      price: 140,
      category: "Holiday",
      tags: ["holiday", "diwali", "diyas", "mandala"],
      stock: 80,
      images: ["/cards/glasspainting.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Minimalist Botanical Thank You",
      description:
        "A clean and modern thank you card featuring delicate eucalyptus leaf details on textured cardstock.",
      price: 80,
      category: "Thank You",
      tags: ["thank-you", "botanical", "minimalist", "eucalyptus"],
      stock: 150,
      images: ["/cards/sunshine.jpg"],
      isPersonalizable: false,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 4.5,
      reviewCount: 2,
    },
    {
      title: "Chalkboard Gratitude Lettering",
      description:
        "Express your appreciation in vintage style with white chalk lettering details surrounded by cute flower sketches.",
      price: 90,
      category: "Thank You",
      tags: ["thank-you", "vintage", "chalkboard", "typography"],
      stock: 110,
      images: ["/cards/motivation.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Floating Hearts Romantic Love",
      description:
        "Perfect for Valentine's Day or just because, this sweet layout contains hanging watercolor hearts on a pink backdrop.",
      price: 130,
      category: "Love",
      tags: ["love", "valentines", "hearts", "watercolor"],
      stock: 75,
      images: ["/cards/love box.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Starry Night Love Letter",
      description:
        "Write a love message on a dark blue background matching starry constellations and a shining crescent moon.",
      price: 145,
      category: "Love",
      tags: ["love", "starry-night", "constellation", "romantic"],
      stock: 60,
      images: ["/cards/wannabeyours.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Soft Watercolor Lilies Sympathy",
      description:
        "Send comforting words with this peaceful card painted with soft white calla lilies and quiet green leaves.",
      price: 105,
      category: "Sympathy",
      tags: ["sympathy", "comfort", "lilies", "watercolor"],
      stock: 90,
      images: ["/cards/asthetic.jpg"],
      isPersonalizable: false,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Get Well Soon Wildflowers",
      description: "Brighten their recovery space with a cheerful mix of hand-drawn yellow and blue wildflowers.",
      price: 110,
      category: "Get Well",
      tags: ["get-well", "wildflowers", "cheer", "recovery"],
      stock: 80,
      images: ["/cards/world.jpg"],
      isPersonalizable: false,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
    {
      title: "Sunny Citrus Recovery",
      description:
        "Wish them a swift recovery with this cheerful, bright card illustrated with fresh orange and lemon branch slices.",
      price: 115,
      category: "Get Well",
      tags: ["get-well", "citrus", "orange", "bright"],
      stock: 100,
      images: ["/cards/vintage.jpg"],
      isPersonalizable: true,
      status: "approved",
      artisanId: artisanUser._id,
      ratingAvg: 0,
      reviewCount: 0,
    },
  ];

  await Product.create(productsData);

  await mongoose.connection.close();

  expect(true).toBe(true);
});
