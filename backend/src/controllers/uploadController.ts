import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { AppError } from "../middleware/errorHandler";

function detectReceiptMime(buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | "application/pdf" | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a) return "image/png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  return null;
}

export const uploadImage = async (req: any, res: Response) => {
  if (!req.file) throw new AppError("No file", 400);
  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "xaviourbeautystore", resource_type: "auto" }, (err, r) => {
      if (err) reject(err); else resolve(r);
    });
    stream.end(req.file.buffer);
  });
  res.json({ url: result.secure_url, publicId: result.public_id });
};

export const uploadReceipt = async (req: any, res: Response) => {
  if (!req.file) throw new AppError("No file", 400);
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(req.file.mimetype)) throw new AppError("Receipt must be JPG, PNG, WEBP, or PDF", 400);
  const detected = detectReceiptMime(req.file.buffer);
  if (!detected || !allowed.includes(detected)) throw new AppError("Invalid receipt file content", 400);
  if (req.file.mimetype !== detected && !(req.file.mimetype === "image/webp" && detected === "image/webp")) {
    throw new AppError("Receipt file type mismatch", 400);
  }
  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "xaviourbeautystore/receipts", resource_type: "auto" },
      (err, r) => { if (err) reject(err); else resolve(r); }
    );
    stream.end(req.file.buffer);
  });
  res.json({ url: result.secure_url, publicId: result.public_id, name: req.file.originalname, mimeType: detected });
};

export const uploadMultiple = async (req: any, res: Response) => {
  if (!req.files || req.files.length === 0) throw new AppError("No files", 400);
  const urls: string[] = [];
  for (const f of req.files) {
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "xaviourbeautystore", resource_type: "auto" }, (err, r) => {
        if (err) reject(err); else resolve(r);
      });
      stream.end(f.buffer);
    });
    urls.push(result.secure_url);
  }
  res.json({ urls });
};
