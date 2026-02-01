// backend/controllers/attendanceController.js
import AttendanceReport from "../models/AttendanceReport.js";
import Duty from "../models/Duty.js";
import User from "../models/User.js";
import createDebug from "debug";
import mongoose from "mongoose";

const debug = createDebug("app:attendanceController");

// Generate comprehensive attendance report
export const generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, examName, center, timeSlot, generateNew } = req.query;
    console.log("Generate Attendance Report Params:", req.query);
    // Build query
    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

     console.log("Step 1");
    if (examName) query.examName = examName;
    if (center) query.center = center;
    if (timeSlot) query.timeSlot = timeSlot;

     console.log("Step 2");
    // Check if we should use existing report or generate new
    if (!generateNew) {
      const existingReport = await AttendanceReport.findOne(query)
        .sort({ generatedAt: -1 });
      
      if (existingReport) {
        return res.json({
          msg: "Existing report found",
          report: existingReport,
          generatedAt: existingReport.generatedAt
        });
      }
    }

    console.log("Step 3");
    console.log("Generating new attendance report with query:", query);
    // Get duties for the report
    const qurycheck = { "examName": examName, "timeSlot": timeSlot ,  "center" :  center }
    const duties = await Duty.find(qurycheck)
      .populate("assignedTo", "name employeeId role")
      .sort({ date: 1, timeSlot: 1 });
    console.log("Duties fetched for report generation:", duties.length);
    if (duties.length === 0) {
      return res.status(404).json({ msg: "No duties found for the specified criteria" });
    }

    // Calculate statistics
    const presentDuties = duties.filter(d => 
      d.attendanceStatus === "present" || d.attendanceStatus === "late"
    );
    const absentDuties = duties.filter(d => d.attendanceStatus === "absent");
    const excusedDuties = duties.filter(d => d.attendanceStatus === "excused");
    const pendingDuties = duties.filter(d => d.attendanceStatus === "pending");
    const lateDuties = duties.filter(d => d.attendanceStatus === "late");

    const totalAssigned = duties.length;
    const presentCount = presentDuties.length;
    const lateCount = lateDuties.length;
    const absentCount = absentDuties.length;
    const excusedCount = excusedDuties.length;
    const pendingCount = pendingDuties.length;

    const attendanceRate = totalAssigned > 0 ? (presentCount / totalAssigned) * 100 : 0;
    const lateRate = totalAssigned > 0 ? (lateCount / totalAssigned) * 100 : 0;

    // Calculate role breakdown
    const roleBreakdown = {
      superintendent: { total: 0, present: 0, absent: 0, late: 0 },
      invigilator: { total: 0, present: 0, absent: 0, late: 0 }
    };

    duties.forEach(duty => {
      const role = duty.assignedToRole;
      if (roleBreakdown[role]) {
        roleBreakdown[role].total++;
        if (duty.attendanceStatus === "present" || duty.attendanceStatus === "late") {
          roleBreakdown[role].present++;
        } else if (duty.attendanceStatus === "absent") {
          roleBreakdown[role].absent++;
        }
        if (duty.attendanceStatus === "late") {
          roleBreakdown[role].late++;
        }
      }
    });

    // Create duty records
    const dutyRecords = duties.map(duty => ({
      dutyId: duty._id,
      userId: duty.assignedTo._id,
      userName: duty.assignedTo.name,
      userRole: duty.assignedToRole,
      employeeId: duty.assignedTo.employeeId,
      attendanceStatus: duty.attendanceStatus,
      attendanceMarkedAt: duty.attendanceMarkedAt,
      paymentAmount: duty.paymentAmount
    }));

    // Create new attendance report
    const attendanceReport = new AttendanceReport({
      examName: examName || "Multiple Exams",
      date: startDate ? new Date(startDate) : new Date(),
      center: center || "All Centers",
      timeSlot: timeSlot || "All Slots",
      totalAssigned,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      pendingCount,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      lateRate: parseFloat(lateRate.toFixed(2)),
      roleBreakdown,
      dutyRecords,
      generatedBy: req.user._id
    });

    await attendanceReport.save();

    res.json({
      msg: "Attendance report generated successfully",
      report: attendanceReport,
      generatedAt: attendanceReport.generatedAt
    });
  } catch (err) {
    debug("generateAttendanceReport error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get all attendance reports
export const getAttendanceReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'generatedAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await AttendanceReport.find()
      .populate("generatedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AttendanceReport.countDocuments();

    res.json({
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    debug("getAttendanceReports error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get specific attendance report
export const getAttendanceReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await AttendanceReport.findById(reportId)
      .populate("generatedBy", "name email")
      .populate("dutyRecords.dutyId")
      .populate("dutyRecords.userId", "name email phone");

    if (!report) {
      return res.status(404).json({ msg: "Attendance report not found" });
    }

    res.json({
      msg: "Attendance report retrieved successfully",
      report
    });
  } catch (err) {
    debug("getAttendanceReportById error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get real-time attendance dashboard data
export const getAttendanceDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's duties
    const todaysDuties = await Duty.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate("assignedTo", "name role");

    // This week's duties (last 7 days)
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeksDuties = await Duty.find({
      date: { $gte: weekStart }
    });

    // Calculate dashboard statistics
    const todaysStats = {
      total: todaysDuties.length,
      present: todaysDuties.filter(d => d.attendanceStatus === "present").length,
      late: todaysDuties.filter(d => d.attendanceStatus === "late").length,
      absent: todaysDuties.filter(d => d.attendanceStatus === "absent").length,
      pending: todaysDuties.filter(d => d.attendanceStatus === "pending").length
    };

    const weeklyStats = {
      total: weeksDuties.length,
      present: weeksDuties.filter(d => 
        d.attendanceStatus === "present" || d.attendanceStatus === "late"
      ).length,
      attendanceRate: weeksDuties.length > 0 ? 
        (weeksDuties.filter(d => 
          d.attendanceStatus === "present" || d.attendanceStatus === "late"
        ).length / weeksDuties.length) * 100 : 0
    };

    // Recent attendance activities
    const recentAttendance = await Duty.find({
      attendanceMarkedAt: { $exists: true }
    })
    .populate("assignedTo", "name role")
    .sort({ attendanceMarkedAt: -1 })
    .limit(10);

    res.json({
      todaysStats,
      weeklyStats,
      recentAttendance: recentAttendance.map(duty => ({
        examName: duty.examName,
        userName: duty.assignedTo.name,
        userRole: duty.assignedTo.role,
        status: duty.attendanceStatus,
        markedAt: duty.attendanceMarkedAt,
        center: duty.center
      })),
      generatedAt: new Date()
    });
  } catch (err) {
    debug("getAttendanceDashboard error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Export attendance report as CSV
export const exportAttendanceReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await AttendanceReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ msg: "Attendance report not found" });
    }

    // Create CSV header
    let csv = 'Employee ID,Name,Role,Exam,Date,Time Slot,Center,Status,Marked At,Payment\n';
    
    // Add data rows
    report.dutyRecords.forEach(record => {
      csv += `"${record.employeeId || 'N/A'}","${record.userName}","${record.userRole}","${report.examName}","${report.date.toISOString().split('T')[0]}","${report.timeSlot}","${report.center}","${record.attendanceStatus}","${record.attendanceMarkedAt || 'N/A'}","${record.paymentAmount || 0}"\n`;
    });

    // Add summary
    csv += `\nSUMMARY\n`;
    csv += `Total Assigned,${report.totalAssigned}\n`;
    csv += `Present,${report.presentCount}\n`;
    csv += `Late,${report.lateCount}\n`;
    csv += `Absent,${report.absentCount}\n`;
    csv += `Excused,${report.excusedCount}\n`;
    csv += `Attendance Rate,${report.attendanceRate}%\n`;
    csv += `Late Rate,${report.lateRate}%\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${reportId}.csv`);
    res.send(csv);
  } catch (err) {
    debug("exportAttendanceReport error:", err);
    res.status(500).json({ msg: err.message });
  }
};