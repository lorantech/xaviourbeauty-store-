import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  title?: string;
  text: string;
  image?: string;
  status: "pending" | "published" | "rejected";
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    text: { type: String, required: true },
    image: String,
    status: { type: String, enum: ["pending", "published", "rejected"], default: "pending" },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);
