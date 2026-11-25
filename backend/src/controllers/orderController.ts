import { Request, Response } from "express";
import crypto from "crypto";
import { Order } from "../models/Order";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { Coupon } from "../models/Coupon";
import { StoreSettings } from "../models/Coupon";
import { Payment } from "../models/Payment";
import { Notification } from "../models/Notification";
import { AppError } from "../middleware/errorHandler";

function getSessionId(req: Request): string {
  return (req.cookies?.cartSession as string) || (req.headers["x-cart-session"] as string) || "";
}

async function resolveCart(req: any) {
  if (req.user?._id) {
    const userCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (userCart) return userCart;
  }
  const sessionId = getSessionId(req);
  if (!sessionId) return null;
  return Cart.findOne({ sessionId }).populate("items.product");
}

function normalizeDelivery(body: any) {
  const delivery = body.delivery || {};
  return {
    name: String(delivery.name || delivery.fullName || body.fullName || "").trim(),
    email: String(delivery.email || body.email || "").trim().toLowerCase(),
    phone: String(delivery.phone || body.phone || "").trim(),
    street: String(delivery.street || delivery.address || body.address || "").trim(),
    city: String(delivery.city || body.city || "").trim(),
    state: String(delivery.state || body.state || "").trim(),
    instructions: String(delivery.instructions || body.instructions || "").trim(),
    method: String(body.deliveryMethod || delivery.method || "standard").trim(),
  };
}

async function computeOrderItems(cart: any) {
  let subtotal = 0;
  const orderItems: any[] = [];
  for (const item of cart.items as any[]) {
    const product = await Product.findById(item.product._id || item.product);
    if (!product || product.status !== "published" || (product as any).isDeleted) throw new AppError("Product unavailable", 400);
    if (product.stockQuantity < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);
    const unitPrice = Number(product.price);
    const qty = Math.max(1, Number(item.quantity || 1));
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      quantity: qty,
      unitPrice,
      totalPrice: unitPrice * qty,
    });
    subtotal += unitPrice * qty;
  }
  return { orderItems, subtotal };
}

async function computeDiscount(cart: any, subtotal: number) {
  let discount = 0;
  let couponId: any = undefined;
  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    const now = new Date();
    if (coupon && coupon.isActive && (!coupon.startsAt || coupon.startsAt <= now) && (!coupon.expiresAt || coupon.expiresAt >= now)) {
      if (coupon.type === "percent") discount = (subtotal * coupon.value) / 100;
      else discount = coupon.value;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      discount = Math.min(discount, subtotal);
      couponId = coupon._id;
    }
  }
  return { discount, couponId };
}

async function getBankDetails() {
  const settings = await StoreSettings.findOne();
  const bank = (settings as any)?.bankDetails || {};
  return {
    bankName: bank.bankName || "UBA",
    accountName: bank.accountName || "Xaviour Beauty Store Ventures",
    accountNumber: bank.accountNumber || "1027152497",
    instructions: bank.instructions || "Transfer the exact total amount and upload your payment receipt below for verification.",
  };
}

async function createOrderNotification(order: any) {
  await Notification.create({
    type: "new_order",
    title: "New order received",
    message: `Order ${order.orderNumber} placed for ?${Number(order.total).toLocaleString()}`,
    data: { orderId: order._id.toString(), orderNumber: order.orderNumber, paymentMethod: order.paymentMethod },
  });
}

