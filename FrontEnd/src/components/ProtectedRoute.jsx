import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ role, children }) => {
  console.log("ProtectedRoute rendered with role:", role);
  const { token, user, logout } = useAuth();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }


  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      logout();
      return <Navigate to="/" replace />;
    }
  } catch {
    logout();
    return <Navigate to="/" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
