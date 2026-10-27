import { Request, Response } from "express";
import axios from "axios";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

export const initializePayment = async (req: any, res: Response) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.customer.toString() !== req.user._id.toString()) throw new AppError("Forbidden", 403);
  if (order.paymentStatus === "paid") throw new AppError("Already paid", 400);

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
    await Payment.create({ order: order._id, reference, amount: order.total, currency: "NGN", status: "pending" });
    order.paymentReference = reference;
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

export const webhook = async (req: any, res: Response) => {
  const crypto = await import("crypto");
  const raw = req.rawBody ? (Buffer.isBuffer(req.rawBody) ? req.rawBody.toString() : String(req.rawBody)) : JSON.stringify(req.body);
  const hash = crypto.createHmac("sha512", env.paystackSecret).update(raw).digest("hex");
  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).json({ message: "Invalid signature" });
  }
  const event = req.body;
  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const payment = await Payment.findOne({ reference });
    if (payment && payment.status !== "success") {
      // verify amount
      const order = await Order.findById(payment.order);
      if (order) {
        const expectedKobo = Math.round(order.total * 100);
        if (event.data.amount === expectedKobo) {
          payment.status = "success";
          payment.verifiedAt = new Date();
          payment.paystackData = event.data;
          await payment.save();
          order.paymentStatus = "paid";
          order.fulfilmentStatus = "paid";
          await order.save();
        }
      }
    }
  }
  res.sendStatus(200);
};
