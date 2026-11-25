import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "./errorHandler";

const storage = multer.memoryStorage();
const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

export const receiveMediaFiles = (req: Request, res: Response, next: NextFunction) => {
  upload.array("files", 10)(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new AppError("Each file must be 50 MB or smaller.", 413));
        return;
      }
      if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
        next(new AppError('Upload up to 10 files using the "files" field.', 400));
        return;
      }
      next(new AppError("Invalid media upload.", 400));
      return;
    }

    if (error.message === "Invalid file type") {
      next(new AppError("Unsupported file type. Upload an image or video.", 415));
      return;
    }
    next(error);
  });
};
