import { Router } from "express";
import { createOrder, myOrders, getOrder, adminListOrders, updateOrderStatus } from "../controllers/orderController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.post("/", authenticate, createOrder);
router.get("/my-orders", authenticate, myOrders);
router.get("/:id", authenticate, getOrder);
router.get("/admin/all", authenticate, requireAdmin, adminListOrders);
router.patch("/admin/:id/status", authenticate, requireAdmin, updateOrderStatus);
export default router;
