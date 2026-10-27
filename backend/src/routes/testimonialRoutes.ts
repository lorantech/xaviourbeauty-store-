import { Router } from "express";
import { listPublicTestimonials, getTestimonial, adminListTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "../controllers/testimonialController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.get("/", listPublicTestimonials);
router.get("/:id", getTestimonial);
router.get("/admin/all", authenticate, requireAdmin, adminListTestimonials);
router.post("/admin", authenticate, requireAdmin, createTestimonial);
router.patch("/admin/:id", authenticate, requireAdmin, updateTestimonial);
router.delete("/admin/:id", authenticate, requireAdmin, deleteTestimonial);
export default router;
