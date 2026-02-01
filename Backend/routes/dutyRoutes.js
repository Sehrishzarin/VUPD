// backend/routes/dutyRoutes.js
import express from "express";
import {
  assignDuty,
  getDuties,
  getAttendanceReport,
  approvePayments,
  autoMarkAbsentees,
  getMyDuties,
  markAttendance,
  uploadReport,
  getDutyStats,
  verifyAttendance
} from "../controllers/dutyController.js";
import upload from "../middleware/multer.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

console.log("✅ Duty routes loaded");

// Admin routes
router.post("/assign/:id", verifyToken, verifyAdmin, assignDuty);
router.get("/", verifyToken, verifyAdmin, getDuties);
router.get("/report", verifyToken, verifyAdmin, getAttendanceReport);
router.post("/payments/approve", verifyToken, verifyAdmin, approvePayments);
router.post("/auto/absentees", verifyToken, verifyAdmin, autoMarkAbsentees);
router.patch("/attendance/:dutyId/verify", verifyToken, verifyAdmin, verifyAttendance);

// User routes
router.get("/me", verifyToken, getMyDuties);
router.put("/attendance/:dutyId", verifyToken, markAttendance);
router.post("/reports/upload", verifyToken, uploadReport, upload);
router.get("/stats", verifyToken, getDutyStats);

export default router;