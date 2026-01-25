import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { Todo } from "@/Components/Modal";
import TodayView from "../Components/TodayView";
import UpcomingView from "../Components/UpcomingView";
import CompletedView from "../Components/CompletedView";
import api from "../utils/api";
import { Auth } from "@/Context/AuthContext";
import { calculateNextOccurence, type RecurrencePattern } from "@shiva200701/todotypes";
import TaskDetailDrawer from "@/Components/TaskDetailDrawer";
import { CalendarDays, Plus,SquareKanban, Calendar1, CircleCheck } from "lucide-react";
import AddTaskCalendar from "../Components/AddTaskCalender";
import SideBar, { SideBarItem } from "@/Components/SideBar";
import { ViewDropDown } from "@/Components/ViewDropDown";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const queryClient = useQueryClient();
  
  // Use useQuery for todos - data is already cached from RequireAuth
  const { data: todos = [], isLoading: loading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await api.get("/v1/todo/");
      return res.data.todos;
    },
  });

  const [isAddTaskCalendarOpen, setIsAddTaskCalendarOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [viewType, setViewType] = useState<string>("board");
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);
  const viewDropdownButtonRef = useRef<HTMLButtonElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(true);
  const [viewTypeActive, setViewTypeActive] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
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

  const openModal = () => {
    setIsAddTaskCalendarOpen(true);
    
  }
  const closeModal = () => {
    setIsAddTaskCalendarOpen(false);
  }
  const closeDetailDrawer = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("task")
    setSearchParams(params,{ replace: true})
  };

  function addTodo(newTask: Todo) {
    queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => [...prev, newTask]);
  }
  function updateTodo(updatedTask: Todo) {
    queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => 
      prev.map((todo) => todo.id === updatedTask.id ? updatedTask : todo)
    );
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
    const params = new URLSearchParams(searchParams.toString())
    if(todo.id){
      params.set("task",String(todo.id))
      setSearchParams(params, { replace: false })
    }
  };

  const toggleTodoCompletion = async (todoId: string | number) => {
    const todoToUpdate = todos.find((todo) => todo.id == todoId);
    if (!todoToUpdate) {
      return;
    }
    
    const newCompletedStatus = !todoToUpdate?.completed;
    console.log("newCompletedStatus", newCompletedStatus);

    if(newCompletedStatus === true){}
    //If the task is not recurring, update the task as completed in the UI
    if(!todoToUpdate.isRecurring){
      queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => 
        prev.map((todo) => todo.id === todoId ? {...todo, completed: newCompletedStatus} : todo)
      );
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
        queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => 
          prev.map((todo) => todo.id === todoId ? {...todo, completed: !newCompletedStatus} : todo)
        );
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
          queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => 
            prev.map((todo) => todo.id === todoId ? {...todo, completed: true, nextOccurrence: null} : todo)
          );
          setSelectedTodo((prev) => {
            if (prev?.id === todoId) {
              return { ...prev, completed: true, nextOccurrence: null };
            }
            return prev;
          });
        }
        else{
          console.log("next occurrence date", nextOccurrenceDate);
          queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => 
            prev.map((todo) => todo.id === todoId ? {...todo, completeAt: nextOccurrenceDate.toISOString()} : todo)
          );
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
        queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => 
          prev.map((todo) => todo.id === todoId ? {...todo, completeAt: baseDate.toISOString()} : todo)
        );
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
      queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => 
        prev.map((todo) => todo.id === todoId ? {...todo, completed: newCompletedStatus} : todo)
      );
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
        queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => 
          prev.map((todo) => todo.id === todoId ? {...todo, completed: !newCompletedStatus} : todo)
        );
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
    queryClient.setQueryData<Todo[]>(["todos"], (prev = []) => prev.filter((todo) => todo.id !== todoId));
    if (selectedTodo?.id === todoId) {
      setSelectedTodo(null);
      setIsDetailOpen(false);
    }
    try {
      await api.delete(`/v1/todo/${todoId}`);
    } catch (error) {
      console.error("Error deleting todo", error);
      // Revert on error - refetch todos
      queryClient.invalidateQueries({ queryKey: ["todos"] });
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
      // On error, refetch todos to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  }


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()

    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)

  },[])

  useEffect(() => {
    const taskIdParam = searchParams.get("task")
    if(taskIdParam){
      const matched = todos.find((t) => String(t.id) === taskIdParam)
      
      if(matched){
        setSelectedTodo(matched)
        setIsDetailOpen(true)
      }
      else{
        setSelectedTodo(null)
        setIsDetailOpen(false)
      }
    } 
    else {
      setSelectedTodo(null)
      setIsDetailOpen(false)
    }
  },[searchParams,todos])

  

  return (
    <>
      <div className="relative min-h-screen bg-background w-full">
        
        {/* Grid backdrop */}
        {/* <div
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
        /> */}

        <div className="relative z-10 flex h-screen ">
        <SideBar expanded={expanded} setExpanded={setExpanded}>
          {expanded && (
          <button className="flex gap-2 mb-5 hover:bg-hover p-2 rounded-sm cursor-pointer w-full"
          onClick= {() => openModal()}
          >
            <div className="p-1 rounded-full w-6 h-6 flex items-center justify-center bg-purple-500 overflow-hidden">
            <Plus className="w-5 h-5 text-background"/>
            </div>
            <div className="flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden">
            <span className="text-sm font-medium text-accent">Add Task</span>
            </div>
          </button>
          )}
          <SideBarItem icon={<Calendar1 size={20}/>} text="Today" 
          onClick={() => {
            setActiveTab("today")
            if(isMobile){
              setExpanded(false)
            }
          }}
          active = {activeTab === "today"}
          />
          <SideBarItem icon={<CalendarDays size={20}/>} text="Upcoming"
          onClick={() => {
            setActiveTab("upcoming")
            if(isMobile){
              setExpanded(false)
            }
          }}
          active = {activeTab === "upcoming"}
          />
          <SideBarItem icon={<CircleCheck size={20}/>} text="Completed"
          onClick={() => {
            setActiveTab("completed")
            if(isMobile){
              setExpanded(false)
            }
          }}
          active = {activeTab === "completed"}
          />
        </SideBar>
        {/* //backdrop for mobile which closes the sidebar when clicked outside */}
          {isMobile && expanded && (
            <div className="fixed inset-0  z-40 bg-background/95 backdrop-blur-sm" onClick={() => setExpanded(false)} />
          )}
        <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-end items-center p-5">
        <button ref={viewDropdownButtonRef} onClick={() => {setShowViewDropdown(!showViewDropdown)
          setViewTypeActive(!viewTypeActive)
        }}>
          {
            activeTab === "upcoming" && !isMobile && (
          <div className={`flex items-center gap-2 cursor-pointer hover:bg-muted hover:text-foreground p-2 rounded-sm transition-all duration-300 text-muted-foreground
            ${viewTypeActive ? "bg-muted text-foreground" : ""}`}>
          {viewType === "board" ? <SquareKanban className="w-5 h-5 cursor-pointer font-light" /> : <CalendarDays className="w-5 h-5 cursor-pointer font-light" />}
          <span className="text-sm font-medium">{viewType === "board" ? "Board" : "Calendar"}</span>
          </div>
          )}
        </button> 
        </div>
       
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
            onAddTask={() => openModal()}
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
      { isDetailOpen && selectedTodo && (<TaskDetailDrawer
        todo={selectedTodo}
        isOpen={isDetailOpen}
        onClose={closeDetailDrawer}
        editAllowed={activeTab === "upcoming" && viewType === "calendar"}
        onEdit={updateTodo}
        onToggleComplete={toggleTodoCompletion}
        onDelete={deleteTodo}
        handleDuplicate={duplicateTodo}
        key={selectedTodo.id}
      />
    )}
      {showViewDropdown && (
        <ViewDropDown viewType={viewType} setViewType={setViewType} buttonRef={viewDropdownButtonRef} setShowViewDropdown={setShowViewDropdown} setViewTypeActive={setViewTypeActive} />
      )}
    </>
  );
};

export default Dashboard;
