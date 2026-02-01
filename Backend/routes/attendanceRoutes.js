// backend/routes/attendanceRoutes.js
import express from "express";
import {
  generateAttendanceReport,
  getAttendanceReports,
  getAttendanceReportById,
  getAttendanceDashboard,
  exportAttendanceReport
} from "../controllers/attendanceController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("✅ Attendance routes loaded");

// Admin routes
router.get("/reports", verifyToken, verifyAdmin, getAttendanceReports);
router.get("/reports/generate", verifyToken, verifyAdmin, generateAttendanceReport);
router.get("/reports/:reportId", verifyToken, verifyAdmin, getAttendanceReportById);
router.get("/reports/:reportId/export", verifyToken, verifyAdmin, exportAttendanceReport);
router.get("/dashboard", verifyToken, verifyAdmin, getAttendanceDashboard);

export default router;