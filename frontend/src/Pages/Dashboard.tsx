import { useEffect, useMemo, useState } from "react";
import AppBar from "../Components/AppBar";
import {
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  CheckCircle,
  Flame,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import StatsCard from "../Components/StatsCard";
import type { Todo } from "@/Components/Modal";
import TaskCard from "../Components/TaskCard";
import Day from "../Components/Day";
import NoTodo from "@/Components/NoTodo";
import Modal from "@/Components/Modal";
import { calculateStreak } from "@/utils/calculateStreak";
import NewSection from "@/Components/NewSection";
import LoadingSkeleton from "@/Components/LoadingSkeleton";
import api from "../utils/api";

const Dashboard = () => {
  const [totalTodoCount, setTotalCount] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

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
      await api.post(`/v1/todo/${todoId}/completed`, {
        completed: newCompletedStatus,
      });
    } catch (error) {
      console.error("Error cant mark as completed", error);
    }
  };

  useEffect(() => {
    async function fetchTodo() {
      try {
        const res = await api.get("/v1/todo/");
        const todos = res.data.todos;
        setTodos(todos);
        setLoading(false);
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

  const percentage = useMemo(() => {
    if (todos.length == 0) {
      return 0;
    }
    return (completedTodos.length / todos.length) * 100;
  }, [completedTodos, todos]);

  const completedDates = useMemo(() => {
    return completedTodos
      .map((todo) => todo.completedAt)
      .filter((date) => date != null);
  }, [completedTodos]);

  const currentStreak = useMemo(() => {
    console.log("completed Dates", completedDates);

    const streak = calculateStreak(completedDates);
    setStreak(streak);
  }, [completedDates]);

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
      <div className="h-full bg-[#131315] max-w-6xl mx-auto p-4 md:p-8">
        <AppBar />
        <NewSection onClick={openModal} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            value={totalTodoCount.toString()}
            label="Total Tasks"
            trend={`${notCompletedTodos?.length.toString()} actives`}
            icon={ListTodo}
          />
          <StatsCard
            value={todayCompletedTodos.length.toString()}
            trend={`${todayTodos?.length.toString()} today`}
            label="Completed Today"
            icon={CheckCircle2}
          />
          <StatsCard
            label="Streak"
            value={`${streak}d`}
            trend="Keep it up!"
            icon={Flame}
          />
          <StatsCard
            label="Completion"
            value={`${percentage} %`}
            trend="Overall"
            icon={TrendingUp}
          />
        </div>
        <div className="flex-col">
          <Day
            icon={CalendarDays}
            heading="Today"
            tasks={`${todayTodos?.length.toString()} tasks`}
          />
          {loading ? (
            <LoadingSkeleton />
          ) : todayTodos.length != 0 ? (
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
          {loading ? (
            <LoadingSkeleton />
          ) : tomorrowTodos.length != 0 ? (
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
          {loading ? (
            <LoadingSkeleton />
          ) : somedayTodos.length != 0 ? (
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
          {completedTodos &&
            (loading ? (
              <LoadingSkeleton />
            ) : (
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
            ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} addTodo={addTodo} />
    </>
  );
};

export default Dashboard;
