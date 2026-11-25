import { Request, Response } from "express";
import { Notification } from "../models/Notification";
import { AppError } from "../middleware/errorHandler";

export const listNotifications = async (_req: Request, res: Response) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ read: false });
  res.json({ notifications, unreadCount });
};

export const unreadCount = async (_req: Request, res: Response) => {
  const count = await Notification.countDocuments({ read: false });
  res.json({ count });
};

export const markRead = async (req: Request, res: Response) => {
  const n = await Notification.findById(req.params.id);
  if (!n) throw new AppError("Not found", 404);
  n.read = true;
  n.readAt = new Date();
  await n.save();
  res.json({ notification: n });
};

export const markAllRead = async (_req: Request, res: Response) => {
  await Notification.updateMany({ read: false }, { $set: { read: true, readAt: new Date() } });
  res.json({ ok: true });
};

export const removeNotification = async (req: Request, res: Response) => {
  const n = await Notification.findById(req.params.id);
  if (!n) throw new AppError("Not found", 404);
  await n.deleteOne();
  res.json({ ok: true });
};
