import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { AppError } from "../middleware/errorHandler";

function getSessionId(req: Request): string {
  return (req.cookies?.cartSession as string) || (req.headers["x-cart-session"] as string) || "";
}

export const getCart = async (req: any, res: Response) => {
  const filter = req.user ? { user: req.user._id } : { sessionId: getSessionId(req) };
  let cart = await Cart.findOne(filter).populate("items.product");
  if (!cart) cart = await Cart.create({ ...(req.user ? { user: req.user._id } : { sessionId: getSessionId(req) }), items: [] });
  res.json({ cart });
};

export const addItem = async (req: any, res: Response) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || product.status !== "published") throw new AppError("Product not available", 404);
  if (product.stockQuantity < quantity) throw new AppError("Insufficient stock", 400);
  const filter = req.user ? { user: req.user._id } : { sessionId: getSessionId(req) };
  let cart = await Cart.findOne(filter);
  if (!cart) cart = await Cart.create({ ...filter, items: [] });
  const existing = cart.items.find((i: any) => i.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
    existing.priceSnapshot = product.price;
  } else {
    cart.items.push({ product: product._id, quantity, priceSnapshot: product.price } as any);
  }
  await cart.save();
  await cart.populate("items.product");
  res.json({ cart });
};

export const updateItem = async (req: any, res: Response) => {
  const { quantity } = req.body;
  const filter = req.user ? { user: req.user._id } : { sessionId: getSessionId(req) };
  const cart = await Cart.findOne(filter);
  if (!cart) throw new AppError("Cart not found", 404);
  const item = (cart.items as any).id(req.params.itemId);
  if (!item) throw new AppError("Item not found", 404);
  if (quantity <= 0) {
    item.deleteOne();
  } else {
    const product = await Product.findById(item.product);
    if (product && product.stockQuantity < quantity) throw new AppError("Insufficient stock", 400);
    item.quantity = quantity;
    if (product) item.priceSnapshot = product.price;
  }
  await cart.save();
  await cart.populate("items.product");
  res.json({ cart });
};

export const removeItem = async (req: any, res: Response) => {
  const filter = req.user ? { user: req.user._id } : { sessionId: getSessionId(req) };
  const cart = await Cart.findOne(filter);
  if (!cart) throw new AppError("Cart not found", 404);
  const item = (cart.items as any).id(req.params.itemId);
  if (item) item.deleteOne();
  await cart.save();
  await cart.populate("items.product");
  res.json({ cart });
};
