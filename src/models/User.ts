import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "customer" | "artisan" | "admin";
  wishlist: mongoose.Types.ObjectId[];
  loyaltyPoints: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["customer", "artisan", "admin"], default: "customer" },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Product", default: [] }],
  loyaltyPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
