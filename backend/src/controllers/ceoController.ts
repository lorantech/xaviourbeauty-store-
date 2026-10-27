import { Request, Response } from "express";
import { CEOMessage } from "../models/CEOMessage";
import { AppError } from "../middleware/errorHandler";

export const listPublicCEO = async (req: Request, res: Response) => {
  const now = new Date();
  const msgs = await CEOMessage.find({
    status: "published",
    $and: [{ $or: [{ publishedAt: { $lte: now } }, { publishedAt: null }] }, { $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }] }],
  }).sort({ publishedAt: -1, createdAt: -1 });
  res.json({ messages: msgs });
};

export const getFeaturedCEO = async (req: Request, res: Response) => {
  const now = new Date();
  const msg = await CEOMessage.findOne({
    status: "published",
    featuredInHero: true,
    $and: [{ $or: [{ publishedAt: { $lte: now } }, { publishedAt: null }] }, { $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }] }],
  }).sort({ publishedAt: -1, createdAt: -1 });
  res.json({ message: msg || null });
};

export const getCEO = async (req: Request, res: Response) => {
  const msg = await CEOMessage.findById(req.params.id);
  if (!msg) throw new AppError("Not found", 404);
  res.json({ message: msg });
};

export const adminListCEO = async (req: Request, res: Response) => {
  const msgs = await CEOMessage.find().sort({ createdAt: -1 });
  res.json({ messages: msgs });
};

export const createCEO = async (req: any, res: Response) => {
  const data = { ...req.body, createdBy: req.user._id, updatedBy: req.user._id };
  if (data.status === "published" && !data.publishedAt) data.publishedAt = new Date();
  const msg = await CEOMessage.create(data);
  res.status(201).json({ message: msg });
};

export const updateCEO = async (req: any, res: Response) => {
  const msg = await CEOMessage.findById(req.params.id);
  if (!msg) throw new AppError("Not found", 404);
  Object.assign(msg, req.body, { updatedBy: req.user._id });
  if (req.body.status === "published" && !msg.publishedAt) msg.publishedAt = new Date();
  await msg.save();
  res.json({ message: msg });
};

export const deleteCEO = async (req: Request, res: Response) => {
  await CEOMessage.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

export const publishCEO = async (req: any, res: Response) => {
  const msg = await CEOMessage.findById(req.params.id);
  if (!msg) throw new AppError("Not found", 404);
  msg.status = "published";
  if (!msg.publishedAt) msg.publishedAt = new Date();
  msg.updatedBy = req.user._id;
  await msg.save();
  res.json({ message: msg });
};
