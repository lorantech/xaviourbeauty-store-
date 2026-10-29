import { Request, Response } from "express";
import axios from "axios";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

export const initializePayment = async (req: any, res: Response) => {
  const { orderId, method = "paystack" } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.customer.toString() !== req.user._id.toString()) throw new AppError("Forbidden", 403);
  if (order.paymentStatus === "paid") throw new AppError("Already paid", 400);

  if (method === "bank_transfer") {
    const reference = "BT-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    order.paymentMethod = "bank_transfer";
    order.paymentReference = reference;
    order.fulfilmentStatus = "pending_payment";
    await order.save();
    await Payment.create({ order: order._id, reference, amount: order.total, currency: "NGN", status: "pending", method: "bank_transfer" });
    return res.json({ method: "bank_transfer", reference, account: { bankName: "UBA", accountNumber: "1027152497", accountName: "Xaviourbeautystore ventures" } });
  }

  const reference = "PAY-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
  const amountInKobo = Math.round(order.total * 100);

  // Paystack init
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
  // idempotent
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
      await order.save();
      // decrement stock atomically, prevent oversell
      const { Product } = await import("../models/Product.js");
      for (const item of order.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stockQuantity: { $gte: item.quantity } },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true }
        );
        if (!updated) throw new AppError(`Insufficient stock for ${item.name}`, 400);
      }
      // clear cart
      await (await import("../models/Cart.js")).Cart.deleteOne({ user: order.customer });
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
  const { orderId, proofUrl, paidBy, bankName } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.customer.toString() !== req.user._id.toString()) throw new AppError("Forbidden", 403);
  if (order.paymentMethod !== "bank_transfer") throw new AppError("Not a bank transfer order", 400);
  if (order.paymentStatus === "paid") throw new AppError("Already paid", 400);

  order.bankTransferProof = proofUrl;
  order.bankTransferDetails = {
    bankName: bankName || "",
    accountName: "Xaviourbeautystore ventures",
    accountNumber: "1027152497",
    reference: order.paymentReference || "",
    paidBy: paidBy || "",
    paidAt: new Date(),
  };
  await order.save();

  const payment = await Payment.findOne({ order: order._id });
  if (payment) {
    payment.proofUrl = proofUrl;
    payment.proofDetails = order.bankTransferDetails;
    payment.method = "bank_transfer";
    await payment.save();
  }

  res.json({ message: "Proof submitted. We will verify and confirm your payment." });
};

export const getPendingBankTransfers = async (req: any, res: Response) => {
  if (req.user.role !== "admin") throw new AppError("Forbidden", 403);
  const orders = await Order.find({ paymentMethod: "bank_transfer", paymentStatus: { $ne: "paid" }, bankTransferProof: { $exists: true, $ne: null } }).populate("customer", "name email").sort({ updatedAt: -1 });
  res.json(orders);
};

export const approveBankTransfer = async (req: any, res: Response) => {
  if (req.user.role !== "admin") throw new AppError("Forbidden", 403);
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.paymentMethod !== "bank_transfer") throw new AppError("Not a bank transfer order", 400);
  if (order.paymentStatus === "paid") throw new AppError("Already paid", 400);

  order.paymentStatus = "paid";
  order.fulfilmentStatus = "paid";
  await order.save();

  const payment = await Payment.findOne({ order: order._id });
  if (payment) {
    payment.status = "success";
    payment.verifiedAt = new Date();
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();
    await payment.save();
  }

  // decrement stock
  const { Product } = await import("../models/Product.js");
  for (const item of order.items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stockQuantity: { $gte: item.quantity } },
      { $inc: { stockQuantity: -item.quantity } },
      { new: true }
    );
    if (!updated) throw new AppError(`Insufficient stock for ${item.name}`, 400);
  }
  await (await import("../models/Cart.js")).Cart.deleteOne({ user: order.customer });
  res.json({ message: "Payment approved", order });
};

export const rejectBankTransfer = async (req: any, res: Response) => {
  if (req.user.role !== "admin") throw new AppError("Forbidden", 403);
  const { orderId } = req.params;
  const { reason } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  order.paymentStatus = "failed";
  await order.save();
  const payment = await Payment.findOne({ order: order._id });
  if (payment) {
    payment.status = "failed";
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();
    if (reason) payment.paystackData = { rejectionReason: reason };
    await payment.save();
  }
  res.json({ message: "Payment rejected", order });
};
