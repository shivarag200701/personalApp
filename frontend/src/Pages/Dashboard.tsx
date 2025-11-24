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
import { calculateNextOccurence, type RecurrencePattern } from "@shiva200701/todotypes";
import TaskDetailDrawer from "@/Components/TaskDetailDrawer";

const Dashboard = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
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
  const closeDetailDrawer = () => {
    setIsDetailOpen(false);
  };

  function addTodo(newTask: Todo) {
    console.log("new task", newTask);
    setTodos((prev) => [...prev, newTask]);
  }
  function updateTodo(updatedTask: Todo) {
    console.log("updated task", updatedTask);
    setTodos((prev) => prev.map((todo) => todo.id === updatedTask.id ? updatedTask : todo));
    setSelectedTodo((prev) => {
      if (prev?.id === updatedTask.id) {
        return updatedTask;
      }
      return prev;
    });
  }
  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setTodoToEdit(todo);
    setIsDetailOpen(false);
    setIsModalOpen(true);
  };

  const handleViewDetails = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailOpen(true);
  };

  const toggleTodoCompletion = async (todoId: string | number) => {
    const todoToUpdate = todos.find((todo) => todo.id == todoId);
    if (!todoToUpdate) {
      return;
    }

    const newCompletedStatus = !todoToUpdate?.completed;

    //upadate parent task optimistically
    setTodos((prev) => {
        return prev.map((todo) => {
          if(todo.id === todoId){
            return {...todo, completed: newCompletedStatus}
          }
          return todo;
        })
    })
    setSelectedTodo((prev) => {
      if (prev?.id === todoId) {
        return { ...prev, completed: newCompletedStatus };
      }
      return prev;
    });

    if (todoToUpdate?.isRecurring && 
      todoToUpdate?.recurrencePattern  && 
      todoToUpdate?.recurrenceInterval  &&
      todoToUpdate?.completeAt &&
      !todoToUpdate.completed &&
      newCompletedStatus) { 

        const baseDate = new Date(todoToUpdate.completeAt);

        const nextOccurrenceDate = calculateNextOccurence(todoToUpdate.recurrencePattern as RecurrencePattern, todoToUpdate.recurrenceInterval, baseDate);

        const year = nextOccurrenceDate.getUTCFullYear();
        const month = nextOccurrenceDate.getUTCMonth();
        const day = nextOccurrenceDate.getUTCDate();
        const nextOccurrenceEndOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999))

        const tempId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        const childTask: Todo = {
          ...todoToUpdate,
          id: parseInt(tempId),
          completeAt: nextOccurrenceEndOfDay.toISOString(),
          parentRecurringId: todoToUpdate.id,
          completed: false,
          completedAt: null,
          nextOccurrence: null,
        }
        //optimistic update to UI
        setTodos((prev) => {
          const newTodos = [...prev, childTask];
          return newTodos;
        });

        try{
          const res = await api.post(`/v1/todo/child_task`,{
            parentId: todoToUpdate.id,
            completeAt: nextOccurrenceEndOfDay.toISOString(),
          })
          const createdChildTask = res.data.childTask;
          console.log("createdChildTask", createdChildTask);

          //update UI with new child task
          setTodos((prev) => {
            return prev.map((todo) =>{
              if(todo.id === parseInt(tempId)){
                return createdChildTask
              }
              return todo;
            })
          })
        }catch(error){
          console.error("Error creating child task:", error);
          // Remove temp task on error
          setTodos((prev) => prev.filter((todo) => todo.id !== parseInt(tempId)));
        }
        
  }
    try {
      await api.post(`/v1/todo/${todoId}/completed`, {
        completed: newCompletedStatus,
      });
    } catch (error) {
      console.error("Error cant mark as completed", error);
      setTodos((prev) => {
        return prev.map((todo) => {
          if (todo.id == todoId) {
            return { ...todo, completed: !newCompletedStatus };
          }
          return todo;
        });
      });
      setSelectedTodo((prev) => {
        if (prev?.id === todoId) {
          return { ...prev, completed: !newCompletedStatus };
        }
        return prev;
      });
    }
  };

  const deleteTodo = async (todoId: string | number) => {
    console.log("deleting todo", todoId);
    if (!todoId) {
      return;
    }
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    if (selectedTodo?.id === todoId) {
      setSelectedTodo(null);
      setIsDetailOpen(false);
    }
    try {
      await api.delete(`/v1/todo/${todoId}`);
      console.log("Todo deleted");
    } catch (error) {
      console.error("Error deleting todo", error);
    }
  }
  const duplicateTodo = async (todo: Todo) => {
    console.log("duplicating todo", todo);
    const newTodo = {
      ...todo,
      id: undefined,
    };
    addTodo(newTodo);
    try {
      const res = await api.post("v1/todo/",{
        ...newTodo,
      });
      const createdTodo = res.data.todo;
      addTodo(createdTodo);
    } catch (error) {
      console.error("Error duplicating todo", error);
    }
  }

  useEffect(() => {
    async function fetchTodo() {
      try {
        const res = await api.get("/v1/todo/");
        const todos = res.data.todos;
        setTodos(todos);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching todos", error);
      }
    }
    fetchTodo();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#131315] w-full px-4 md:px-16 pb-12 overflow-x-hidden">
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
            onViewDetails={handleViewDetails}
          />
        )}
        {activeTab === "upcoming" && (
          <UpcomingView
            todos={todos}
            onToggleComplete={toggleTodoCompletion}
            onDelete={deleteTodo}
            onEdit={handleEdit}
            onUpdateTodo={updateTodo}
            onAddTask={(date) => openModal(date)}
            onViewDetails={handleViewDetails}
            onTaskCreated={addTodo}
            onTaskUpdated={updateTodo}
            onDuplicateTask={duplicateTodo}
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
            onViewDetails={handleViewDetails}
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
      <TaskDetailDrawer
        todo={selectedTodo}
        isOpen={isDetailOpen}
        onClose={closeDetailDrawer}
        onEdit={updateTodo}
        onToggleComplete={toggleTodoCompletion}
        onDelete={deleteTodo}
        handleDuplicate={duplicateTodo}
      />
    </>
  );
};

export default Dashboard;
