import {
  useContext,
  createContext,
  type ReactNode,
  useState,
  useEffect,
} from "react";
import axios from "axios";

interface AuthProps {
  children: ReactNode;
}
interface ContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}
const AuthContext = createContext<ContextProps>({
  isAuthenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: AuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("here");

    async function fetchUserSession() {
      try {
        const user = await axios.get("http://localhost:3000/api/auth-check", {
          withCredentials: true,
        });
        console.log("user", user.data);
        if (user.data.isAuthenticated == "true") {
          setIsAuthenticated(true);
        }
        if (user.data.isAuthenticated == "false") {
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("error while checking validation", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }
    fetchUserSession();
  }, []);

  const value = { isAuthenticated, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//for cretaing protected routes
export const Auth = () => useContext(AuthContext);
