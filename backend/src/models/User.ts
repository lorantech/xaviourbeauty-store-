import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  phone?: string;
  addresses?: { label?: string; street: string; city: string; state: string; country?: string }[];
  isEmailVerified: boolean;
  emailVerifyToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  wishlist: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    phone: String,
    addresses: [
      {
        label: String,
        street: String,
        city: String,
        state: String,
        country: { type: String, default: "Nigeria" },
      },
    ],
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
