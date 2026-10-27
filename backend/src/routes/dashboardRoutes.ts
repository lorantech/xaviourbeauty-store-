import { Router } from "express";
import { dashboard, listCustomers, storeSettingsGet, storeSettingsUpdate } from "../controllers/dashboardController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.get("/", authenticate, requireAdmin, dashboard);
router.get("/customers", authenticate, requireAdmin, listCustomers);
router.get("/settings", authenticate, requireAdmin, storeSettingsGet);
router.patch("/settings", authenticate, requireAdmin, storeSettingsUpdate);
export default router;
