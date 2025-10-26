import React, { useEffect } from "react";
import AppBar from "../Components/AppBar";
import axios from "axios";
import StatsCard from "../Components/StatsCard";

const Dashboard = () => {
  useEffect(() => {
    async function fetchTodo() {
      try {
        const res = await axios.get("/api/v1/todo/", {
          withCredentials: true,
        });
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchTodo();
  }, []);
  return (
    <div className="h-screen bg-[#131315]">
      <AppBar />
      <StatsCard />
      <StatsCard />
      <StatsCard />
      <StatsCard />
    </div>
  );
};

export default Dashboard;
