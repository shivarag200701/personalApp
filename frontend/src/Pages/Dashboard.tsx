import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import {isToday, isTomorrow, isThisWeek} from "@shiva200701/todotypes";
import { Auth } from "@/Context/AuthContext";

const Dashboard = () => {
  const [totalTodoCount, setTotalCount] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshAuth } = Auth();

  // Handle OAuth success redirect
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'google_sign_in') {
      // Refresh auth to ensure session is recognized
      refreshAuth().then(() => {
        // Remove success param from URL
        setSearchParams({}, { replace: true });
      });
    }
  }, [searchParams, refreshAuth, setSearchParams]);

  const openModal = () => {
    setIsModalOpen(true);
    setTodoToEdit(null);
  }
  const closeModal = () => {
    setIsModalOpen(false);
    setTodoToEdit(null);
  }

  function addTodo(newTask: Todo) {
    console.log("new task", newTask);
    setTodos((prev) => [...prev, newTask]);
  }
  function updateTodo(updatedTask: Todo) {
    console.log("updated task", updatedTask);
    setTodos((prev) => prev.map((todo) => todo.id === updatedTask.id ? updatedTask : todo));
  }
  const handleEdit = (todo: Todo) => {
    setTodoToEdit(todo);
    setIsModalOpen(true);
  };

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

  const deleteTodo = async (todoId: string | number) => {
    if (!todoId) {
      return;
    }
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    setTotalCount((prev) => prev - 1);
    try {
      await api.delete(`/v1/todo/${todoId}`);
      console.log("Todo deleted");
    } catch (error) {
      console.error("Error deleting todo", error);
    }
  }

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
    let percentage = (completedTodos.length / todos.length) * 100;
    let roundedPercentage = Math.round(percentage);
    return roundedPercentage;
  }, [completedTodos, todos]);

  const completedDates = useMemo(() => {
    return completedTodos
      .map((todo) => todo.completedAt)
      .filter((date) => date != null)
      .map((date) => new Date(date));
  }, [completedTodos]);

  const currentStreak = useMemo(() => {
    console.log("completed Dates", completedDates);

    return calculateStreak(completedDates);
  }, [completedDates]);

  const todayTodos = useMemo(() => {
    return todos.filter(
      (todo) =>
        isToday(todo?.completeAt) && todo?.completed == false
    );
  }, [todos]);
  const tomorrowTodos = useMemo(() => {
    return todos.filter(
      (todo) =>
        isTomorrow(todo?.completeAt) && todo?.completed == false
    );
  }, [todos]);
  const thisWeekTodos = useMemo(() => {
    return todos.filter((todo) => isThisWeek(todo?.completeAt) && todo?.completed == false);
  }, [todos]);
  const todayCompletedTodos = useMemo(() => {
    return todos.filter(
      (todo) =>
        todo?.completed == true && isToday(todo?.completeAt)
    );
  }, [todos]);

  const notCompletedTodos = useMemo(() => {
    return todos.filter((todo) => todo.completed == false);
  }, [todos]);
  console.log("today todos", todayTodos);
  console.log("tomorrow todos", tomorrowTodos);
  console.log("this week todos", thisWeekTodos);

  return (
    <>
      <div className="min-h-screen bg-[#131315] max-w-6xl mx-auto p-4 md:p-8 pb-12">
        <div className="mb-8">
          <AppBar />
        </div>
        <NewSection onClick={openModal} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            value={`${currentStreak}d`}
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
        <div className="flex-col space-y-8">
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
              onDelete={deleteTodo}
              onEdit={handleEdit}
            />
          ) : (
            <NoTodo
              icon={CheckCircle2}
              heading="All done for today!"
              description="You've completed all your tasks. Take a moment to relax or plan ahead for tomorrow."
              button="Add New Task"
              onClick={openModal}
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
              onDelete={deleteTodo}
              onEdit={handleEdit}
            />
          ) : (
            <NoTodo
              icon={Clock}
              heading="Nothing planned yet"
              description="Your tomorrow is wide open. Add tasks to plan ahead."
              button="Plan Tomorrow"
              onClick={openModal}
            />
          )}
          <Day
            icon={Sparkles}
            heading="This Week"
            tasks={`${thisWeekTodos?.length.toString()} tasks`}
          />
          {loading ? (
            <LoadingSkeleton />
          ) : thisWeekTodos.length != 0 ? (
            <TaskCard
              todos={thisWeekTodos}
              onToggleComplete={toggleTodoCompletion}
              onDelete={deleteTodo}
              onEdit={handleEdit}
            />
          ) : (
            <NoTodo
              icon={Sparkles}
              heading="Your future awaits"
              description="Add tasks here for things you'd like to do eventually, without the pressure of a deadline."
              button="Add Future Task"
              onClick={openModal}
            />
          )}
          {completedTodos &&
            (loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="mt-8">
                <Day
                  icon={CheckCircle}
                  heading="Completed"
                  tasks={`${completedTodos?.length.toString()} tasks`}
                />
                <TaskCard
                  todos={completedTodos}
                  onToggleComplete={toggleTodoCompletion}
                  onDelete={deleteTodo}
                  onEdit={handleEdit}
                />
              </div>
            ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} addTodo={addTodo} editTodo={updateTodo} todoToEdit={todoToEdit} />
    </>
  );
};

export default Dashboard;
