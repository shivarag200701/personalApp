import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppBar from "../Components/AppBar";
import type { Todo } from "@/Components/Modal";
import Modal from "@/Components/Modal";
import TabNavigation, { type TabType } from "../Components/TabNavigation";
import TodayView from "../Components/TodayView";
import UpcomingView from "../Components/UpcomingView";
import CompletedView from "../Components/CompletedView";
import api from "../utils/api";
import { Auth } from "@/Context/AuthContext";

const Dashboard = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<TabType>("today");
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

  const openModal = (preselectedDate?: string) => {
    setIsModalOpen(true);
    setTodoToEdit(null);
    setPreselectedDate(preselectedDate);
  }
  const closeModal = () => {
    setIsModalOpen(false);
    setTodoToEdit(null);
    setPreselectedDate(undefined);
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

      } catch (error) {
        console.log(error);
      }
    }
    fetchTodo();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#131315] max-w-6xl mx-auto p-4 md:p-8 pb-12">
        <div className="mb-8">
          <AppBar />
        </div>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === "today" && (
          <TodayView
            todos={todos}
            loading={loading}
            onToggleComplete={toggleTodoCompletion}
            onDelete={deleteTodo}
            onEdit={handleEdit}
            onAddTask={() => openModal()}
          />
        )}
        {activeTab === "upcoming" && (
          <UpcomingView
            todos={todos}
            onToggleComplete={toggleTodoCompletion}
            onDelete={deleteTodo}
            onEdit={handleEdit}
            onAddTask={(date) => openModal(date)}
          />
        )}
        {activeTab === "completed" && (
          <CompletedView
            todos={todos}
            loading={loading}
            onToggleComplete={toggleTodoCompletion}
            onDelete={deleteTodo}
            onEdit={handleEdit}
            onAddTask={() => openModal()}
          />
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        addTodo={addTodo}
        editTodo={updateTodo}
        todoToEdit={todoToEdit}
        preselectedDate={preselectedDate}
      />
    </>
  );
};

export default Dashboard;
