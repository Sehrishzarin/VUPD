// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------- Axios instance with interceptors ----------
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  console.log("AuthContext - VITE_API_URL from env:", import.meta.env.VITE_API_URL);
  console.log("AuthContext - Using API URL:", apiUrl);
  
  const authAxios = axios.create({
    baseURL: apiUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add token dynamically - set up immediately
  authAxios.interceptors.request.use(
    (config) => {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        // Ensure Authorization header is set correctly
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${currentToken}`;
        console.log("✅ Token attached to request:", config.url);
        console.log("✅ Authorization header set:", config.headers.Authorization?.substring(0, 30) + "...");
        console.log("✅ Full config headers:", JSON.stringify(config.headers, null, 2));
      } else {
        console.error("❌ No token found in localStorage for request:", config.url);
      }
      return config;
    },
    (error) => {
      console.error("❌ Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling - set up immediately
  authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const errorMsg = error.response?.data?.msg || "Unauthorized";
        console.log("401 Error:", errorMsg);
        console.log("401 Error details:", error.response?.data);
        
        // Only clear token and redirect if it's a real authentication failure
        // Don't clear if we're already on the login page (avoid redirect loops)
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('/login');
        
        if (!isLoginPage && (errorMsg.includes("no token") || errorMsg.includes("Token invalid") || errorMsg.includes("User not found"))) {
          console.log("Clearing session due to authentication failure");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken("");
          setUser(null);
          
          // Redirect to login page based on current route
          if (currentPath.includes('/admin')) {
            navigate("/admin/login");
          } else if (currentPath.includes('/invigilator')) {
            navigate("/invigilator/login");
          } else if (currentPath.includes('/superintendent')) {
            navigate("/superintendent/login");
          } else {
            navigate("/");
          }
        }
      }
      return Promise.reject(error);
    }
  );

  // ---------- LocalStorage Sync ----------
  useEffect(() => {
    token ? localStorage.setItem("token", token) : localStorage.removeItem("token");
    user ? localStorage.setItem("user", JSON.stringify(user)) : localStorage.removeItem("user");
  }, [token, user]);

  // ---------- Socket.IO Connection ----------
  useEffect(() => {
    if (user?._id && token) {
      // Disconnect existing socket
      if (socket) {
        socket.disconnect();
      }

      const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
        auth: {
          token: token
        }
      });

      newSocket.emit("registerUser", user._id);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("notification", (data) => {
        console.log("New notification:", data);
        toast.info(data.message || "New notification received");
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user?._id, token]);

  // ---------- AUTH METHODS ----------
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/login`, { email, password });
      const userRole = data.user?.role;
      if (!userRole) throw new Error("Role not found in response");

      setToken(data.token);
      setUser({ ...data.user, role: userRole });

      toast.success(`Welcome back, ${data.user.name || "User"}!`);

      if (userRole === "admin") navigate("/admin/dashboard");
      else if (userRole === "invigilator") navigate("/invigilator/dashboard");
      else if (userRole === "superintendent") navigate("/superintendent/dashboard");
      else navigate("/");
      
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Login failed";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      setError("");
      // Use regular axios for registration (public endpoint, no auth required)
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/register`, 
        formData
      );
      toast.success("Registration successful! Await approval.");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Registration failed";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data } = await authAxios.get("/auth/profile");
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("Fetch profile error:", err);
      throw err;
    }
  };

  const logout = () => {
    if (socket) {
      socket.disconnect();
    }
    setToken("");
    setUser(null);
    setSocket(null);
    localStorage.clear();
    toast.info("Logged out");
    navigate("/");
  };

  // ---------- Setup axios interceptor for 401 errors ----------
  useEffect(() => {
    // Response interceptor for error handling
    const interceptor = authAxios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle 401 directly without calling logout to avoid circular dependency
          setToken("");
          setUser(null);
          if (socket) {
            socket.disconnect();
          }
          setSocket(null);
          localStorage.clear();
          toast.error("Session expired. Please login again.");
          navigate("/");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      authAxios.interceptors.response.eject(interceptor);
    };
  }, [navigate, socket]); // Include dependencies

  // ---------- ADMIN METHODS ----------
  const getPendingUsers = async () => {
    try {
      const { data } = await authAxios.get("/admin/pending");
      return data;
    } catch (err) {
      console.error("Get pending users error:", err);
      throw err;
    }
  };

  const approveUser = async (userId) => {
    try {
      const { data } = await authAxios.patch(`/admin/approve/${userId}`);
      toast.success("User approved successfully!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Approval failed";
      toast.error(errorMsg);
      throw err;
    }
  };

  const rejectUser = async (userId) => {
    try {
      const { data } = await authAxios.delete(`/admin/reject/${userId}`);
      toast.success("User rejected successfully!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Rejection failed";
      toast.error(errorMsg);
      throw err;
    }
  };

  const getAvailableUsers = async (params) => {
    try {
      const { data } = await authAxios.get("/admin/available", { params });
      return data;
    } catch (err) {
      console.error("Get available users error:", err);
      throw err;
    }
  };
const getAllUsers = async () => {
    try {
      const { data } = await authAxios.get("/admin/users");
      return data;
    } catch (err) {
      console.error("Get all users error:", err);
      throw err;
    }
  };
  // ---------- DUTY METHODS ----------
  const getAllDuties = async (params = {}) => {
    try {
      const token = localStorage.getItem("token");
      console.log("getAllDuties - Token exists:", !!token);
      console.log("getAllDuties - BaseURL:", authAxios.defaults.baseURL);
      const { data } = await authAxios.get("/duties", { params });
      return data;
    } catch (err) {
      console.error("Get all duties error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      throw err;
    }
  };

  const assignDuty = async (userId, dutyData) => {
    try {
      setLoading(true);
      const { data } = await authAxios.post(`/duties/assign/${userId}`, dutyData);
      toast.success("Duty assigned successfully!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Duty assignment failed";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMyDuties = async (params = {}) => {
    try {
      const { data } = await authAxios.get("/duties/me", { params });
      return data;
    } catch (err) {
      console.error("Get my duties error:", err);
      throw err;
    }
  };

  const getDutyStats = async () => {
    try {
      const { data } = await authAxios.get("/duties/stats");
      return data;
    } catch (err) {
      console.error("Get duty stats error:", err);
      throw err;
    }
  };

  // ---------- ATTENDANCE METHODS ----------
  const markAttendance = async (dutyId) => {
    try {
      setLoading(true);
      const { data } = await authAxios.put(`/duties/attendance/${dutyId}`);
      toast.success("Attendance marked successfully!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to mark attendance";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyAttendance = async (dutyId, action, note = "") => {
    try {
      const { data } = await authAxios.patch(`/duties/attendance/${dutyId}/verify`, {
        action,
        note
      });
      toast.success(`Attendance ${action}ed successfully!`);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Attendance verification failed";
      toast.error(errorMsg);
      throw err;
    }
  };

  const getAttendanceReport = async (params = {}) => {
    try {
      const { data } = await authAxios.get("/duties/report", { params });
      return data;
    } catch (err) {
      console.error("Get attendance report error:", err);
      throw err;
    }
  };

  const autoMarkAbsentees = async () => {
    try {
      const { data } = await authAxios.post("/duties/auto/absentees");
      toast.success("Auto-mark absentees completed!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Auto-mark failed";
      toast.error(errorMsg);
      throw err;
    }
  };
// ---------- ATTENDANCE REPORT METHODS ----------
const generateAttendanceReport = async (params = {}) => {
  try {
    const { data } = await authAxios.get("/attendance/reports/generate", { params });
    return data;
  } catch (err) {
    console.error("Generate attendance report error:", err);
    throw err;
  }
};

const getAttendanceReports = async (params = {}) => {
  try {
    const { data } = await authAxios.get("/attendance/reports", { params });
    return data;
  } catch (err) {
    console.error("Get attendance reports error:", err);
    throw err;
  }
};

const getAttendanceDashboard = async () => {
  try {
    const { data } = await authAxios.get("/attendance/dashboard");
    return data;
  } catch (err) {
    console.error("Get attendance dashboard error:", err);
    throw err;
  }
};

const exportAttendanceReport = async (reportId) => {
  try {
    const { data } = await authAxios.get(`/attendance/reports/${reportId}/export`, {
      responseType: 'blob'
    });
    return data;
  } catch (err) {
    console.error("Export attendance report error:", err);
    throw err;
  }
};
  // ---------- LEAVE REQUEST METHODS ----------
  const requestLeave = async (dutyId, reason) => {
    try {
      setLoading(true);
      const { data } = await authAxios.post("/leaves/request", { dutyId, reason });
      toast.success("Leave request submitted successfully!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Leave request failed";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMyLeaveRequests = async () => {
    try {
      const { data } = await authAxios.get("/leaves");
      return data;
    } catch (err) {
      console.error("Get my leave requests error:", err);
      throw err;
    }
  };

  const getAllLeaveRequests = async (params = {}) => {
    try {
      const { data } = await authAxios.get("/leaves", { params });
      return data;
    } catch (err) {
      console.error("Get all leave requests error:", err);
      throw err;
    }
  };

  const reviewLeaveRequest = async (leaveId, action, adminComment = "") => {
    try {
      const { data } = await authAxios.patch(`/leaves/${leaveId}/status`, {
        action,
        adminComment
      });
      toast.success(`Leave request ${action}ed successfully!`);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Leave review failed";
      toast.error(errorMsg);
      throw err;
    }
  };

  // ---------- PAYMENT METHODS ----------
  const approvePayments = async (dutyIds, approveAll = false, filter = {}) => {
    try {
      const { data } = await authAxios.post("/duties/payments/approve", {
        dutyIds,
        approveAll,
        filter
      });
      toast.success("Payments approved successfully!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Payment approval failed";
      toast.error(errorMsg);
      throw err;
    }
  };

  const getPaymentReport = async (params = {}) => {
    try {
      const { data } = await authAxios.get("/payments/report", { params });
      return data;
    } catch (err) {
      console.error("Get payment report error:", err);
      throw err;
    }
  };

  // ---------- REPORT METHODS ----------
  const uploadReport = async (reportData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      for (const key in reportData) {
        formData.append(key, reportData[key]);
      }
      
      const { data } = await authAxios.post("/duties/reports/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Report uploaded successfully!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Report upload failed";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------- PROFILE METHODS ----------
  const getProfile = async () => {
    try {
      const { data } = await authAxios.get("/profile");
      return data;
    } catch (err) {
      console.error("Get profile error:", err);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      for (const key in profileData) {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      }
      
      const { data } = await authAxios.put("/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.user || data);
      toast.success("Profile updated successfully!");
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Profile update failed";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isUserApproved = () => user?.isApproved;

// ---------- WITHDRAWAL METHODS ----------
const getPaymentSummary = async () => {
  try {
    const { data } = await authAxios.get("/withdrawals/summary");
    return data;
  } catch (err) {
    console.error("Get payment summary error:", err);
    throw err;
  }
};

const requestWithdrawal = async (withdrawalData) => {
  try {
    setLoading(true);
    const { data } = await authAxios.post("/withdrawals/request", withdrawalData);
    toast.success("Withdrawal request submitted successfully!");
    return data;
  } catch (err) {
    const errorMsg = err.response?.data?.msg || "Withdrawal request failed";
    toast.error(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
};

const getMyWithdrawals = async (params = {}) => {
  try {
    const { data } = await authAxios.get("/withdrawals/my-withdrawals", { params });
    return data;
  } catch (err) {
    console.error("Get my withdrawals error:", err);
    throw err;
  }
};

const getAllWithdrawals = async (params = {}) => {
  try {
    const { data } = await authAxios.get("/withdrawals/admin/withdrawals", { params });
    return data;
  } catch (err) {
    console.error("Get all withdrawals error:", err);
    throw err;
  }
};

const processWithdrawal = async (withdrawalId, action, data = {}) => {
  try {
    const { data: response } = await authAxios.patch(`/withdrawals/admin/process/${withdrawalId}`, {
      action,
      ...data
    });
    toast.success(`Withdrawal ${action}d successfully!`);
    return response;
  } catch (err) {
    const errorMsg = err.response?.data?.msg || "Withdrawal processing failed";
    toast.error(errorMsg);
    throw err;
  }
};

// ---------- NOTIFICATION METHODS ----------
const getNotifications = async (params = {}) => {
  try {
    const { data } = await authAxios.get("/notifications", { params });
    return data;
  } catch (err) {
    console.error("Get notifications error:", err);
    throw err;
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    const { data } = await authAxios.patch(`/notifications/${notificationId}/read`);
    return data;
  } catch (err) {
    console.error("Mark notification as read error:", err);
    throw err;
  }
};

const markAllNotificationsAsRead = async () => {
  try {
    const { data } = await authAxios.patch("/notifications/read-all");
    return data;
  } catch (err) {
    console.error("Mark all notifications as read error:", err);
    throw err;
  }
};

const deleteNotification = async (notificationId) => {
  try {
    const { data } = await authAxios.delete(`/notifications/${notificationId}`);
    return data;
  } catch (err) {
    console.error("Delete notification error:", err);
    throw err;
  }
};

const clearAllNotifications = async () => {
  try {
    const { data } = await authAxios.delete("/notifications");
    return data;
  } catch (err) {
    console.error("Clear all notifications error:", err);
    throw err;
  }
};

  // ---------- Context Value ----------
  const value = {
    // State
    token,
    user,
    socket,
    loading,
    error,
    
    // Auth Methods
    login,
    register,
    logout,
    fetchUserProfile,
    
    // Admin Methods
    getPendingUsers,
    approveUser,
    rejectUser,
    getAvailableUsers,
    getAllUsers,
    
    // Duty Methods
    getAllDuties,
    assignDuty,
    getMyDuties,
    getDutyStats,
    
    // Attendance Methods
    markAttendance,
    verifyAttendance,
    getAttendanceReport,
    autoMarkAbsentees,
    // Attendance Report Methods
    generateAttendanceReport,
    getAttendanceReports,
    getAttendanceDashboard,
    exportAttendanceReport,
    // Leave Methods
    requestLeave,
    getMyLeaveRequests,
    getAllLeaveRequests,
    reviewLeaveRequest,
    
    // Payment Methods
    approvePayments,
    getPaymentReport,
    
    // Report Methods
    uploadReport,
    
    // Profile Methods
    getProfile,
    updateProfile,
    isUserApproved,
    // Withdrawal Methods
      getPaymentSummary,
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  processWithdrawal,
  // Notification Methods
  
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};