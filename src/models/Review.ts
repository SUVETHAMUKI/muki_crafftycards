import mongoose, { Schema, Document } from "mongoose";
import Product from "./Product";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  images: [{ type: String, default: [] }],
  createdAt: { type: Date, default: Date.now },
});

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

ReviewSchema.statics.recalculateRatings = async function (productId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: "$productId",
        ratingAvg: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingAvg: Math.round(stats[0].ratingAvg * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingAvg: 0,
      reviewCount: 0,
    });
  }
};

ReviewSchema.post("save", async function (doc) {
  const ReviewModel = doc.constructor as any;
  await ReviewModel.recalculateRatings(doc.productId);
});

ReviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const ReviewModel = mongoose.model("Review") as any;
    await ReviewModel.recalculateRatings(doc.productId);
  }
});

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
