import { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { StoreSettings } from "../models/Coupon";
import { Notification } from "../models/Notification";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

function getSessionId(req: Request): string {
  return (req.cookies?.cartSession as string) || (req.headers["x-cart-session"] as string) || "";
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

async function ensureCanAccessOrder(req: any, order: any) {
  const isAdmin = req.user?.role === "admin";
  const isOwner = !!req.user?._id && !!order.customer && order.customer.toString() === req.user._id.toString();
  const token = String(req.body?.orderAccessToken || req.query?.token || req.headers["x-order-token"] || "");
  const isGuestToken = !!order.orderAccessToken && token && token === order.orderAccessToken;
  if (!isAdmin && !isOwner && !isGuestToken) throw new AppError("Forbidden", 403);
}

async function decrementStock(order: any) {
  for (const item of order.items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stockQuantity: { $gte: item.quantity }, isDeleted: { $ne: true } },
      { $inc: { stockQuantity: -item.quantity } },
      { new: true }
    );
    if (!updated) throw new AppError(`Insufficient stock for ${item.name}`, 400);
  }
}

async function notifyAdmin(type: string, title: string, message: string, data: any) {
  await Notification.create({ type, title, message, data });
}

export const initializePayment = async (req: any, res: Response) => {
  const { orderId, method = "paystack" } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  await ensureCanAccessOrder(req, order);
  if (order.paymentStatus === "paid") throw new AppError("Already paid", 400);

  if (method === "bank_transfer") {
    const reference = order.paymentReference || ("BT-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase());
    const bank = await getBankDetails();
    order.paymentMethod = "bank_transfer";
    order.paymentReference = reference;
    order.paymentStatus = "pending";
    order.fulfilmentStatus = "pending_payment";
    order.bankTransferDetails = {
      bankName: bank.bankName,
      accountName: bank.accountName,
      accountNumber: bank.accountNumber,
      reference,
    };
    await order.save();

    let payment = await Payment.findOne({ order: order._id });
    if (!payment) {
      payment = await Payment.create({ order: order._id, reference, amount: order.total, currency: "NGN", status: "pending", method: "bank_transfer" });
    } else {
      payment.reference = reference;
      payment.method = "bank_transfer";
      payment.status = payment.status === "success" ? payment.status : "pending";
      payment.amount = order.total;
      await payment.save();
    }

    await notifyAdmin("new_order", "New bank transfer order", `Order ${order.orderNumber} is awaiting receipt upload/verification.`, { orderId: order._id.toString(), orderNumber: order.orderNumber });
    return res.json({
      method: "bank_transfer",
      reference,
      account: bank,
      order: { _id: order._id, orderNumber: order.orderNumber, total: order.total, orderAccessToken: order.orderAccessToken },
    });
  }

  const reference = "PAY-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
  const amountInKobo = Math.round(order.total * 100);
  try {
    const resp = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: order.delivery.email,
        amount: amountInKobo,
        reference,
        callback_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout/verify?reference=${reference}`,
        metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
      },
      { headers: { Authorization: `Bearer ${env.paystackSecret}` } }
    );
    await Payment.create({ order: order._id, reference, amount: order.total, currency: "NGN", status: "pending", method: "paystack" });
    order.paymentReference = reference;
    order.paymentMethod = "paystack";
    await order.save();
    res.json({ authorization_url: resp.data.data.authorization_url, reference, access_code: resp.data.data.access_code });
  } catch (e: any) {
    throw new AppError(e.response?.data?.message || "Payment init failed", 500);
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { reference } = req.params;
  const payment = await Payment.findOne({ reference });
  if (!payment) throw new AppError("Payment not found", 404);
  if (payment.status === "success") {
    const order = await Order.findById(payment.order);
    return res.json({ status: "success", order });
  }
  try {
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${env.paystackSecret}` },
    });
    const data = resp.data.data;
    const order = await Order.findById(payment.order);
    if (!order) throw new AppError("Order not found", 404);
    const expectedKobo = Math.round(order.total * 100);
    if (data.status === "success" && data.amount === expectedKobo) {
      payment.status = "success";
      payment.channel = data.channel;
      payment.paystackData = data;
      payment.verifiedAt = new Date();
      await payment.save();
      order.paymentStatus = "paid";
      order.fulfilmentStatus = "paid";
      order.paymentVerifiedAt = new Date();
      await order.save();
      await decrementStock(order);
      await notifyAdmin("payment_received", "Payment received", `Paystack payment confirmed for ${order.orderNumber}.`, { orderId: order._id.toString(), orderNumber: order.orderNumber });
      return res.json({ status: "success", order });
    } else {
      payment.status = "failed";
      payment.paystackData = data;
      await payment.save();
      order.paymentStatus = "failed";
      await order.save();
      return res.json({ status: "failed", order });
    }
  } catch (e: any) {
    throw new AppError(e.response?.data?.message || "Verification failed", 500);
  }
};

