import { Router } from "express";
import { uploadImage, uploadMultiple } from "../controllers/uploadController";
import { upload } from "../middleware/upload";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.post("/image", authenticate, requireAdmin, upload.single("file"), uploadImage);
router.post("/images", authenticate, requireAdmin, upload.array("files", 10), uploadMultiple);
export default router;
