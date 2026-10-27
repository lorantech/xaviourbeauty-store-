import { Schema, model, Document, Types } from "mongoose";

export interface ICEOMessage extends Document {
  title: string;
  greeting?: string;
  message: string;
  ceoName: string;
  designation: string;
  profileImage?: string;
  bannerImage?: string;
  status: "draft" | "published" | "archived";
  featuredInHero: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ceoSchema = new Schema<ICEOMessage>(
  {
    title: { type: String, required: true },
    greeting: String,
    message: { type: String, required: true },
    ceoName: { type: String, required: true },
    designation: { type: String, required: true },
    profileImage: String,
    bannerImage: String,
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    featuredInHero: { type: Boolean, default: false },
    publishedAt: Date,
    expiresAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const CEOMessage = model<ICEOMessage>("CEOMessage", ceoSchema);
