import { Router } from "express";
import { initializePayment, verifyPayment, submitBankTransferProof, getPendingBankTransfers, approveBankTransfer, rejectBankTransfer } from "../controllers/paymentController";
import { authenticate, authenticateOptional } from "../middleware/auth";

const router = Router();
router.post("/initialize", authenticateOptional, initializePayment);
router.get("/verify/:reference", verifyPayment);
router.post("/bank-transfer/submit", authenticateOptional, submitBankTransferProof);
router.get("/bank-transfer/pending", authenticate, getPendingBankTransfers);
router.post("/bank-transfer/:orderId/approve", authenticate, approveBankTransfer);
router.post("/bank-transfer/:orderId/reject", authenticate, rejectBankTransfer);
export default router;
