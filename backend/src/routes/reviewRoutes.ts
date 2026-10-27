import { Router } from "express";
import { listReviews, createReview, adminListReviews, updateReviewStatus } from "../controllers/reviewController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.get("/product/:id", listReviews);
router.post("/product/:id", authenticate, createReview);
router.get("/admin/all", authenticate, requireAdmin, adminListReviews);
router.patch("/admin/:id/status", authenticate, requireAdmin, updateReviewStatus);
export default router;
