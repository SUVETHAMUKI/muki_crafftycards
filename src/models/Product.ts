import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  artisanId: mongoose.Types.ObjectId;
  stock: number;
  ratingAvg: number;
  reviewCount: number;
  isPersonalizable: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String, default: [] }],
  category: { type: String, required: true, trim: true },
  tags: [{ type: String, default: [] }],
  artisanId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  stock: { type: Number, required: true, min: 0, default: 10 },
  ratingAvg: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isPersonalizable: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
