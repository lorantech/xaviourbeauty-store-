import { Schema, model, Document, Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  priceSnapshot: number;
}

export interface ICart extends Document {
  user?: Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  coupon?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: String,
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceSnapshot: { type: Number, required: true },
      },
    ],
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon" },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });

export const Cart = model<ICart>("Cart", cartSchema);
