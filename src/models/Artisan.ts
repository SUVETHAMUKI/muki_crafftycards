import mongoose, { Schema, Document } from "mongoose";

export interface IPayoutRequest {
  amount: number;
  status: "pending" | "paid";
  requestedAt: Date;
  paidAt?: Date;
}

export interface IArtisan extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  portfolioImages: string[];
  commissionRate: number;
  payoutHistory: IPayoutRequest[];
  createdAt: Date;
}

const PayoutRequestSchema = new Schema<IPayoutRequest>({
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
});

const ArtisanSchema = new Schema<IArtisan>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  bio: { type: String, required: true },
  portfolioImages: [{ type: String, default: [] }],
  commissionRate: { type: Number, default: 0.1 },
  payoutHistory: [PayoutRequestSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Artisan || mongoose.model<IArtisan>("Artisan", ArtisanSchema);
