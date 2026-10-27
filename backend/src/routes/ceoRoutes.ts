import { Router } from "express";
import { listPublicCEO, getFeaturedCEO, getCEO, adminListCEO, createCEO, updateCEO, deleteCEO, publishCEO } from "../controllers/ceoController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.get("/", listPublicCEO);
router.get("/featured", getFeaturedCEO);
router.get("/:id", getCEO);
router.get("/admin/all", authenticate, requireAdmin, adminListCEO);
router.post("/admin", authenticate, requireAdmin, createCEO);
router.patch("/admin/:id", authenticate, requireAdmin, updateCEO);
router.delete("/admin/:id", authenticate, requireAdmin, deleteCEO);
router.post("/admin/:id/publish", authenticate, requireAdmin, publishCEO);
export default router;
