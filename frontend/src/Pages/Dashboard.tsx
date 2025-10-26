import React, { useEffect, useMemo, useState } from "react";
import AppBar from "../Components/AppBar";
import axios from "axios";
import { CalendarDays, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import StatsCard from "../Components/StatsCard";
import type { Todo } from "@shiva200701/todotypes";
import TaskCard from "../Components/TaskCard";
import Day from "../Components/Day";
import NoTodo from "@/Components/NoTodo";

const Dashboard = () => {
  const [totalTodoCount, setTotalCount] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  useEffect(() => {
    async function fetchTodo() {
      try {
        const res = await axios.get("/api/v1/todo/", {
          withCredentials: true,
        });
        const todos = res.data.todos;
        setTodos(todos);

        const totalTodos = todos.length;
        console.log(totalTodos);

        setTotalCount(totalTodos);
      } catch (error) {
        console.log(error);
      }
    }
    fetchTodo();
  }, []);
  const todayTodos = useMemo(() => {
    console.log("firsdt todo", todos[0]);

    return todos.filter((todo) => todo?.completeAt?.toString() === "Today");
  }, [todos]);
  const tomorrowTodos = useMemo(() => {
    console.log("firsdt todo", todos[0]);

    return todos.filter((todo) => todo?.completeAt?.toString() === "Tomorrow");
  }, [todos]);
  const somedayTodos = useMemo(() => {
    console.log("firsdt todo", todos[0]);

    return todos.filter((todo) => todo?.completeAt?.toString() === "Someday");
  }, [todos]);
  console.log("tomorrow todos", tomorrowTodos);

  return (
    <div className="h-full bg-[#131315] max-w-6xl mx-auto p-4 md:p-8">
      <AppBar />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard value={totalTodoCount} label="Total Tasks" />
        <StatsCard
          value={3}
          trend={`${todayTodos?.length.toString()} today`}
          label="Completed Today"
        />
        <StatsCard label="Streak" />
        <StatsCard label="Completion" />
      </div>
      <div className="flex-col">
        <Day
          icon={CalendarDays}
          heading="Today"
          tasks={`${todayTodos?.length.toString()} tasks`}
        />
        {todayTodos.length != 0 ? (
          <TaskCard todos={todayTodos} />
        ) : (
          <NoTodo
            icon={CheckCircle2}
            heading="All done for today!"
            description="You've completed all your tasks. Take a moment to relax or plan ahead for tomorrow."
            button="Add New Task"
          />
        )}
        <Day
          icon={Clock}
          heading="Tomorrow"
          tasks={`${todayTodos?.length.toString()} tasks`}
        />
        {tomorrowTodos.length != 0 ? (
          <TaskCard todos={todayTodos} />
        ) : (
          <NoTodo
            icon={Clock}
            heading="Nothing planned yet"
            description="Your tomorrow is wide open. Add tasks to plan ahead."
            button="Plan Tomorrow"
          />
        )}

        <Day
          icon={Sparkles}
          heading="Someday"
          tasks={`${todayTodos?.length.toString()} tasks`}
        />
        {tomorrowTodos.length != 0 ? (
          <TaskCard todos={todayTodos} />
        ) : (
          <NoTodo
            icon={Sparkles}
            heading="Your future awaits"
            description="Add tasks here for things you'd like to do eventually, without the pressure of a deadline."
            button="Add Future Task"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
