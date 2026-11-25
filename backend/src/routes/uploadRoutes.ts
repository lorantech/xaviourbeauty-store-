import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { uploadImage, uploadMultiple, uploadReceipt } from "../controllers/uploadController";
import { upload } from "../middleware/upload";
import { authenticate, requireAdmin } from "../middleware/auth";

const receiptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many receipt uploads. Please try again later." },
});

const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid receipt type"));
  },
});

const router = Router();
router.post("/image", authenticate, requireAdmin, upload.single("file"), uploadImage);
router.post("/images", authenticate, requireAdmin, upload.array("files", 10), uploadMultiple);
router.post("/receipt", receiptLimiter, receiptUpload.single("file"), uploadReceipt);
export default router;
