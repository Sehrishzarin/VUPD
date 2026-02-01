// backend/controllers/notificationController.js
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import createDebug from "debug";

const debug = createDebug("app:notificationController");

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      unreadCount
    });
  } catch (err) {
    debug("getUserNotifications error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json({ 
      msg: "Notification marked as read", 
      notification 
    });
  } catch (err) {
    debug("markAsRead error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ 
      msg: "All notifications marked as read", 
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    debug("markAllAsRead error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    res.json({ 
      msg: "Notification deleted", 
      notification 
    });
  } catch (err) {
    debug("deleteNotification error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ userId });

    res.json({ 
      msg: "All notifications cleared", 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    debug("clearAllNotifications error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Helper function to create notifications (to be used by other controllers)
export const createNotification = async (userId, type, title, message, data = null, priority = 'medium') => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      priority
    });

    await notification.save();
    
    // Populate user data for socket emission
    await notification.populate('userId', 'name email role');
    
    return notification;
  } catch (err) {
    debug("createNotification error:", err);
    throw err;
  }
};