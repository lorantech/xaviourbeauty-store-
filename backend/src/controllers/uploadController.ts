import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { AppError } from "../middleware/errorHandler";

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
