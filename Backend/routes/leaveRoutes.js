// backend/routes/leaveRoutes.js
import express from "express";
import { 
  requestLeave, 
  getLeaveRequests, 
  reviewLeaveRequest 
} from "../controllers/leaveController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("✅ Leave routes loaded");

// User routes
router.post("/request", verifyToken, requestLeave);
router.get("/", verifyToken, getLeaveRequests);

// Admin routes
router.patch("/:id/status", verifyToken, verifyAdmin, reviewLeaveRequest);

export default router;