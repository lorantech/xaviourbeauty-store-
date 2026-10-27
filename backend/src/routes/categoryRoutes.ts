import { Router } from "express";
import { listCategories, listAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();
router.get("/", listCategories);
router.get("/all", authenticate, requireAdmin, listAllCategories);
router.post("/", authenticate, requireAdmin, createCategory);
router.patch("/:id", authenticate, requireAdmin, updateCategory);
router.delete("/:id", authenticate, requireAdmin, deleteCategory);
export default router;
