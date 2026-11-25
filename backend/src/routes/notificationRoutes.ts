import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { listNotifications, unreadCount, markRead, markAllRead, removeNotification } from "../controllers/notificationController";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listNotifications);
router.get("/unread-count", unreadCount);
router.patch("/:id/read", markRead);
router.patch("/read-all", markAllRead);
router.delete("/:id", removeNotification);
export default router;