export const createOrder = async (req: any, res: Response) => {
  const normalizedDelivery = normalizeDelivery(req.body);
  if (!normalizedDelivery.name || !normalizedDelivery.email || !normalizedDelivery.phone || !normalizedDelivery.street || !normalizedDelivery.city || !normalizedDelivery.state) {
    throw new AppError("Incomplete delivery details", 400);
  }
  const cart = await resolveCart(req);
  if (!cart || cart.items.length === 0) throw new AppError("Cart is empty", 400);

  const { orderItems, subtotal } = await computeOrderItems(cart);
  const { discount, couponId } = await computeDiscount(cart, subtotal);
  const settings = await StoreSettings.findOne();
  const shipping = Number(settings?.shippingFee || 0);
  const total = Math.max(0, subtotal - discount + shipping);
  const orderNumber = "XBS-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const isGuest = !req.user?._id;
  const orderAccessToken = isGuest ? crypto.randomBytes(24).toString("hex") : undefined;

  const order = await Order.create({
    orderNumber,
    customer: req.user?._id,
    isGuest,
    guestCustomer: isGuest ? { name: normalizedDelivery.name, email: normalizedDelivery.email, phone: normalizedDelivery.phone } : undefined,
    orderAccessToken,
    items: orderItems,
    subtotal,
    discount,
    shipping,
    total,
    delivery: normalizedDelivery,
    paymentStatus: "pending",
    fulfilmentStatus: "pending_payment",
    paymentMethod: req.body.paymentMethod === "bank_transfer" ? "bank_transfer" : "paystack",
    coupon: couponId,
  });

  await Cart.deleteOne({ _id: cart._id });
  await createOrderNotification(order);

  res.status(201).json({ order, orderAccessToken });
};

export const myOrders = async (req: any, res: Response) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
};

export const getOrder = async (req: any, res: Response) => {
  const order = await Order.findById(req.params.id).populate("customer", "name email");
  if (!order) throw new AppError("Not found", 404);
  const token = String(req.query.token || req.headers["x-order-token"] || "");
  const isAdmin = req.user?.role === "admin";
  const isOwner = !!req.user?._id && !!order.customer && order.customer._id?.toString?.() === req.user._id.toString();
  const isGuestToken = !!order.orderAccessToken && token && token === order.orderAccessToken;
  if (!isAdmin && !isOwner && !isGuestToken) throw new AppError("Forbidden", 403);
  res.json({ order });
};

export const getOrderByReference = async (req: any, res: Response) => {
  const reference = String(req.params.reference || "");
  const token = String(req.query.token || "");
  const order = await Order.findOne({ $or: [{ orderNumber: reference }, { paymentReference: reference }] }).populate("customer", "name email");
  if (!order) throw new AppError("Not found", 404);
  const isAdmin = req.user?.role === "admin";
  const isOwner = !!req.user?._id && !!order.customer && (order.customer as any)._id?.toString?.() === req.user._id.toString();
  const isGuestToken = !!order.orderAccessToken && token && token === order.orderAccessToken;
  if (!isAdmin && !isOwner && !isGuestToken) throw new AppError("Forbidden", 403);
  res.json({ order });
};

export const adminListOrders = async (req: Request, res: Response) => {
  const { paymentStatus, fulfilmentStatus, from, to, q, page = "1", limit = "20" } = req.query as any;
  const filter: any = {};
  if (paymentStatus && paymentStatus !== "all") filter.paymentStatus = paymentStatus;
  if (fulfilmentStatus && fulfilmentStatus !== "all") filter.fulfilmentStatus = fulfilmentStatus;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (q) {
    filter.$or = [
      { orderNumber: { $regex: q, $options: "i" } },
      { paymentReference: { $regex: q, $options: "i" } },
      { "delivery.name": { $regex: q, $options: "i" } },
      { "delivery.email": { $regex: q, $options: "i" } },
      { "delivery.phone": { $regex: q, $options: "i" } },
    ];
  }
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const [orders, total] = await Promise.all([
    Order.find(filter).populate("customer", "name email").sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
};

export const updateOrderStatus = async (req: any, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Not found", 404);
  const { fulfilmentStatus, trackingNumber } = req.body;
  if (fulfilmentStatus) order.fulfilmentStatus = fulfilmentStatus;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  await order.save();
  res.json({ order });
};

export const publicBankDetails = async (_req: Request, res: Response) => {
  const bank = await getBankDetails();
  const settings = await StoreSettings.findOne();
  const raw = String((settings as any)?.bankDetails?.whatsappNumber || (settings as any)?.contactPhone || "");
  const digits = raw.replace(/\D/g, "");
  let whatsappNumber = digits;
  if (whatsappNumber.startsWith("0")) whatsappNumber = `234${whatsappNumber.slice(1)}`;
  if (whatsappNumber.length === 10) whatsappNumber = `234${whatsappNumber}`;
  res.json({ bank, whatsappNumber });
};
