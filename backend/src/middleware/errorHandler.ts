import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Client-side data problems must not be reported as 500s — the browser/axios
 * treats a 500 as a server fault and hides the useful message. Mongoose
 * validation and cast failures are 400s.
 */
const resolveStatus = (err: any): number => {
  if (typeof err?.statusCode === "number") return err.statusCode;
  if (err?.name === "ValidationError" || err?.name === "ValidatorError") return 400;
  if (err?.name === "CastError") return 400;
  if (err?.code === 11000) return 409; // duplicate key
  if (err?.type === "entity.parse.failed") return 400; // malformed JSON body
  return 500;
};

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = resolveStatus(err);
  const message = err.message || "Internal server error";
  if (process.env.NODE_ENV !== "production") console.error(err);
  res.status(status).json({ message });
}

export const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
