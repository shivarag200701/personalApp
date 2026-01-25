import { useLocation, Navigate } from "react-router-dom";
import { Auth } from "../Context/AuthContext";
import type { ReactNode } from "react";
import { Spinner } from '../Components/ui/spinner';
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";


const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = Auth();
  const location = useLocation();

  // Fetch user data - this ensures user profile is loaded before showing dashboard
  const { isLoading: userLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/v1/user/profile");
      return res.data.user;
    },
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  // Fetch todos - this ensures todos are loaded before showing dashboard
  const { isLoading: todosLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await api.get("/v1/todo/");
      return res.data.todos;
    },
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  // Show loading until auth check, user query, AND todos query are complete
  if (authLoading || (isAuthenticated && (userLoading || todosLoading))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src="/favicon.png" alt="Logo" width={100} height={100} />
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
