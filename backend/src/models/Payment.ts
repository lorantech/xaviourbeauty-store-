import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  order: Types.ObjectId;
  reference: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  channel?: string;
  paystackData?: any;
  verifiedAt?: Date;
  method?: "paystack" | "bank_transfer";
  proofUrl?: string;
  proofDetails?: any;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    channel: String,
    paystackData: Schema.Types.Mixed,
    verifiedAt: Date,
    method: { type: String, enum: ["paystack", "bank_transfer"], default: "paystack" },
    proofUrl: String,
    proofDetails: Schema.Types.Mixed,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
