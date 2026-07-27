const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ATLAS_URI =
  "mongodb+srv://pandiyagokul_db_user:YTVerL8wdvSPu7U4@cluster0.2lijk8m.mongodb.net/muki_crafty_cards?retryWrites=true&w=majority&appName=Cluster0";

// Define schemas for script execution
const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, enum: ["customer", "artisan", "admin"] },
  loyaltyPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  images: [String],
  category: String,
  tags: [String],
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  stock: Number,
  ratingAvg: Number,
  reviewCount: Number,
  isPersonalizable: Boolean,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  createdAt: { type: Date, default: Date.now },
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      qty: Number,
      price: Number,
    },
  ],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
  },
  paymentRef: String,
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "paid" },
  orderStatus: {
    type: String,
    enum: ["pending", "processed", "shipped", "delivered", "cancelled"],
    default: "processed",
  },
  total: Number,
  pointsRedeemed: Number,
  discountAmount: Number,
  createdAt: { type: Date, default: Date.now },
});

const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: Number,
  comment: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

const ALL_LEGACY_PRODUCTS = [
  // Love Cards
  { title: "Heart Card", description: "A celebratory handcrafted Heart Card with full of love.", price: 20, category: "Love Cards", stock: 25, ratingAvg: 4.9, reviewCount: 14, image: "/cards/love box.jpg" },
  { title: "Small Cards", description: "An elegant handcrafted small cards with full of love.", price: 25, category: "Love Cards", stock: 30, ratingAvg: 4.8, reviewCount: 18, image: "/cards/purplelove.jpg" },
  { title: "Flower Design Card", description: "A floral handcrafted card with watercolor accents.", price: 30, category: "Love Cards", stock: 20, ratingAvg: 5.0, reviewCount: 22, image: "/cards/puzzlelove.jpg" },
  { title: "Simple Love Card", description: "A minimalist love greeting card with embossed foil.", price: 15, category: "Love Cards", stock: 40, ratingAvg: 4.7, reviewCount: 9, image: "/cards/wannabeyours.jpg" },
  { title: "Secret Message Card", description: "A hidden message scratch card for special anniversaries.", price: 35, category: "Love Cards", stock: 15, ratingAvg: 5.0, reviewCount: 31, image: "/cards/sunshine.jpg" },
  { title: "Teddy Card", description: "An adorable teddy bear illustrated popup love card.", price: 40, category: "Love Cards", stock: 18, ratingAvg: 4.9, reviewCount: 12, image: "/cards/bubududu.jpg" },
  { title: "Special Greeting Card", description: "Luxury handmade greeting card with wax seal finish.", price: 50, category: "Love Cards", stock: 12, ratingAvg: 4.9, reviewCount: 27, image: "/cards/cheers.jpg" },
  { title: "Scrapbook Love Edition", description: "A multi-page accordion scrapbook card for couples.", price: 120, category: "Love Cards", stock: 10, ratingAvg: 5.0, reviewCount: 45, image: "/love card.jpg" },
  { title: "Pull-Tab Anniversary Card", description: "Interactive pull-tab card revealing romantic messages.", price: 65, category: "Love Cards", stock: 22, ratingAvg: 4.8, reviewCount: 19, image: "/love card2.jpg" },

  // Vintage Cards
  { title: "Old Script Card", description: "A parchment-textured vintage script card with wax seal.", price: 45, category: "Vintage Cards", stock: 20, ratingAvg: 4.9, reviewCount: 16, image: "/images/vintagecard1.jpg" },
  { title: "Antique Rose Card", description: "Vintage dried rose illustration on handmade paper.", price: 55, category: "Vintage Cards", stock: 15, ratingAvg: 4.8, reviewCount: 21, image: "/images/vintagecard2.jpg" },
  { title: "Victorian Lace Card", description: "Intricate laser-cut lace pattern inspired by Victorian art.", price: 70, category: "Vintage Cards", stock: 12, ratingAvg: 5.0, reviewCount: 34, image: "/images/vintagecard3.jpg" },
  { title: "Sepia Memory Card", description: "A sepia-toned keepsake card with calligraphy inscription.", price: 50, category: "Vintage Cards", stock: 25, ratingAvg: 4.7, reviewCount: 11, image: "/images/vintagecard4.jpg" },
  { title: "Royal Wax Seal Card", description: "A heavy-weight luxury card stamped with gold wax crest.", price: 85, category: "Vintage Cards", stock: 10, ratingAvg: 5.0, reviewCount: 29, image: "/images/vintagecard5.jpg" },
  { title: "Botanical Sketch Card", description: "Hand-drawn botanical flora sketch on rustic paper.", price: 40, category: "Vintage Cards", stock: 30, ratingAvg: 4.9, reviewCount: 18, image: "/images/vintagecard6.jpg" },

  // Gift Cards
  { title: "Birthday Surprise Box", description: "An explosive popup birthday box card with confetti.", price: 150, category: "Gift Cards", stock: 15, ratingAvg: 5.0, reviewCount: 38, image: "/cards/giftcard.jpg" },
  { title: "Luxury Voucher Sleeve", description: "Gold-embossed gift voucher holder with ribbon tie.", price: 45, category: "Gift Cards", stock: 35, ratingAvg: 4.8, reviewCount: 14, image: "/cards/chritmascard.jpg" },
  { title: "Festival Celebration Card", description: "Vibrant festive card with traditional folk motifs.", price: 35, category: "Gift Cards", stock: 40, ratingAvg: 4.9, reviewCount: 25, image: "/cards/newyear.jpg" },
  { title: "Graduation Honor Card", description: "Elegant graduation congratulations card with tassel.", price: 60, category: "Gift Cards", stock: 20, ratingAvg: 4.7, reviewCount: 10, image: "/cards/motivation.jpg" },
  { title: "Baby Shower Keepsake", description: "Pastel watercolor card for welcoming a new baby.", price: 55, category: "Gift Cards", stock: 18, ratingAvg: 5.0, reviewCount: 23, image: "/cards/musiccards.jpg" },

  // Mini Frames
  { title: "Mini Wooden Frame Card", description: "A 4x6 mini handcrafted wooden frame greeting card.", price: 110, category: "Mini Frames", stock: 15, ratingAvg: 4.9, reviewCount: 28, image: "/images/miniframes1.jpg" },
  { title: "Pressed Flower Frame", description: "Real dried wildflowers encased in a mini glass frame card.", price: 180, category: "Mini Frames", stock: 8, ratingAvg: 5.0, reviewCount: 42, image: "/images/miniframes2.jpg" },
  { title: "Polaroid Pocket Frame", description: "A customized polaroid photo greeting card in a desktop frame.", price: 95, category: "Mini Frames", stock: 25, ratingAvg: 4.8, reviewCount: 19, image: "/images/miniframes3.jpg" },
  { title: "Gold Rim Keepsake Frame", description: "A luxury gold-trimmed miniature frame for desk display.", price: 140, category: "Mini Frames", stock: 12, ratingAvg: 5.0, reviewCount: 31, image: "/images/miniframes4.jpg" },
  { title: "Rustic Twine Frame", description: "Handmade jute and wood frame card with calligraphy.", price: 100, category: "Mini Frames", stock: 20, ratingAvg: 4.7, reviewCount: 15, image: "/images/miniframes5.jpg" },

  // Oil Painting Cards
  { title: "Starry Night Impression", description: "Hand-painted oil texture card inspired by Van Gogh.", price: 220, category: "Oil Painting Cards", stock: 6, ratingAvg: 5.0, reviewCount: 39, image: "/images/oilpainting1.jpg" },
  { title: "Sunset Horizon Card", description: "Rich palette knife oil painting of a coastal sunset.", price: 195, category: "Oil Painting Cards", stock: 8, ratingAvg: 4.9, reviewCount: 24, image: "/images/oilpainting2.jpg" },
  { title: "Abstract Floral Oil", description: "Modern textured floral oil painting on canvas cardstock.", price: 180, category: "Oil Painting Cards", stock: 10, ratingAvg: 4.8, reviewCount: 17, image: "/images/oilpainting3.jpg" },
  { title: "Golden Forest Canvas", description: "Autumn forest landscape with gold leaf accents.", price: 250, category: "Oil Painting Cards", stock: 5, ratingAvg: 5.0, reviewCount: 47, image: "/images/oilpainting4.jpg" },
  { title: "Miniature Portrait Art", description: "Customizable hand-painted portrait miniature card.", price: 350, category: "Oil Painting Cards", stock: 4, ratingAvg: 5.0, reviewCount: 52, image: "/images/oilpainting5.jpg" },

  // Additional Catalogue items to reach full legacy count
  { title: "Rose Gold Ribbon Card", description: "Handcrafted card tied with genuine rose gold satin ribbon.", price: 60, category: "Love Cards", stock: 25, ratingAvg: 4.9, reviewCount: 16, image: "/love card3.jpg" },
  { title: "Velvet Touch Greeting", description: "Plush crimson velvet cardstock with gold calligraphy.", price: 75, category: "Love Cards", stock: 18, ratingAvg: 4.8, reviewCount: 14, image: "/love card4.jpg" },
  { title: "Vintage Map Keepsake", description: "Antique world map illustration on textured parchment.", price: 55, category: "Vintage Cards", stock: 20, ratingAvg: 4.9, reviewCount: 19, image: "/images/vintagecard7.jpg" },
  { title: "Calligraphy Monogram Card", description: "Custom initial monogram stamped in gold leaf.", price: 65, category: "Vintage Cards", stock: 30, ratingAvg: 5.0, reviewCount: 28, image: "/images/vintagecard8.jpg" },
  { title: "Wedding Invitation Suite", description: "Handmade wedding card suite with RSVP and wax seal.", price: 450, category: "Gift Cards", stock: 10, ratingAvg: 5.0, reviewCount: 55, image: "/cards/pullout.jpg" },
  { title: "Corporate Gift Card Box", description: "Executive branded handmade card box for partners.", price: 300, category: "Gift Cards", stock: 12, ratingAvg: 4.9, reviewCount: 21, image: "/cards/harrypotter.jpg" },
  { title: "Mini Gallery Frame 1", description: "Exquisite miniature art frame 1 from Muki studio.", price: 90, category: "Mini Frames", stock: 20, ratingAvg: 4.8, reviewCount: 11, image: "/images/miniframes6.jpg" },
  { title: "Mini Gallery Frame 2", description: "Exquisite miniature art frame 2 from Muki studio.", price: 90, category: "Mini Frames", stock: 20, ratingAvg: 4.8, reviewCount: 13, image: "/images/miniframes7.jpg" },
  { title: "Mini Gallery Frame 3", description: "Exquisite miniature art frame 3 from Muki studio.", price: 95, category: "Mini Frames", stock: 18, ratingAvg: 4.9, reviewCount: 15, image: "/images/miniframes8.jpg" },
  { title: "Mini Gallery Frame 4", description: "Exquisite miniature art frame 4 from Muki studio.", price: 95, category: "Mini Frames", stock: 18, ratingAvg: 4.9, reviewCount: 17, image: "/images/miniframes9.jpg" },
  { title: "Oil Impression 1", description: "Hand-painted miniature oil impression 1 on canvas card.", price: 160, category: "Oil Painting Cards", stock: 10, ratingAvg: 5.0, reviewCount: 22, image: "/images/oilpainting6.jpg" },
  { title: "Oil Impression 2", description: "Hand-painted miniature oil impression 2 on canvas card.", price: 160, category: "Oil Painting Cards", stock: 10, ratingAvg: 5.0, reviewCount: 20, image: "/images/oilpainting7.jpg" },
  { title: "Oil Impression 3", description: "Hand-painted miniature oil impression 3 on canvas card.", price: 175, category: "Oil Painting Cards", stock: 8, ratingAvg: 4.9, reviewCount: 18, image: "/images/oilpainting8.jpg" },
  { title: "Oil Impression 4", description: "Hand-painted miniature oil impression 4 on canvas card.", price: 175, category: "Oil Painting Cards", stock: 8, ratingAvg: 4.9, reviewCount: 25, image: "/images/oilpainting9.jpg" },
  { title: "Oil Impression 5", description: "Hand-painted miniature oil impression 5 on canvas card.", price: 190, category: "Oil Painting Cards", stock: 7, ratingAvg: 5.0, reviewCount: 29, image: "/images/oilpainting10.jpg" },
];

