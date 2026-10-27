import { Router } from "express";
import { initializePayment, verifyPayment, webhook } from "../controllers/paymentController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.post("/initialize", authenticate, initializePayment);
router.get("/verify/:reference", verifyPayment);
router.post("/webhook", webhook);
export default router;
