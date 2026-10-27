import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: any;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded: any = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
}

export async function authenticateOptional(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
    if (!token) return next();
    const decoded: any = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as any);
}
