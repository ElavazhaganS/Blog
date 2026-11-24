import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1473E6]" />
      </div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin" && user.role !== "author") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
