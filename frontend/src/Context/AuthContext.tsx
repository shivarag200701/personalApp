import {
  useContext,
  createContext,
  type ReactNode,
  useState,
  useEffect,
} from "react";
import api from "../utils/api";

interface AuthProps {
  children: ReactNode;
}
interface ContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
}
const AuthContext = createContext<ContextProps>({
  isAuthenticated: false,
  isLoading: true,
  refreshAuth: async () => {},

});

export function AuthProvider({ children }: AuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



    async function fetchUserSession() {
      try {
        const user = await api.get("/v1/auth-check")
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
    useEffect(() => {
      console.log("here");
      fetchUserSession();
    }, []);
    
    const refreshAuth = async () => {
      setIsLoading(true);
      await fetchUserSession();
    };
    

  const value = { isAuthenticated, isLoading, refreshAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//for cretaing protected routes
export const Auth = () => useContext(AuthContext);
