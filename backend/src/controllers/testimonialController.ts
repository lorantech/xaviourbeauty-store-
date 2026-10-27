import { Request, Response } from "express";
import { Testimonial } from "../models/Testimonial";
import { AppError } from "../middleware/errorHandler";

export const listPublicTestimonials = async (req: Request, res: Response) => {
  const filter: any = { status: "published", consentConfirmed: true };
  if (req.query.featured === "true") filter.isFeatured = true;
  if (req.query.homepage === "true") filter.showOnHomepage = true;
  const items = await Testimonial.find(filter).populate("product", "name slug").sort({ createdAt: -1 });
  res.json({ testimonials: items });
};

export const getTestimonial = async (req: Request, res: Response) => {
  const t = await Testimonial.findById(req.params.id).populate("product", "name slug");
  if (!t || t.status !== "published") throw new AppError("Not found", 404);
  res.json({ testimonial: t });
};

export const adminListTestimonials = async (req: Request, res: Response) => {
  const items = await Testimonial.find().populate("product", "name slug").sort({ createdAt: -1 });
  res.json({ testimonials: items });
};

export const createTestimonial = async (req: any, res: Response) => {
  const data = { ...req.body, createdBy: req.user._id, updatedBy: req.user._id };
  const t = await Testimonial.create(data);
  res.status(201).json({ testimonial: t });
};

export const updateTestimonial = async (req: any, res: Response) => {
  const t = await Testimonial.findById(req.params.id);
  if (!t) throw new AppError("Not found", 404);
  Object.assign(t, req.body, { updatedBy: req.user._id });
  await t.save();
  res.json({ testimonial: t });
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
