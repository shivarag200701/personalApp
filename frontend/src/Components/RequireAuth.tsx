import { useLocation, Navigate } from "react-router-dom";
import { Auth } from "../Context/AuthContext";
import type { ReactNode } from "react";

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = Auth();
  console.log("authentication", isAuthenticated);

  const location = useLocation();
  if (isLoading) {
    return <div>Loading...</div>; // Or a better loading spinner
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
