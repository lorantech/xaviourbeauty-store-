import { Router } from "express";
import { deleteMedia, listMedia, uploadMedia } from "../controllers/mediaController";
import { authenticate, requireAdmin } from "../middleware/auth";
import { receiveMediaFiles } from "../middleware/upload";

const router = Router();

router.use(authenticate, requireAdmin);
router.post("/", receiveMediaFiles, uploadMedia);
router.get("/", listMedia);
router.delete("/:id", deleteMedia);

export default router;
