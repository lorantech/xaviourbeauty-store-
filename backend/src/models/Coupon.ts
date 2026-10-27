import { Schema, model, Document, Types } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

export const Coupon = model<ICoupon>("Coupon", couponSchema);

export interface IStoreSettings extends Document {
  storeName: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks: { platform: string; url: string }[];
  shippingFee: number;
  freeShippingThreshold?: number;
  deliveryOptions: { name: string; fee: number }[];
  policies: { shipping?: string; returns?: string; privacy?: string; terms?: string };
  announcementBar?: { text: string; link?: string; isActive: boolean };
  createdAt: Date;
  updatedAt: Date;
}

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: { type: String, default: "Xaviourbeautystore" },
    logo: String,
    contactEmail: String,
    contactPhone: String,
    address: String,
    socialLinks: [{ platform: String, url: String }],
    shippingFee: { type: Number, default: 0 },
    freeShippingThreshold: Number,
    deliveryOptions: [{ name: String, fee: Number }],
    policies: {
      shipping: String,
      returns: String,
      privacy: String,
      terms: String,
    },
    announcementBar: { text: String, link: String, isActive: { type: Boolean, default: false } },
  },
  { timestamps: true }
);

export const StoreSettings = model<IStoreSettings>("StoreSettings", storeSettingsSchema);

export interface IPromotionalBanner extends Document {
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  placement: string;
  isActive: boolean;
  order: number;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IPromotionalBanner>(
  {
    title: { type: String, required: true },
    subtitle: String,
    image: String,
    link: String,
    placement: { type: String, default: "home" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    startsAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

export const PromotionalBanner = model<IPromotionalBanner>("PromotionalBanner", bannerSchema);

export interface IAdminAuditLog extends Document {
  admin: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  before?: any;
  after?: any;
  createdAt: Date;
}

const auditSchema = new Schema<IAdminAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: String,
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const AdminAuditLog = model<IAdminAuditLog>("AdminAuditLog", auditSchema);
