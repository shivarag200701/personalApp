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
    <div className="flex justify-between items-center">
      <LogoCard />

      <div className="text-white text-sm flex items-center justify-center bg-red-500 rounded-xl p-2 h-full cursor-pointer ">
        <button className="cursor-pointer bg-opacity-50 hover:bg-opacity-100 transition-opacity hover:text-black" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AppBar;
