import { Request, Response } from "express";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { AppError } from "../middleware/errorHandler";

export const listReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({ product: req.params.id, status: "published" })
    .populate("user", "name")
    .sort({ createdAt: -1 });
  res.json({ reviews });
};

export const createReview = async (req: any, res: Response) => {
  const { rating, title, text, image } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  const existing = await Review.findOne({ product: req.params.id, user: req.user._id });
  if (existing) throw new AppError("You already reviewed this product", 409);
  const review = await Review.create({ product: req.params.id, user: req.user._id, rating, title, text, image, status: "pending" });
  res.status(201).json({ review });
};

export const adminListReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find().populate("product", "name").populate("user", "name email").sort({ createdAt: -1 });
  res.json({ reviews });
};

export const updateReviewStatus = async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError("Not found", 404);
  review.status = req.body.status;
  await review.save();
  // recalc product rating
  const published = await Review.find({ product: review.product, status: "published" });
  const avg = published.length ? published.reduce((a, r) => a + r.rating, 0) / published.length : 0;
  await Product.findByIdAndUpdate(review.product, { rating: Number(avg.toFixed(2)), reviewCount: published.length });
  res.json({ review });
};
