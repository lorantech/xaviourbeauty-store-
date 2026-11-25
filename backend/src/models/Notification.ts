import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: Schema.Types.Mixed,
    read: { type: Boolean, default: false, index: true },
    readAt: Date,
  },
  { timestamps: true }
);

export const Notification = model<INotification>("Notification", notificationSchema);
