import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AppBar from "../Components/AppBar";
import type { Todo } from "@/Components/Modal";
import TabNavigation, { type TabType } from "../Components/TabNavigation";
import TodayView from "../Components/TodayView";
import UpcomingView from "../Components/UpcomingView";
import CompletedView from "../Components/CompletedView";
import api from "../utils/api";
import { Auth } from "@/Context/AuthContext";
import { calculateNextOccurence, type RecurrencePattern } from "@shiva200701/todotypes";
import TaskDetailDrawer from "@/Components/TaskDetailDrawer";
import { SquareKanban, CalendarDays } from "lucide-react";
import AddTaskCalendar from "../Components/AddTaskCalender";

const Dashboard = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isAddTaskCalendarOpen, setIsAddTaskCalendarOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [viewType, setViewType] = useState<"board" | "calendar">("board");
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);
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

  // Close view dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setShowViewDropdown(false);
      }
    };

    if (showViewDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showViewDropdown]);

  const openModal = (date?: string) => {
    setIsAddTaskCalendarOpen(true);
    console.log("date", date);
    
  }
  const closeModal = () => {
    setIsAddTaskCalendarOpen(false);
  }
  const closeDetailDrawer = () => {
    setIsDetailOpen(false);
  };

  function addTodo(newTask: Todo) {
    setTodos((prev) => [...prev, newTask]);
  }
  function updateTodo(updatedTask: Todo) {
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
    setIsDetailOpen(false);
    setIsAddTaskCalendarOpen(true);
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
    console.log("todoToUpdate", todoToUpdate);
    
    const newCompletedStatus = !todoToUpdate?.completed;
    console.log("newCompletedStatus", newCompletedStatus);

    if(newCompletedStatus === true){}
    //If the task is not recurring, update the task as completed in the UI
    if(!todoToUpdate.isRecurring){
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
      //send data to backend
      try{
        await api.post(`/v1/todo/${todoId}/completed`, {
          completed: newCompletedStatus,
        });
      }catch(error){
        console.error("Error cant mark as completed", error);
        setTodos((prev) => {
          return prev.map((todo) => {
            if(todo.id === todoId){
              return {...todo, completed: !newCompletedStatus}
            }
            return todo;
          })
        })
        setSelectedTodo((prev) => {
          if(prev?.id === todoId){
            return {...prev, completed: !newCompletedStatus}
          }
          return prev;
        });
      }
    }
    //If the task is recurring, update the completeAt date to next occurrence
    else if (todoToUpdate?.isRecurring && todoToUpdate?.recurrencePattern  && todoToUpdate?.recurrenceInterval  && todoToUpdate?.completeAt &&
    newCompletedStatus) { 

        const baseDate = new Date(todoToUpdate.completeAt);
        console.log("base date", baseDate);
        const nextOccurrenceDate = calculateNextOccurence(todoToUpdate.recurrencePattern as RecurrencePattern, todoToUpdate.recurrenceInterval, baseDate);
        //optimistic update to UI
        if(todoToUpdate.recurrenceEndDate && nextOccurrenceDate > new Date(todoToUpdate.recurrenceEndDate)){
          setTodos((prev) => {
            return prev.map((todo) => {
              if(todo.id === todoId){
                return {...todo, completed: true, nextOccurrence: null}
              }
              return todo;
            })
          })
          setSelectedTodo((prev) => {
            if (prev?.id === todoId) {
              return { ...prev, completed: true, nextOccurrence: null };
            }
            return prev;
          });
        }
        else{
          console.log("next occurrence date", nextOccurrenceDate);
          
            setTodos((prev) => {
              return prev.map((todo) => {
                if(todo.id === todoId){
                  return {...todo, completeAt: nextOccurrenceDate.toISOString()}
                }
                return todo;
              })
            })
            setSelectedTodo((prev) => {
              if (prev?.id === todoId) {
                return { ...prev, completeAt: nextOccurrenceDate.toISOString() };
              }
              return prev;
            });
        }
      //send data to backend
      try{
        await api.post(`/v1/todo/${todoId}/completed`, {
          completed: newCompletedStatus,
        });
      }catch(error){
        console.error("Error cant mark recurring task as completed", error);
        setTodos((prev) => {
          return prev.map((todo) => {
            if(todo.id === todoId){
              return {...todo, completeAt: baseDate.toISOString()}
            }
            return todo;
          })
        })
        setSelectedTodo((prev) => {
          if(prev?.id === todoId){
            return {...prev, completeAt: baseDate.toISOString()}
          }
          return prev;
        });
      }
    }
    else{
      //to handle the case where the task is recurring and the completed status is changed to not completed
      setTodos((prev) => {
        return prev.map((todo) => {
          if(todo.id === todoId){
            return {...todo, completed: newCompletedStatus}
          }
          return todo;
        })
      })
      setSelectedTodo((prev) => {
        if(prev?.id === todoId){
          return {...prev, completed: newCompletedStatus}
        }
        return prev;
      });
      //send data to backend
      try{
        await api.post(`/v1/todo/${todoId}/completed`, {
          completed: newCompletedStatus,
        });
      }catch(error){
        console.error("Error cant mark as not completed", error);
        setTodos((prev) => {
          return prev.map((todo) => {
            if(todo.id === todoId){
              return {...todo, completed: !newCompletedStatus}
            }
            return todo;
          })
        })
        setSelectedTodo((prev) => {
          if(prev?.id === todoId){
            return {...prev, completed: !newCompletedStatus}
          }
          return prev;
        });
      }
    }
    // try {
    //   await api.post(`/v1/todo/${todoId}/completed`, {
    //     completed: newCompletedStatus,
    //   });
    // } catch (error) {
    //   console.error("Error cant mark as completed", error);
    //   setTodos((prev) => {
    //     return prev.map((todo) => {
    //       if (todo.id == todoId) {
    //         return { ...todo, completed: !newCompletedStatus };
    //       }
    //       return todo;
    //     });
    //   });
    //   setSelectedTodo((prev) => {
    //     if (prev?.id === todoId) {
    //       return { ...prev, completed: !newCompletedStatus };
    //     }
    //     return prev;
    //   });
    // }
  };

  const deleteTodo = async (todoId: string | number) => {
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
    } catch (error) {
      console.error("Error deleting todo", error);
    }
  }
  const duplicateTodo = async (todo: Todo) => {

    try {
      const res = await api.post("v1/todo/",{
        title: todo.title,
        description: todo.description,
        priority: todo.priority ?? null,
        completeAt: todo.completeAt,
        category: todo.category,
        isRecurring: todo.isRecurring,
        recurrencePattern: todo.recurrencePattern ?? null,
        recurrenceInterval: todo.recurrenceInterval ?? null,
        recurrenceEndDate: todo.recurrenceEndDate ?? null,
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
        console.log("todos", todos);
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
      <div className="relative min-h-screen bg-[#05050a] w-full px-4 md:px-16 pb-12 overflow-x-hidden">
        <style>{`
          /* Custom dark scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #0a0a0f;
          }
          ::-webkit-scrollbar-thumb {
            background: #1a1a2e;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #2a2a3e;
          }
          /* Firefox scrollbar */
          * {
            scrollbar-width: thin;
            scrollbar-color: #1a1a2e #0a0a0f;
          }
        `}</style>

        {/* Grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#0a0a11]/60 to-[#05050a]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, rgba(168,85,247,0.15), transparent 55%)",
          }}
        />

        <div className="relative z-10">
        <div className="mb-8">
          {(activeTab !== "upcoming" || viewType !== "calendar") && (
            <AppBar />
          )}
        </div>
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          rightContent={
            activeTab === "upcoming" ? (
              <div className="relative" ref={viewDropdownRef}>
                <button
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
                  className={`flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg cursor-pointer ${
                    showViewDropdown 
                      ? "bg-white/10 text-white" 
                      : "text-[#A2A2A9] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {viewType === "board" ? (
                    <>
                      <SquareKanban className="w-4.5 h-4.5 hidden sm:block" />
                      <span className="text-sm hidden sm:inline">Board</span>
                    </>
                  ) : (
                    <>
                      <CalendarDays className="w-4.5 h-4.5 hidden sm:block" />
                      <span className="text-sm hidden sm:inline">Calendar</span>
                    </>
                  )}
                </button>
                {/* View Dropdown Menu */}
                {showViewDropdown && (
                  <div className="absolute top-full right-0  bg-[#101018]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 min-w-[160px]">
                    <div className="text-white text-sm font-semibold px-4 pt-2">Layout</div>
                    <div className="p-2">
                    <div className="flex gap-2 p-1 rounded-lg bg-white/5 min-w-[200px] max-w-[200px]">
                    <button
                      onClick={() => {
                        setViewType("board");
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-center transition-colors flex-col items-center justify-center gap-3 cursor-pointer rounded-lg ${
                        viewType === "board"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-[#A2A2A9] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                      <SquareKanban className="w-4 h-4" />
                      </div>
                      <span>Board</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewType("calendar");
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-center transition-colors flex-col items-center justify-center gap-3 cursor-pointer rounded-lg ${
                        viewType === "calendar"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-[#A2A2A9] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                      <CalendarDays className="w-4 h-4" />
                      </div>
                        <span>Calendar</span>
                      </button>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null
          }
        />
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
            viewType={viewType}
            onViewTypeChange={setViewType}
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
      </div>
      {isAddTaskCalendarOpen && (
        <AddTaskCalendar
          preselectedDate={new Date()}
          onCancel={closeModal}
          onSuccess={addTodo}
          onUpdate={updateTodo}
          index={0}
          backgroundColor="bg-[#1e1f20]"
          width="w-[500px]"
        />
      )}
      <TaskDetailDrawer
        todo={selectedTodo}
        isOpen={isDetailOpen}
        onClose={closeDetailDrawer}
        editAllowed={activeTab === "upcoming" && viewType === "calendar"}
        onEdit={updateTodo}
        onToggleComplete={toggleTodoCompletion}
        onDelete={deleteTodo}
        handleDuplicate={duplicateTodo}
      />
    </>
  );
};

export default Dashboard;
