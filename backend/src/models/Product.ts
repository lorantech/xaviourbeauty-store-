import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  images: string[];
  videos: string[];
  sku?: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  specifications: { key: string; value: string }[];
  variants: { name: string; options: string[] }[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  status: "draft" | "published" | "archived";
  warrantyInformation?: string;
  deliveryInformation?: string;
  includedAccessories?: string[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: [String],
    videos: [String],
    sku: String,
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, default: 0, min: 0 },
    specifications: [{ key: String, value: String }],
    variants: [{ name: String, options: [String] }],
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    warrantyInformation: String,
    deliveryInformation: String,
    includedAccessories: [String],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, status: 1 });

export const Product = model<IProduct>("Product", productSchema);
