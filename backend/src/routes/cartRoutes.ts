import { Router } from "express";
import { getCart, addItem, updateItem, removeItem } from "../controllers/cartController";
import { authenticateOptional } from "../middleware/auth";

const router = Router();
router.get("/", authenticateOptional, getCart);
router.post("/items", authenticateOptional, addItem);
router.patch("/items/:itemId", authenticateOptional, updateItem);
router.delete("/items/:itemId", authenticateOptional, removeItem);
export default router;
