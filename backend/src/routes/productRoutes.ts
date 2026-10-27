import { Router } from "express";
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.get("/", listProducts);
router.get("/:slug", getProduct);
router.post("/", authenticate, requireAdmin, createProduct);
router.patch("/:id", authenticate, requireAdmin, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);
export default router;
