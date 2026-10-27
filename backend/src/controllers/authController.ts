import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User";
import { signToken } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already registered", 409);
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });
  const token = signToken(user._id.toString());
  res.cookie("token", token, { httpOnly: true, secure: env.nodeEnv === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 401);
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError("Invalid credentials", 401);
  const token = signToken(user._id.toString());
  res.cookie("token", token, { httpOnly: true, secure: env.nodeEnv === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

export const me = async (req: any, res: Response) => {
  res.json({ user: req.user });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If the email exists, a reset link has been sent" });
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  const resetLink = `${env.resetUrl}?token=${token}`;
  // Email sending optional; log for dev
  console.log("Password reset link:", resetLink);
  res.json({ message: "If the email exists, a reset link has been sent", resetLink: env.nodeEnv !== "production" ? resetLink : undefined });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: new Date() } });
  if (!user) throw new AppError("Invalid or expired token", 400);
  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: "Password reset successful" });
};
