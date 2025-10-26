import React, { useEffect, useState } from "react";
import AppBar from "../Components/AppBar";
import axios from "axios";
import StatsCard from "../Components/StatsCard";

const Dashboard = () => {
  const [totalTodoCount, setTotalCount] = useState(0);
  useEffect(() => {
    async function fetchTodo() {
      try {
        const res = await axios.get("/api/v1/todo/", {
          withCredentials: true,
        });
        const todos = res.data.todos;
        console.log(todos);

        const totalTodos = todos.length;
        console.log(totalTodos);

        setTotalCount(totalTodos);
      } catch (error) {
        console.log(error);
      }
    }
    fetchTodo();
  }, []);
  return (
    <div className="h-screen bg-[#131315] max-w-6xl mx-auto p-4 md:p-8">
      <AppBar />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard value={totalTodoCount} />
        <StatsCard />
        <StatsCard />
        <StatsCard />
      </div>
    </div>
  );
};

export default Dashboard;
