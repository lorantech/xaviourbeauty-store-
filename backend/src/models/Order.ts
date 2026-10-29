import { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  fulfilmentStatus: "pending_payment" | "paid" | "processing" | "ready_for_dispatch" | "shipped" | "delivered" | "cancelled" | "refund_requested" | "refunded";
  delivery: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    instructions?: string;
    method?: string;
  };
  paymentMethod?: "paystack" | "bank_transfer";
  bankTransferProof?: string;
  bankTransferDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    reference: string;
    paidBy?: string;
    paidAt?: Date;
  };
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    fulfilmentStatus: { type: String, enum: ["pending_payment", "paid", "processing", "ready_for_dispatch", "shipped", "delivered", "cancelled", "refund_requested", "refunded"], default: "pending_payment" },
    delivery: {
      name: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      instructions: String,
      method: String,
    },
    paymentReference: String,
    paymentMethod: { type: String, enum: ["paystack", "bank_transfer"], default: "paystack" },
    bankTransferProof: String,
    bankTransferDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      reference: String,
      paidBy: String,
      paidAt: Date,
    },
    trackingNumber: String,
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon" },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);