export const submitBankTransferProof = async (req: any, res: Response) => {
  const { orderId, proofUrl, paidBy, bankName, note } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  await ensureCanAccessOrder(req, order);
  if (order.paymentMethod !== "bank_transfer") throw new AppError("Not a bank transfer order", 400);
  if (order.paymentStatus === "paid") throw new AppError("Already paid", 400);
  if (!proofUrl) throw new AppError("Receipt is required", 400);

  const bank = await getBankDetails();
  order.bankTransferProof = proofUrl;
  order.paymentReceiptUrl = proofUrl;
  order.paymentReceiptUploadedAt = new Date();
  order.paymentStatus = "awaiting_verification";
  order.paymentRejectedReason = undefined;
  order.bankTransferDetails = {
    bankName: bankName || bank.bankName,
    accountName: bank.accountName,
    accountNumber: bank.accountNumber,
    reference: order.paymentReference || "",
    paidBy: paidBy || order.delivery?.name || "",
    paidAt: new Date(),
    note: note || "",
  };
  await order.save();

  const payment = await Payment.findOne({ order: order._id });
  if (payment) {
    payment.proofUrl = proofUrl;
    payment.proofDetails = order.bankTransferDetails;
    payment.method = "bank_transfer";
    payment.status = "awaiting_verification";
    payment.rejectionReason = undefined;
    await payment.save();
  }

  await notifyAdmin("payment_receipt_uploaded", "Payment receipt uploaded", `Receipt uploaded for ${order.orderNumber}. Please verify payment.`, { orderId: order._id.toString(), orderNumber: order.orderNumber });
  res.json({ message: "Receipt submitted. We will verify and confirm your payment.", order });
};

export const getPendingBankTransfers = async (req: any, res: Response) => {
  if (req.user.role !== "admin") throw new AppError("Forbidden", 403);
  const orders = await Order.find({
    paymentMethod: "bank_transfer",
    paymentStatus: { $in: ["pending", "awaiting_verification", "failed"] },
    $or: [{ bankTransferProof: { $exists: true, $ne: null } }, { paymentReceiptUrl: { $exists: true, $ne: null } }, { paymentStatus: "awaiting_verification" }],
  }).populate("customer", "name email").sort({ updatedAt: -1 });
  res.json(orders);
};

export const approveBankTransfer = async (req: any, res: Response) => {
  if (req.user.role !== "admin") throw new AppError("Forbidden", 403);
  const { orderId } = req.params;
  const claimed = await Order.findOneAndUpdate(
    { _id: orderId, paymentMethod: "bank_transfer", paymentStatus: "awaiting_verification" },
    {
      $set: {
        paymentStatus: "paid",
        fulfilmentStatus: "paid",
        paymentVerifiedAt: new Date(),
        paymentVerifiedBy: req.user._id,
      },
      $unset: { paymentRejectedReason: 1 },
    },
    { new: true }
  );
  if (!claimed) {
    const existing = await Order.findById(orderId);
    if (!existing) throw new AppError("Order not found", 404);
    if (existing.paymentMethod !== "bank_transfer") throw new AppError("Not a bank transfer order", 400);
    if (existing.paymentStatus === "paid") return res.json({ message: "Payment already approved", order: existing });
    throw new AppError("Payment can only be approved from awaiting verification", 409);
  }

  try {
    await decrementStock(claimed);
  } catch (e) {
    await Order.findByIdAndUpdate(claimed._id, {
      $set: { paymentStatus: "awaiting_verification", fulfilmentStatus: "pending_payment" },
      $unset: { paymentVerifiedAt: 1, paymentVerifiedBy: 1 },
    });
    throw e;
  }

  const payment = await Payment.findOne({ order: claimed._id });
  if (payment) {
    payment.status = "success";
    payment.verifiedAt = new Date();
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();
    payment.rejectionReason = undefined;
    await payment.save();
  }

  await notifyAdmin("payment_received", "Payment verified", `Bank transfer verified for ${claimed.orderNumber}.`, { orderId: claimed._id.toString(), orderNumber: claimed.orderNumber });
  res.json({ message: "Payment approved", order: claimed });
};

export const rejectBankTransfer = async (req: any, res: Response) => {
  if (req.user.role !== "admin") throw new AppError("Forbidden", 403);
  const { orderId } = req.params;
  const reason = String(req.body?.reason || "").trim();
  if (!reason) throw new AppError("Rejection reason is required", 400);
  const order = await Order.findOneAndUpdate(
    { _id: orderId, paymentMethod: "bank_transfer", paymentStatus: "awaiting_verification" },
    { $set: { paymentStatus: "failed", paymentRejectedReason: reason } },
    { new: true }
  );
  if (!order) {
    const existing = await Order.findById(orderId);
    if (!existing) throw new AppError("Order not found", 404);
    if (existing.paymentMethod !== "bank_transfer") throw new AppError("Not a bank transfer order", 400);
    if (existing.paymentStatus === "paid") throw new AppError("Already paid", 400);
    if (existing.paymentStatus === "failed" && existing.paymentRejectedReason) return res.json({ message: "Payment already rejected", order: existing });
    throw new AppError("Payment can only be rejected from awaiting verification", 409);
  }
  const payment = await Payment.findOne({ order: order._id });
  if (payment) {
    payment.status = "rejected";
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();
    payment.rejectionReason = reason;
    await payment.save();
  }
  await notifyAdmin("payment_rejected", "Payment rejected", `Payment rejected for ${order.orderNumber}: ${reason}`, { orderId: order._id.toString(), orderNumber: order.orderNumber, reason });
  res.json({ message: "Payment rejected", order });
};
