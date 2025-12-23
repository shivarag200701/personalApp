import { useState, useEffect } from "react";
import LogoCard from "./LogoCard";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

const AppBar = () => {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/v1/user/profile");
        if (response.data.user?.pictureUrl) {
          setProfilePicture(response.data.user.pictureUrl);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function logout() {
    try {
      await api.post("/v1/user/logout");
      
      navigate("/signin");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flex justify-between items-center py-4">
      <LogoCard />

      <div className="flex items-center gap-3">
        {!isLoading && profilePicture && (
          <img
            src={profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
          />
        )}
        {!isLoading && !profilePicture && (
          <div className="w-10 h-10 rounded-full border-2 border-white/10 bg-[#1B1B1E] flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <button 
          onClick={logout}
          className="text-white text-sm flex items-center justify-center bg-[#1B1B1E] border border-gray-700 hover:border-red-500/50 rounded-xl px-4 py-2 h-full cursor-pointer transition-all hover:bg-red-500/10"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AppBar;
