import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Review } from "../models/Review";
import { Testimonial } from "../models/Testimonial";

export const dashboard = async (req: Request, res: Response) => {
  const [products, categories, customers, orders, pendingOrders, paidOrders, lowStock, recentOrders, bestSelling] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.countDocuments(),
    Order.countDocuments({ paymentStatus: "pending" }),
    Order.countDocuments({ paymentStatus: "paid" }),
    Product.countDocuments({ stockQuantity: { $lt: 5 } }),
    Order.find().populate("customer", "name").sort({ createdAt: -1 }).limit(10),
    Product.find({ bestSeller: true }).limit(5),
  ]);
  const revenueAgg = await Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]);
  const revenue = revenueAgg[0]?.total || 0;
  const recentReviews = await Review.find().sort({ createdAt: -1 }).limit(5).populate("product", "name");
  res.json({
    stats: { products, categories, customers, orders, pendingOrders, paidOrders, lowStock, revenue },
    recentOrders,
    bestSelling,
    recentReviews,
  });
};

export const listCustomers = async (req: Request, res: Response) => {
  const customers = await User.find({ role: "customer" }).select("-password").sort({ createdAt: -1 });
  res.json({ customers });
};

export const storeSettingsGet = async (req: Request, res: Response) => {
  const { StoreSettings } = await import("../models/Coupon.js");
  let s = await StoreSettings.findOne();
  if (!s) s = await StoreSettings.create({ storeName: "Xaviourbeautystore" });
  res.json({ settings: s });
};

export const storeSettingsUpdate = async (req: Request, res: Response) => {
  const { StoreSettings } = await import("../models/Coupon.js");
  let s = await StoreSettings.findOne();
  if (!s) s = await StoreSettings.create({ storeName: "Xaviourbeautystore" });
  Object.assign(s, req.body);
  await s.save();
  res.json({ settings: s });
};
