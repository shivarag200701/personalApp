import LogoCard from "./LogoCard";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const AppBar = () => {
  const navigate = useNavigate();
  async function logout() {
    try {
      await api.post("/v1/user/logout");
      console.log("logged out");
      
      navigate("/signin");
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div className="flex justify-between items-center py-4">
      <LogoCard />

      <button 
        onClick={logout}
        className="text-white text-sm flex items-center justify-center bg-[#1B1B1E] border border-gray-700 hover:border-red-500/50 rounded-xl px-4 py-2 h-full cursor-pointer transition-all hover:bg-red-500/10"
      >
        Logout
      </button>
    </div>
  );
};

export default AppBar;
