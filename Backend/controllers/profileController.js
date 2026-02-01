
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs"; 


const deleteOldAvatar = (avatarPath) => {
  if (avatarPath) {
    const fullPath = path.join(process.cwd(), avatarPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, password, preferredCenter, qualification, contact, unavailableDates } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (preferredCenter) updates.preferredCenter = Array.isArray(preferredCenter) ? preferredCenter : [preferredCenter];
    if (qualification) updates.qualification = qualification;
    if (contact) updates.contact = contact;

    // Handle unavailableDates
    if (unavailableDates) {
        // Ensure it parses correctly from JSON string if sent as formData
        const dates = typeof unavailableDates === 'string' ? JSON.parse(unavailableDates) : unavailableDates;
        updates.unavailableDates = dates.map(d => new Date(d));
    }


    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      const user = await User.findById(req.user._id);
      if (user.avatar) {
        deleteOldAvatar(user.avatar);
      }
      updates.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
