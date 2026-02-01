// backend/routes/notificationRoutes.js
import express from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("✅ Notification routes loaded");

// User routes
router.get("/", verifyToken, getUserNotifications);
router.patch("/:notificationId/read", verifyToken, markAsRead);
router.patch("/read-all", verifyToken, markAllAsRead);
router.delete("/:notificationId", verifyToken, deleteNotification);
router.delete("/", verifyToken, clearAllNotifications);

export default router;