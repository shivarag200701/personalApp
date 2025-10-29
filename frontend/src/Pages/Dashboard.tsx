import React, { useEffect, useMemo, useState } from "react";
import AppBar from "../Components/AppBar";
import axios from "axios";
import {
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  CheckCircle,
} from "lucide-react";
import StatsCard from "../Components/StatsCard";
import type { Todo } from "@/Components/Modal";
import TaskCard from "../Components/TaskCard";
import Day from "../Components/Day";
import NoTodo from "@/Components/NoTodo";
import Modal from "@/Components/Modal";

const Dashboard = () => {
  const [totalTodoCount, setTotalCount] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  function addTodo(newTask: Todo) {
    setTodos((prev) => [...prev, newTask]);
  }

  const toggleTodoCompletion = async (todoId: string | number) => {
    const todoToUpdate = todos.find((todo) => todo.id == todoId);
    if (!todoToUpdate) {
      return;
    }
    // Determine the new status
    const newCompletedStatus = !todoToUpdate.completed;
    setTodos((prev) => {
      return prev.map((todo) => {
        if (todo.id == todoId) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      });
    });
    try {
      await axios.post(`/api/v1/todo/${todoId}/completed`, {
        completed: newCompletedStatus,
      });
    } catch (error) {
      console.error("Error cant mark as completed", error);
    }
  };

  useEffect(() => {
    async function fetchTodo() {
      try {
        const res = await axios.get("/api/v1/todo/", {
          withCredentials: true,
        });
        const todos = res.data.todos;
        setTodos(todos);
        console.log("all todos", todos);

        const totalTodos = todos.length;

        setTotalCount(totalTodos);
      } catch (error) {
        console.log(error);
      }
    }
    fetchTodo();
  }, []);

  const completedTodos = useMemo(() => {
    return todos.filter((todo) => todo?.completed === true);
  }, [todos]);

  const todayTodos = useMemo(() => {
    console.log("firsdt todo", todos[0]);

    return todos.filter(
      (todo) =>
        todo?.completeAt?.toString() === "Today" && todo?.completed == false
    );
  }, [todos]);
  const tomorrowTodos = useMemo(() => {
    console.log("firsdt todo", todos[0]);

    return todos.filter(
      (todo) =>
        todo?.completeAt?.toString() === "Tomorrow" && todo?.completed == false
    );
  }, [todos]);
  const somedayTodos = useMemo(() => {
    console.log("firsdt todo", todos[0]);

    return todos.filter(
      (todo) =>
        todo?.completeAt?.toString() === "Someday" && todo?.completed == false
    );
  }, [todos]);
  const todayCompletedTodos = useMemo(() => {
    return todos.filter(
      (todo) =>
        todo?.completed == true && todo?.completeAt?.toString() === "Today"
    );
  }, [todos]);

  const notCompletedTodos = useMemo(() => {
    return todos.filter((todo) => todo.completed == false);
  }, [todos]);
  console.log("today todos", todayTodos);

  console.log("today completed todos", todayCompletedTodos);

  return (
    <>
      <button onClick={openModal} className="text-white">
        click me
      </button>
      <Modal isOpen={isModalOpen} onClose={closeModal} addTodo={addTodo} />
      <div className="h-full bg-[#131315] max-w-6xl mx-auto p-4 md:p-8">
        <AppBar />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            value={totalTodoCount}
            label="Total Tasks"
            trend={`${notCompletedTodos?.length.toString()} actives`}
          />
          <StatsCard
            value={todayCompletedTodos.length}
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
            <TaskCard
              todos={todayTodos}
              onToggleComplete={toggleTodoCompletion}
            />
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
            tasks={`${tomorrowTodos?.length.toString()} tasks`}
          />
          {tomorrowTodos.length != 0 ? (
            <TaskCard
              todos={tomorrowTodos}
              onToggleComplete={toggleTodoCompletion}
            />
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
            tasks={`${somedayTodos?.length.toString()} tasks`}
          />
          {somedayTodos.length != 0 ? (
            <TaskCard
              todos={somedayTodos}
              onToggleComplete={toggleTodoCompletion}
            />
          ) : (
            <NoTodo
              icon={Sparkles}
              heading="Your future awaits"
              description="Add tasks here for things you'd like to do eventually, without the pressure of a deadline."
              button="Add Future Task"
            />
          )}
          {completedTodos && (
            <div>
              <Day
                icon={CheckCircle}
                heading="Completed"
                tasks={`${completedTodos?.length.toString()} tasks`}
              />
              <TaskCard
                todos={completedTodos}
                onToggleComplete={toggleTodoCompletion}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
