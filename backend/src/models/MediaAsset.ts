import { Document, model, Schema, Types } from "mongoose";

export type MediaAssetType = "image" | "video" | "raw";

export interface IMediaAsset extends Document {
  url: string;
  publicId: string;
  filename: string;
  type: MediaAssetType;
  size: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, unique: true, trim: true },
    filename: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["image", "video", "raw"] },
    size: { type: Number, required: true, min: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    uploadedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const MediaAsset = model<IMediaAsset>("MediaAsset", mediaAssetSchema);
