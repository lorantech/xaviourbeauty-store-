import { Router } from "express";
import { initializePayment, verifyPayment, webhook, submitBankTransferProof, getPendingBankTransfers, approveBankTransfer, rejectBankTransfer } from "../controllers/paymentController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.post("/initialize", authenticate, initializePayment);
router.get("/verify/:reference", verifyPayment);
router.post("/webhook", webhook);
router.post("/bank-transfer/submit", authenticate, submitBankTransferProof);
router.get("/bank-transfer/pending", authenticate, getPendingBankTransfers);
router.post("/bank-transfer/:orderId/approve", authenticate, approveBankTransfer);
router.post("/bank-transfer/:orderId/reject", authenticate, rejectBankTransfer);
export default router;
