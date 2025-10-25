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
  isAuntenticated: boolean;
  isLoading: boolean;
}
const AuthContext = createContext<ContextProps>({
  isAuntenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: AuthProps) {
  const [isAuntenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserSession() {
      try {
        const user = await axios.get("https://localhost:3000/api/auth-check");
        if (user.data.isAuntenticated == true) {
          setIsAuthenticated(true);
        }
        if (user.data.isAuntenticated == true) {
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("error while checking validation", error);
        setIsAuthenticated(false);
      }
    }
    fetchUserSession();
  }, []);

  const value = { isAuntenticated, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const Auth = () => useContext(AuthContext);
