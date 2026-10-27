import { Request, Response } from "express";
import { Category } from "../models/Category";
import { AppError } from "../middleware/errorHandler";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const listCategories = async (req: Request, res: Response) => {
  const cats = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
  res.json({ categories: cats });
};

export const listAllCategories = async (req: Request, res: Response) => {
  const cats = await Category.find().sort({ order: 1, name: 1 });
  res.json({ categories: cats });
};

export const createCategory = async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.slug) data.slug = slugify(data.name);
  const cat = await Category.create(data);
  res.status(201).json({ category: cat });
};

export const updateCategory = async (req: Request, res: Response) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) throw new AppError("Category not found", 404);
  res.json({ category: cat });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) throw new AppError("Category not found", 404);
  res.json({ message: "Deleted" });
};
