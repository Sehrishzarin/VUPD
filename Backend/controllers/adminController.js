import User from "../models/User.js";
import Duty from "../models/Duty.js";

export const getPending = async (req, res) => {
  try {
    const pending = await User.find({ isApproved: false, role: { $in: ["invigilator", "superintendent"] } }).select("-password");
    res.json(pending);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.isApproved = true;
    await user.save();
    res.json({ msg: "Approved", user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ msg: "User rejected and removed" });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const availableUsers = async (req, res) => {
  try {
    const { date, timeSlot, role } = req.query;

    // 1. Basic Validation
    if (!date || !timeSlot || !role) {
      return res.status(400).json({ msg: "date, timeSlot, and role are required" });
    }

    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date format" });
    }

    // 2. Fetch Users
    // CRITICAL FIX: Removed "unavailableDates" from .select() to avoid "Mixed Projection" error.
    // unavailableDates is included automatically because it is in the Schema.
    const users = await User.find({ 
      role: role.toLowerCase(), 
      isApproved: true 
    }).select("-password");

    // 3. Determine Clashing Slots
    // If assigning "Full Day", it clashes with everything.
    // If assigning a specific slot, it clashes with itself AND "Full Day".
    let clashingSlots = [timeSlot];
    if (timeSlot.includes("Full Day")) {
      clashingSlots = [
        "Morning (09:00-12:00)", 
        "Afternoon (13:00-16:00)", 
        "Evening (17:00-20:00)", 
        "Full Day (09:00-17:00)"
      ];
    } else {
      clashingSlots.push("Full Day (09:00-17:00)");
    }

    // 4. Find Duties that make users busy
    // We use a UTC date range to ensure we catch duties on that specific day regardless of time
    const startOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate()));
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const duties = await Duty.find({
      date: { $gte: startOfDay, $lt: endOfDay },
      timeSlot: { $in: clashingSlots }
    });
    
    // Create a list of IDs that are busy
    const busyIds = duties.map(d => d.assignedTo.toString());

    // 5. Filter Users (Remove Busy & Unavailable)
    const available = users.filter(u => {
      // Check 1: Is the user already assigned a duty?
      if (busyIds.includes(u._id.toString())) {
        return false;
      }

      // Check 2: Did the user mark themselves as unavailable in their profile?
      // (Matches the Fix 1 Model change)
      if (u.unavailableDates && u.unavailableDates.length > 0) {
        // Check if ANY of their unavailable dates match the query date
        const isUnavailable = u.unavailableDates.some(unavailableDate => {
          const d = new Date(unavailableDate);
          return d.toDateString() === queryDate.toDateString();
        });
        
        if (isUnavailable) {
          return false;
        }
      }
      
      return true;
    });

    // 6. Return the list
    res.json(available);

  } catch (err) { 
    console.error("availableUsers Error:", err);
    res.status(500).json({ msg: err.message }); 
  }
};
// Get ALL users (approved and pending)
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users except the current admin
    const users = await User.find({ 
      _id: { $ne: req.user._id },
      role: { $ne: 'admin' } // Optional: hide other admins if any
    }).select("-password").sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};