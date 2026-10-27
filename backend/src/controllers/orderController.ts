import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { Coupon } from "../models/Coupon";
import { StoreSettings } from "../models/Coupon";
import { AppError } from "../middleware/errorHandler";

export const createOrder = async (req: any, res: Response) => {
  const { delivery, deliveryMethod } = req.body;
  const normalizedDelivery = {
    name: delivery?.name || delivery?.fullName,
    email: delivery?.email,
    phone: delivery?.phone,
    street: delivery?.street || delivery?.address,
    city: delivery?.city,
    state: delivery?.state,
    instructions: delivery?.instructions,
    method: deliveryMethod || delivery?.method,
  };
  if (!normalizedDelivery.name || !normalizedDelivery.email || !normalizedDelivery.phone || !normalizedDelivery.street || !normalizedDelivery.city || !normalizedDelivery.state) {
    throw new AppError("Incomplete delivery details", 400);
  }
  const filter = { user: req.user._id };
  const cart = await Cart.findOne(filter).populate("items.product");
  if (!cart || cart.items.length === 0) throw new AppError("Cart is empty", 400);

  let subtotal = 0;
  const orderItems: any[] = [];
  for (const item of cart.items as any[]) {
    const product = await Product.findById(item.product._id || item.product);
    if (!product || product.status !== "published") throw new AppError("Product unavailable", 400);
    if (product.stockQuantity < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);
    const unitPrice = product.price;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
    });
    subtotal += unitPrice * item.quantity;
  }

  let discount = 0;
  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon && coupon.isActive) {
      if (coupon.type === "percent") discount = (subtotal * coupon.value) / 100;
      else discount = coupon.value;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  const settings = await StoreSettings.findOne();
  const shipping = settings?.shippingFee || 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const orderNumber = "XBS-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const order = await Order.create({
    orderNumber,
    customer: req.user._id,
    items: orderItems,
    subtotal,
    discount,
    shipping,
    total,
    delivery: normalizedDelivery,
    paymentStatus: "pending",
    fulfilmentStatus: "pending_payment",
  });

  res.status(201).json({ order });
};

export const myOrders = async (req: any, res: Response) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
};

export const getOrder = async (req: any, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Not found", 404);
  if (req.user.role !== "admin" && order.customer.toString() !== req.user._id.toString()) throw new AppError("Forbidden", 403);
  res.json({ order });
};

export const adminListOrders = async (req: Request, res: Response) => {
  const { paymentStatus, fulfilmentStatus, from, to, q } = req.query as any;
  const filter: any = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (fulfilmentStatus) filter.fulfilmentStatus = fulfilmentStatus;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  const orders = await Order.find(filter).populate("customer", "name email").sort({ createdAt: -1 });
  res.json({ orders });
};

export const updateOrderStatus = async (req: any, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Not found", 404);
  const { fulfilmentStatus, trackingNumber } = req.body;
  if (fulfilmentStatus) order.fulfilmentStatus = fulfilmentStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  await order.save();
  res.json({ order });
};
