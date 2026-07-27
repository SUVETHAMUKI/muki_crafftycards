import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Review from "@/models/Review";
import bcrypt from "bcrypt";
import { ALL_LEGACY_PRODUCTS } from "@/lib/legacyProducts";

export async function GET(req: NextRequest) {
  return await runMigration();
}

export async function POST(req: NextRequest) {
  return await runMigration();
}

async function runMigration() {
  try {
    await connectToDatabase();

    // 1. Seed Users
    const hashedArtisanPW = await bcrypt.hash("muki2026", 10);
    const hashedCustomerPW = await bcrypt.hash("muki2026", 10);
    const hashedAdminPW = await bcrypt.hash("admin2026", 10);

    let artisan = await User.findOne({ email: "suvetha@mukicraftycards.com" });
    if (!artisan) {
      artisan = await User.create({
        name: "Suvetha Muki",
        username: "suvetha_muki",
        email: "suvetha@mukicraftycards.com",
        phone: "+91 98765 43210",
        passwordHash: hashedArtisanPW,
        role: "artisan",
        loyaltyPoints: 1200,
      });
    }

    let customer = await User.findOne({ email: "gokul@mukicraftycards.com" });
    if (!customer) {
      customer = await User.create({
        name: "Gokul Customer",
        username: "gokul_customer",
        email: "gokul@mukicraftycards.com",
        phone: "+91 91234 56789",
        passwordHash: hashedCustomerPW,
        role: "customer",
        loyaltyPoints: 450,
      });
    }

    let admin = await User.findOne({ email: "admin@mukicraftycards.com" });
    if (!admin) {
      admin = await User.create({
        name: "Admin Board Manager",
        username: "admin_muki",
        email: "admin@mukicraftycards.com",
        phone: "+91 99999 88888",
        passwordHash: hashedAdminPW,
        role: "admin",
        loyaltyPoints: 5000,
      });
    }

    // 2. Seed All Legacy Products
    let createdProductsCount = 0;
    for (const item of ALL_LEGACY_PRODUCTS) {
      let existing = await Product.findOne({ title: item.title });
      if (!existing) {
        await Product.create({
          title: item.title,
          description: item.description,
          price: item.price,
          images: ["/product1.jpg"],
          category: item.category,
          tags: [item.category.toLowerCase().replace(/\s+/g, "-"), "handcrafted", "muki2026"],
          artisanId: artisan._id,
          stock: item.stock || 25,
          ratingAvg: item.ratingAvg || 4.9,
          reviewCount: item.reviewCount || 15,
          isPersonalizable: true,
          status: "approved",
        });
        createdProductsCount++;
      }
    }

    // 3. Seed Real-time Sample Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const products = await Product.find().limit(5);
      if (products.length > 0) {
        await Order.insertMany([
          {
            userId: customer._id,
            items: [{ productId: products[0]._id, qty: 2, price: products[0].price }],
            shippingAddress: {
              name: "Gokul Customer",
              street: "116B Paraimettu Street, Aranmanaikulam",
              city: "Dindigul",
              state: "Tamil Nadu",
              zipCode: "624001",
              phone: "431123456788",
            },
            paymentRef: "UPI-UTR-420183920192",
            paymentStatus: "paid",
            orderStatus: "delivered",
            total: products[0].price * 2,
          },
          {
            userId: customer._id,
            items: [{ productId: products[1]._id, qty: 1, price: products[1].price }],
            shippingAddress: {
              name: "Gokul Customer",
              street: "116B Paraimettu Street",
              city: "Dindigul",
              state: "Tamil Nadu",
              zipCode: "624001",
              phone: "431123456788",
            },
            paymentRef: "RZP-PAY-88291039",
            paymentStatus: "paid",
            orderStatus: "processed",
            total: products[1].price,
          },
          {
            userId: customer._id,
            items: [{ productId: products[2]._id, qty: 3, price: products[2].price }],
            shippingAddress: {
              name: "Gokul Customer",
              street: "116B Paraimettu Street",
              city: "Dindigul",
              state: "Tamil Nadu",
              zipCode: "624001",
              phone: "431123456788",
            },
            paymentRef: "PAYPAL-TX-99827163",
            paymentStatus: "paid",
            orderStatus: "shipped",
            total: products[2].price * 3,
          },
          {
            userId: customer._id,
            items: [{ productId: products[3]._id, qty: 2, price: products[3].price }],
            shippingAddress: {
              name: "Gokul Customer",
              street: "116B Paraimettu Street",
              city: "Dindigul",
              state: "Tamil Nadu",
              zipCode: "624001",
              phone: "431123456788",
            },
            paymentRef: "COD-RECEIPT-5542",
            paymentStatus: "pending",
            orderStatus: "pending",
            total: products[3].price * 2,
          },
        ]);
      }
    }

    const finalUserCount = await User.countDocuments();
    const finalProductCount = await Product.countDocuments();
    const finalOrderCount = await Order.countDocuments();
    const finalReviewCount = await Review.countDocuments();

    return NextResponse.json({
      success: true,
      message: "Successfully migrated & seeded data to MongoDB Atlas cluster!",
      stats: {
        users: finalUserCount,
        products: finalProductCount,
        orders: finalOrderCount,
        reviews: finalReviewCount,
      },
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run migration" },
      { status: 500 }
    );
  }
}
