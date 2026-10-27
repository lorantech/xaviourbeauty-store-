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
  createdAt: Date;
  updatedAt: Date;
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
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
