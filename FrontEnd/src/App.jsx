import { Routes, Route, Navigate } from "react-router-dom";
import DefaultLayout from "./components/layout/DefaultLayout";
import { adminMenu, invigilatorMenu, superintendentMenu } from "./utils/menus.jsx";
import RoleSelection from "./pages/RoleSelection";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import InvDashboard from "./pages/invigilator/Dashboard";
import SupDashboard from "./pages/superintendent/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import InvigilatorLogin from "./pages/invigilator/Login";
import SuperintendentLogin from "./pages/superintendent/Login";
import AdminLogin from "./pages/admin/Login";
import InvigilatorReg from "./pages/invigilator/Register.jsx";
import SuperintendentReg from "./pages/superintendent/Register.jsx";
import AssignDuties from "./pages/admin/AssignDuties.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ProfileSettings from "./pages/invigilator/Profile.jsx";
import SuperintendentProfile from "./pages/superintendent/Profile.jsx";
import AdminAttendanceReport from "./pages/admin/AttendanceReport.jsx";
import Payment from "./pages/invigilator/Payment.jsx";
import Requests from "./pages/invigilator/LeaveRequests.jsx";
import Duties from "./pages/invigilator/DutiesList.jsx";
import Settings from "./pages/admin/Settings.jsx";
import Centers from "./pages/admin/Centers.jsx";
import AdminLeaves from "./pages/admin/AdminLeaves.jsx";
import PaymentApproval from "./pages/admin/PaymentApproval.jsx";
import Reports from "./pages/superintendent/Reports.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  const { user } = useAuth();

  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
    <Routes>
      {/* Role Selection OR Redirect if logged in */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />
          ) : (
            <RoleSelection />
          )
        }
      />

      {/* Role-specific logins */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/invigilator/login" element={<InvigilatorLogin />} />
      <Route path="/superintendent/login" element={<SuperintendentLogin />} />

      {/* Registrations */}
      <Route path="/superintendent/register" element={<SuperintendentReg />} />
      <Route path="/invigilator/register" element={<InvigilatorReg />} />
      

      {/* Dashboards */}
      <Route
        element={
          <ProtectedRoute role="invigilator">
            <DefaultLayout menuItems={invigilatorMenu} />
          </ProtectedRoute>
        }
      >
        <Route path="/invigilator/dashboard" element={<InvDashboard />} />
        <Route path="/invigilator/profile" element={<ProfileSettings />} />
        <Route path="/invigilator/payment" element={<Payment />} />
        <Route path="/invigilator/leaves" element={<Requests />} />
        <Route path="/invigilator/Duties" element={<Duties />} />
</Route>
      <Route
        element={
          <ProtectedRoute role="admin">
            <DefaultLayout menuItems={adminMenu} />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/assign" element={<AssignDuties />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/report" element={<AdminAttendanceReport />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/centers" element={<Centers />} />
        <Route path="/admin/leaves" element={<AdminLeaves />} />
        <Route path="/admin/payments" element={<PaymentApproval />} />
      </Route>

      <Route
        element={
          <ProtectedRoute role="superintendent">
            <DefaultLayout menuItems={superintendentMenu} />
          </ProtectedRoute>
        }
      >
        <Route path="/superintendent/dashboard" element={<SupDashboard />} />
        <Route path="/superintendent/profile" element={<SuperintendentProfile />} />
        <Route path="/superintendent/reports" element={<Reports />} />
        <Route path="/superintendent/duties" element={<Duties />} />
        <Route path="/superintendent/payment" element={<Payment />} />
        <Route path="/superintendent/leaves" element={<Requests />} />

      </Route>
    </Routes>
    </>
  );
}

export default App;
