import { Schema, model, Document, Types } from "mongoose";

export interface ITestimonial extends Document {
  customerName: string;
  displayName?: string;
  profileImage?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  writtenReview?: string;
  product?: Types.ObjectId;
  socialPlatform?: string;
  socialHandle?: string;
  socialProfileUrl?: string;
  reviewDate?: Date;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  showOnHomepage: boolean;
  isVerifiedPurchase: boolean;
  consentConfirmed: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true },
    displayName: String,
    profileImage: String,
    videoUrl: String,
    videoThumbnail: String,
    writtenReview: String,
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    socialPlatform: String,
    socialHandle: String,
    socialProfileUrl: String,
    reviewDate: Date,
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    isFeatured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    consentConfirmed: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Testimonial = model<ITestimonial>("Testimonial", testimonialSchema);
