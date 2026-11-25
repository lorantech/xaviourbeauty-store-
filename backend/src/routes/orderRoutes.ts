import { Router } from "express";
import { createOrder, myOrders, getOrder, getOrderByReference, adminListOrders, updateOrderStatus, publicBankDetails } from "../controllers/orderController";
import { authenticate, authenticateOptional, requireAdmin } from "../middleware/auth";

const router = Router();
router.post("/", authenticateOptional, createOrder);
router.get("/my-orders", authenticate, myOrders);
router.get("/bank-details", publicBankDetails);
router.get("/reference/:reference", authenticateOptional, getOrderByReference);
router.get("/:id", authenticateOptional, getOrder);
router.get("/admin/all", authenticate, requireAdmin, adminListOrders);
router.patch("/admin/:id/status", authenticate, requireAdmin, updateOrderStatus);
export default router;
