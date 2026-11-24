import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { AdminAuditLog } from "../models/Coupon";
import { AppError } from "../middleware/errorHandler";
import { asyncHandler } from "../middleware/errorHandler";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const listProducts = async (req: Request, res: Response) => {
  const { q, category, minPrice, maxPrice, inStock, sort, page = "1", limit = "20", featured, bestSeller, newArrival, status, includeAll } = req.query as any;
  const filter: any = { isDeleted: { $ne: true } };
  if (status) filter.status = status;
  else if (includeAll === "true" && (req as any).user?.role === "admin") {
    // Admin product management needs draft/published/archived visibility.
  } else filter.status = "published";
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { description: new RegExp(q, "i") }];
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
  }
  if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
  if (inStock === "true") filter.stockQuantity = { $gt: 0 };
  if (featured === "true") filter.featured = true;
  if (bestSeller === "true") filter.bestSeller = true;
  if (newArrival === "true") filter.newArrival = true;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  let sortObj: any = { createdAt: -1 };
  if (sort === "price_asc") sortObj = { price: 1 };
  if (sort === "price_desc") sortObj = { price: -1 };
  if (sort === "newest") sortObj = { createdAt: -1 };
  if (sort === "popular") sortObj = { reviewCount: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter).populate("category", "name slug").sort(sortObj).skip((pageNum - 1) * limitNum).limit(limitNum),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
};

export const getProduct = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isDeleted: { $ne: true } }).populate("category", "name slug");
  if (!product) throw new AppError("Product not found", 404);
  res.json({ product });
};

export const createProduct = async (req: any, res: Response) => {
  const data = req.body;
  if (!data.slug) data.slug = slugify(data.name);
  const product = await Product.create(data);
  res.status(201).json({ product });
};

export const updateProduct = async (req: any, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product || (product as any).isDeleted) throw new AppError("Product not found", 404);
  const before = product.toObject();
  if (req.body.price !== undefined && Number(req.body.price) !== product.price) {
    await AdminAuditLog.create({
      admin: req.user._id,
      action: "price_change",
      entityType: "Product",
      entityId: product._id.toString(),
      before: { price: product.price },
      after: { price: req.body.price },
    });
  }
  Object.assign(product, req.body);
  await product.save();
  res.json({ product });
};

export const deleteProduct = async (req: any, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product || (product as any).isDeleted) throw new AppError("Product not found", 404);
  (product as any).isDeleted = true;
  (product as any).deletedAt = new Date();
  (product as any).status = "archived";
  (product as any).featured = false;
  (product as any).bestSeller = false;
  (product as any).newArrival = false;
  await product.save();
  await AdminAuditLog.create({
    admin: req.user?._id,
    action: "product_delete",
    entityType: "Product",
    entityId: product._id.toString(),
    before: { name: (product as any).name, slug: (product as any).slug },
    after: { isDeleted: true },
  });
  res.json({ message: "Product deleted" });
};
