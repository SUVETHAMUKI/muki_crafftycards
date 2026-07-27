const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ATLAS_URI = "mongodb+srv://pandiyagokul_db_user:YTVerL8wdvSPu7U4@cluster0.2lijk8m.mongodb.net/muki_crafty_cards?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, enum: ["customer", "artisan", "admin"], default: "customer" },
  loyaltyPoints: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  console.log("Connecting to Atlas...");
  await mongoose.connect(ATLAS_URI);
  console.log("Connected! Checking/updating admin accounts...");

  const hashMuki2026 = await bcrypt.hash("muki2026", 10);

  // Update or create admin@mukicraftycards.com
  let admin1 = await User.findOne({ email: "admin@mukicraftycards.com" });
  if (!admin1) {
    await User.create({
      name: "Admin Board Manager",
      username: "admin_muki",
      email: "admin@mukicraftycards.com",
      phone: "+91 99999 88888",
      passwordHash: hashMuki2026,
      role: "admin",
      loyaltyPoints: 5000,
    });
    console.log("Created admin@mukicraftycards.com");
  } else {
    admin1.passwordHash = hashMuki2026;
    await admin1.save();
    console.log("Updated password for admin@mukicraftycards.com to muki2026");
  }

  // Update or create admin@mukicards.com
  let admin2 = await User.findOne({ email: "admin@mukicards.com" });
  if (!admin2) {
    await User.create({
      name: "Admin Board Manager",
      username: "admin_muki_short",
      email: "admin@mukicards.com",
      phone: "+91 99999 88888",
      passwordHash: hashMuki2026,
      role: "admin",
      loyaltyPoints: 5000,
    });
    console.log("Created admin@mukicards.com");
  } else {
    admin2.passwordHash = hashMuki2026;
    await admin2.save();
    console.log("Updated password for admin@mukicards.com to muki2026");
  }

  console.log("SUCCESS! Both admin@mukicraftycards.com and admin@mukicards.com are ready!");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