async function migrateToAtlas() {
  console.log("=================================================================");
  console.log("🚀 MUKI CRAFTY CARDS - MONGODB ATLAS DATABASE MIGRATION SCRIPT");
  console.log("=================================================================");
  console.log(`📡 Connecting to MongoDB Atlas cluster0.2lijk8m.mongodb.net...`);

  await mongoose.connect(ATLAS_URI);
  console.log("✅ Successfully connected to MongoDB Atlas (muki_crafty_cards DB)!");

  // 1. Create Users
  console.log("\n📦 1/4. Seeding Users (Master Artisan, Customer & Admin)...");
  const hashedArtisanPW = await bcrypt.hash("muki2026", 10);
  const hashedCustomerPW = await bcrypt.hash("muki2026", 10);
  const hashedAdminPW = await bcrypt.hash("muki2026", 10);

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
    console.log("   --> Created Master Artisan: Suvetha Muki");
  } else {
    console.log("   --> Found existing Master Artisan: Suvetha Muki");
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
    console.log("   --> Created Demo Customer: Gokul Customer");
  } else {
    console.log("   --> Found existing Demo Customer: Gokul Customer");
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
    console.log("   --> Created System Admin: Admin Board Manager");
  } else {
    console.log("   --> Found existing System Admin: Admin Board Manager");
  }

  // 2. Seed & Update All Legacy Products with authentic distinct images
  console.log(`\n📦 2/4. Migrating & Updating ${ALL_LEGACY_PRODUCTS.length} Legacy Products in MongoDB Atlas...`);
  let createdCount = 0;
  let updatedCount = 0;
  for (const item of ALL_LEGACY_PRODUCTS) {
    let existing = await Product.findOne({ title: item.title });
    if (existing) {
      existing.images = [item.image];
      existing.price = item.price;
      existing.category = item.category;
      existing.description = item.description;
      existing.stock = item.stock || 25;
      await existing.save();
      updatedCount++;
    } else {
      await Product.create({
        title: item.title,
        description: item.description,
        price: item.price,
        images: [item.image],
        category: item.category,
        tags: [item.category.toLowerCase().replace(/\s+/g, "-"), "handcrafted", "muki2026"],
        artisanId: artisan._id,
        stock: item.stock || 25,
        ratingAvg: item.ratingAvg || 4.9,
        reviewCount: item.reviewCount || 15,
        isPersonalizable: true,
        status: "approved",
      });
      createdCount++;
    }
  }

  // Also clean up any other products in MongoDB Atlas to ensure no duplicate Pi images
  const allDbProducts = await Product.find({});
  const oilImages = [
    "/images/oilpainting1.jpg", "/images/oilpainting2.jpg", "/images/oilpainting3.jpg",
    "/images/oilpainting4.jpg", "/images/oilpainting5.jpg", "/images/oilpainting6.jpg",
    "/images/oilpainting7.jpg", "/images/oilpainting8.jpg", "/images/oilpainting9.jpg",
    "/images/oilpainting10.jpg", "/images/oilpainting11.jpg", "/images/oilpainting12.jpg"
  ];
  const miniImages = [
    "/images/miniframes1.jpg", "/images/miniframes2.jpg", "/images/miniframes3.jpg",
    "/images/miniframes4.jpg", "/images/miniframes5.jpg", "/images/miniframes6.jpg",
    "/images/miniframes7.jpg", "/images/miniframes8.jpg", "/images/miniframes9.jpg",
    "/images/miniframes10.jpg"
  ];
  for (let i = 0; i < allDbProducts.length; i++) {
    const p = allDbProducts[i];
    if (p.category === "Oil Painting Cards" || p.title.includes("Oil")) {
      p.images = [oilImages[i % oilImages.length]];
      await p.save();
    } else if (p.category === "Mini Frames" || p.title.includes("Mini Gallery")) {
      p.images = [miniImages[i % miniImages.length]];
      await p.save();
    }
  }

  console.log(`   --> Updated ${updatedCount} products and created ${createdCount} new products (${await Product.countDocuments()} total products in Atlas DB).`);

  // 3. Seed Real-time Sample Orders for Payment Methods
  console.log("\n📦 3/4. Seeding Real-Time Orders for UPI, Razorpay Card, PayPal & COD...");
  const orderCount = await Order.countDocuments();
  if (orderCount === 0) {
    const products = await Product.find().limit(5);
    if (products.length > 0) {
      const sampleOrders = [
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
      ];
      await Order.insertMany(sampleOrders);
      console.log(`   --> Inserted ${sampleOrders.length} real-time orders into MongoDB Atlas.`);
    }
  } else {
    console.log(`   --> ${orderCount} real-time orders already exist in MongoDB Atlas.`);
  }

  // 4. Seed Verified Reviews
  console.log("\n📦 4/4. Seeding Verified Artisan Reviews...");
  const reviewCount = await Review.countDocuments();
  if (reviewCount === 0) {
    const p1 = await Product.findOne({ title: "Heart Card" });
    const p2 = await Product.findOne({ title: "Small Cards" });
    if (p1 && p2) {
      await Review.create([
        {
          productId: p1._id,
          userId: customer._id,
          rating: 5,
          comment: "Absolutely breathtaking craftsmanship! The wax seal and watercolor textures are 100% real.",
          images: [],
        },
        {
          productId: p2._id,
          userId: customer._id,
          rating: 5,
          comment: "Suvetha Muki is a true artisan! Ordered using UPI QR code and received it in 3 days.",
          images: [],
        },
      ]);
      console.log("   --> Seeded verified customer reviews.");
    }
  } else {
    console.log(`   --> ${reviewCount} reviews already exist in MongoDB Atlas.`);
  }

  const finalUserCount = await User.countDocuments();
  const finalProductCount = await Product.countDocuments();
  const finalOrderCount = await Order.countDocuments();
  const finalReviewCount = await Review.countDocuments();

  console.log("\n=================================================================");
  console.log("✨ MIGRATION TO MONGODB ATLAS COMPLETE! DATABASE SUMMARY:");
  console.log(`   👤 Total Users    : ${finalUserCount}`);
  console.log(`   🎨 Total Products : ${finalProductCount}`);
  console.log(`   🛒 Total Orders   : ${finalOrderCount}`);
  console.log(`   ⭐ Total Reviews  : ${finalReviewCount}`);
  console.log("=================================================================\n");

  mongoose.connection.close();
}

migrateToAtlas().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
