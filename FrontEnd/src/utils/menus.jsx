// utils/menu.js
import {
  DashboardOutlined,
  UserOutlined,
  FileDoneOutlined,
  SettingOutlined,
  FileAddOutlined,
  DollarOutlined,
  ScheduleOutlined,
  NotificationOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

export const invigilatorMenu = [
  { key: "dashboard", path: "/invigilator/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "duties", path: "/invigilator/duties", label: "My Duties", icon: <ScheduleOutlined /> },
  { key: "requests", path: "/invigilator/leaves", label: "Leave Requests", icon: <NotificationOutlined /> },
  { key: "payment", path: "/invigilator/payment", label: "Payment", icon: <DollarOutlined /> },
  { key: "profile", path: "/invigilator/profile", label: "Profile", icon: <UserOutlined /> },
];

export const superintendentMenu = [
  { key: "dashboard", path: "/superintendent/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "duties", path: "/superintendent/duties", label: "My Duties", icon: <ScheduleOutlined /> },
  { key: "reports", path: "/superintendent/reports", label: "Upload Reports", icon: <FileTextOutlined /> },
  { key: "requests", path: "/superintendent/leaves", label: "Leave Requests", icon: <NotificationOutlined /> },
  { key: "payment", path: "/superintendent/payment", label: "Payment", icon: <DollarOutlined /> },
  { key: "profile", path: "/superintendent/profile", label: "Profile", icon: <UserOutlined /> },
];

export const adminMenu = [
  { key: "dashboard", path: "/admin/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "assign", path: "/admin/assign", icon: <FileAddOutlined />, label: "Assign Duties" },
  { key: "users", path: "/admin/users", icon: <TeamOutlined />, label: "Manage Users" },
  { key: "report", path: "/admin/report", icon: <FileDoneOutlined />, label: "Attendance Report" },
  { key: "leaves", path: "/admin/leaves", label: "Leave Requests", icon: <NotificationOutlined /> },
  { key: "payments", path: "/admin/payments", label: "Payment Approval", icon: <DollarOutlined /> },
  { key: "settings", path: "/admin/settings", icon: <SettingOutlined />, label: "Settings" },
];