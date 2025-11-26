import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Plus, MoreHorizontal, PencilLine, Trash2, CopyPlus, Flag, Tag } from "lucide-react";
import type { Todo } from "./Modal";
import { Checkbox } from "./ui/checkbox";
import { getUpcomingDateRange, formatUpcomingDateHeader, isTaskOnDate } from "@shiva200701/todotypes";
import WarningModal from "./WarningModal";
import InlineTaskForm from "./InlineTaskForm";
import completedSound from "@/assets/completed.wav";
import {DndContext, useDraggable, useDroppable, DragOverlay, MouseSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";


import type {DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import api from "../utils/api";


interface UpcomingViewProps {
  todos: Todo[];
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  onEdit: (todo: Todo) => void;
  onUpdateTodo: (todo: Todo) => void;
  onAddTask: (preselectedDate?: string) => void;
  onViewDetails: (todo: Todo) => void;
  onTaskCreated?: (todo: Todo) => void;
  onDuplicateTask: (todo: Todo) => void;
  onTaskUpdated: (todo: Todo) => void;
}

interface DraggableTaskProps {
    todo: Todo;
    index: number;
    onToggleComplete: (todoId: string | number) => void;
    onDelete: (todo: Todo) => void;
    onEdit: (todo: Todo) => void;
    onViewDetails: (todo: Todo) => void;
    openDropdownId: number | string | null;
    setOpenDropdownId: (id: number | string | null) => void;
    hoveredTodoId: number | string | null;
    setHoveredTodoId: (id: number | string | null) => void;
    dropdownRefs: React.RefObject<Map<number | string, HTMLDivElement>>;
    playSound: () => void;
    onDuplicateTask: (todo: Todo) => void;
    onTaskUpdated: (todo: Todo) => void;
}

interface DroppableDateColumnProps {
    date: Date;
    dayTasks: Todo[];
    isToday: boolean;
    onAddTask: (date: Date) => void;
    onTaskCreated: (todo: Todo) => void;
    onTaskUpdated: (todo: Todo) => void;
    children: React.ReactNode;
    isFormOpen: boolean;
    onOpenForm: () => void;
    onCloseForm: () => void;
}

const DraggableTask = ({
    todo,
    index,
    onToggleComplete,
    onDelete,
    onViewDetails,
    openDropdownId,
    setOpenDropdownId,
    hoveredTodoId,
    setHoveredTodoId,
    dropdownRefs,
    playSound,
    onDuplicateTask,
    onTaskUpdated,
}: DraggableTaskProps) => {
    const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
        id: todo.id || `temp-${index}`,
        data:{
            todo
        }
    })

    

    const style = {
        opacity: isDragging ? 0 : 1,
        userSelect: 'none' as const,
        touchAction: 'pan-y' as const,
        WebkitUserSelect: 'none' as const,
    }

    const priorityColors = {
      high: "text-red-500",
      medium: "text-blue-500",
      low: "text-green-500",
      none: "text-gray-500",
    };
    

    const isMobile = window.innerWidth < 768;

    const toggleDropdown = (todoId: number | string | undefined, event: React.MouseEvent) => {
        event.stopPropagation();
        if (!todoId) return;
        setOpenDropdownId(openDropdownId === todoId ? null : todoId);
      };

    
      const handleDeleteClick = (todo: Todo) => {
        setOpenDropdownId(null);
        onDelete(todo);
      };
      const [isEditing, setIsEditing] = useState(false);

      const handlePrioritySelect = async (todo: Todo) => {
        try {
          const response = await api.put(`/v1/todo/${todo.id}`, {
            title: todo.title,
            description: todo.description,
            completeAt: todo.completeAt,
            category: todo.category,
            priority: todo.priority ?? null,
            isRecurring: todo.isRecurring,
            recurrencePattern: todo.recurrencePattern ?? null,
            recurrenceInterval: todo.recurrenceInterval ?? null,
            recurrenceEndDate: todo.recurrenceEndDate ?? null,
          });
          onTaskUpdated(response.data.todo);
        } catch (error) {
          console.error("Error updating priority", error);
        }
      }

    
      return (
        <>
        {isEditing ? (
          <InlineTaskForm
            index={index}
            preselectedDate={todo.completeAt ? new Date(todo.completeAt) : new Date()}
            todo={todo}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
            onUpdate={onTaskUpdated}
          />
        ):(
        <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-[#101018]/80 backdrop-blur-sm border border-white/10 rounded-xl relative cursor-pointer active:cursor-grabbing hover:border-white/20 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
      onMouseEnter={() => todo.id && setHoveredTodoId(todo.id)}
      onMouseLeave={() => setHoveredTodoId(null)}
      onClick={() => onViewDetails(todo)}
    >

      {/* Three-dot Menu */}
      {todo.id  && (
        <div
          className={`absolute top-2 right-2 z-20 transition-opacity duration-200 pointer-events-auto ${
            openDropdownId === todo.id || hoveredTodoId === todo.id || isMobile ? "opacity-100" : "opacity-0"
          }`}
          ref={(el) => {
            if (el && todo.id) {
              dropdownRefs.current.set(todo.id, el);
            }
          }}
          onMouseEnter={() => todo.id && setHoveredTodoId(todo.id)}
          onMouseLeave={() => {
            if (openDropdownId !== todo.id) {
              setHoveredTodoId(null);
            }
          }}
        >
          <button
            className="text-[#A2A2A9] hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown(todo.id!, e);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {openDropdownId === todo.id && (
            <div className="absolute right-0 w-45 bg-[#101018]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50">
              <button
                className="w-full px-3 py-2 text-left text-sm text-[#A2A2A9] hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 cursor-pointer border-b border-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <PencilLine className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <div className="text-white px-3 py-2 text-xs font-light">Priority</div>
              <div className="px-3 py-1 flex items-center gap-3">
                  {Array.from({length: 4}).map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        todo.priority = index === 0 ? "high" : index === 1 ? "medium" : index === 2 ? "low" : null;
                        handlePrioritySelect(todo);
                        setOpenDropdownId(null);
                      }}
                    >
                    <Flag className={`w-7 h-7 hover:bg-gray-800 p-[5px] rounded-md cursor-pointer ${priorityColors[index === 0 ? "high" : index === 1 ? "medium" : index === 2 ? "low" : "none"]}`} style={{ fill: index === 0 ? "#DC2828" : index === 1 ? "#3B82F6" : index === 2 ? "#28A745" : "none"  }} />
                    </button>
                  ))}
                </div>
                <button
                className="w-full px-3 py-2 text-left text-sm text-[#A2A2A9] hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateTask(todo as Todo);
                  setOpenDropdownId(null);

                }}
              >
                <CopyPlus className="w-4 h-4" />
                <span>Duplicate</span>
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm text-[#A2A2A9] hover:bg-white/5 hover:text-red-400 transition-colors flex items-center gap-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(todo);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-3 pr-4">
        <div className="pt-0.5">
          <Checkbox
            className={`border-blue-600 cursor-pointer ${todo.priority === "high" ? "border-red-500" : todo.priority === "medium" ? "border-blue-500" : todo.priority === "low" ? "border-green-500" : "border-gray-500"}`}
            defaultChecked={todo.completed}
            onClick={(e) => {
              e.stopPropagation();
              todo.id && onToggleComplete(todo.id);
              playSound();
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium mb-1 line-clamp-2">
            {todo.title}
          </div>
          {todo.description && (
            <div className="text-[#A2A2A9] text-xs mt-1 line-clamp-2">
              {todo.description}
            </div>
          )}
          {todo.category && (
            <div className="mt-2 text-gray-500  w-fit  rounded-md text-xs flex gap-1">
              <div className="flex justify-center items-center">
                <Tag className="w-3 h-3" />
              </div>
              <div>{todo.category}</div>
            </div>
          )}
        </div>
      </div>
    </div>
    )}
    </>
      )
}

const DroppableDateColumn = ({
    date,
    dayTasks,
    isToday,
    onTaskCreated,
    onTaskUpdated,
    children,
    isFormOpen,
    onOpenForm,
    onCloseForm,
}: DroppableDateColumnProps) => {
    const {setNodeRef, isOver} = useDroppable({
        id: date.toISOString(),
        data:{
            date
        }
    });

    const handleAddTaskClick = () => {
        console.log("handleAddTaskClick");
        onOpenForm();
    };

    const handleCancel = () => {
        onCloseForm();
    };

    const handleTaskCreated = (todo: Todo) => {
        onTaskCreated(todo);
        onCloseForm();
    };

    const handleTaskUpdated = (todo: Todo) => {
        onTaskUpdated(todo);
        onCloseForm();
    };

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col bg-[#101018]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 min-h-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors ${
                isToday ? "ring-2 ring-purple-500/50 border-purple-500/30" : ""
              } ${isOver ? "ring-2 ring-purple-500/70 border-purple-500/50 bg-[#101018]/90" : ""}`}
        >
            {/* Date Header */}
            <div className="mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-1">
                    <div className="text-white text-sm font-semibold">
                        {formatUpcomingDateHeader(date)}
                    </div>
                    <div className="text-[#A2A2A9] text-xs">
                        {dayTasks.length}
                    </div>
                </div>
            </div>

            {/* Tasks Container - Includes tasks, Add task button, and inline form */}
            <div className="mb-4 space-y-3 ">
                {children}
                
                {/* Add Task Button and Inline Form - Below all tasks */}
                {!isFormOpen ? (
                    <button
                        onClick={handleAddTaskClick}
                        className="group flex items-center gap-2 text-[#A2A2A9] hover:text-purple-400 transition-colors text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-inset p-3 rounded-md w-full border border-white/5 hover:border-white/10 hover:bg-white/5"
                    >
                        <Plus className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                        <span>Add task</span>
                    </button>
                ) : (
                    <InlineTaskForm
                        index={dayTasks.length}
                        preselectedDate={date}
                        onCancel={handleCancel}
                        onSuccess={handleTaskCreated}
                        onUpdate={handleTaskUpdated}
                    />
                )}
            </div>
        </div>
    )
}

const UpcomingView = ({
  todos,
  onToggleComplete,
  onDelete,
  onEdit,
  onUpdateTodo,
  onAddTask,
  onViewDetails,
  onTaskCreated,
  onDuplicateTask,
  onTaskUpdated,
}: UpcomingViewProps) => {
  const [startDate, setStartDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);
  const [hoveredTodoId, setHoveredTodoId] = useState<number | string | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [openFormDate, setOpenFormDate] = useState<string | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<Map<number | string, HTMLDivElement>>(new Map());
  const audio = new Audio(completedSound);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate number of days based on screen size
  const getDayCount = () => {
    const smallTablet = windowWidth >= 768 && windowWidth <= 850;
    const isTablet = windowWidth <= 1024;
    
    if(smallTablet){
        return 3;
    }
    if(isTablet){
        return 4;
    }
    return 5;
  };

  const dayCount = getDayCount();

  const dateRange = useMemo(() => {
    return getUpcomingDateRange(startDate, dayCount);
  }, [startDate, dayCount]);


  const playSound = () => {
    audio.play();
  };

  //smoother UI transitions
  const sensors = useSensors(
    useSensor(MouseSensor, {
        activationConstraint: { distance: 8 },
      }),

    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  )

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowMonthYearPicker(false);
      }
      
      // Close dropdowns when clicking outside
      if (openDropdownId !== null) {
        const dropdownElement = dropdownRefs.current.get(openDropdownId);
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };

    if (showMonthYearPicker || openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthYearPicker, openDropdownId]);

  const navigatePrevious = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - dayCount);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Only navigate if the new date is today or in the future
    // If going back would go to past, jump to today instead
    if (newDate >= today) {
      setStartDate(newDate);
    } else {
      // If going back would go to past, jump to today
      setStartDate(today);
    }
  };

  const navigateNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + dayCount);
    setStartDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStartDate(today);
  };

  const getCurrentMonthYear = () => {
    return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleShowMonthYearPicker = () => {
    setShowMonthYearPicker(!showMonthYearPicker);
  };

  const handleMonthYearSelect = (year: number, month: number, yearPicker: boolean = false) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    let newDate: Date;
    
    // If selecting current year and current month, start from today
    if (year === currentYear && month === currentMonth) {
      newDate = new Date(year, month, currentDay);
    } else {
      // Otherwise, start from the 1st of the selected month
      newDate = new Date(year, month, 1);
    }
    
    newDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Only allow selecting today or future dates
    if (newDate >= today) {
      if (!yearPicker) {
        setShowMonthYearPicker(false);
      }
      setStartDate(newDate);
    }
  };

  // Generate years (current year and future years only)
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // Generate months (filter out past months for current year, but allow current month)
  const getMonths = (selectedYear: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const allMonths = [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' },
    ];

    // If selected year is current year, show current month and future months
    if (selectedYear === currentYear) {
      return allMonths.filter(month => month.value >= currentMonth);
    }
    
    // For future years, show all months
    return allMonths;
  };

  // Check if a month/year combination is in the past
  const isPastDate = (year: number, month: number): boolean => {
    const today = new Date();
    if (month == today.getMonth()){
        return false;
    }
    const date = new Date(year, month, 1);
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getTasksForDate = (date: Date): Todo[] => {
    return todos.filter(
      (todo) => !todo.completed && isTaskOnDate(todo.completeAt, date)
    );
  };

  const handleAddTask = (date: Date) => {
    // Create UTC date at end of day for the selected date
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    // Create date in UTC at end of day (23:59:59.999)
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    onAddTask(endOfDay.toISOString());
  };

  const handleDeleteClick = (todo: Todo) => {
    setTodoToDelete(todo);
    setIsWarningModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!todoToDelete?.id) {
      return;
    }
    onDelete(todoToDelete.id);
    setTodoToDelete(null);
    setIsWarningModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsWarningModalOpen(false);
    setTodoToDelete(null);
  };

  const handleEditClick = (todo: Todo) => {
    setOpenDropdownId(null);
    onEdit(todo);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const {active} = event;
    const todo = active.data.current?.todo as Todo;
    setActiveTodo(todo);
  }

  async function handleDragEnd(event: DragEndEvent) {
    
    console.log("handleDragEnd");
    const {active, over} = event;
    setActiveTodo(null);

    if(!over || !active.data.current) return;

    const todo = active.data.current?.todo as Todo;
    const newDateString = over.id as string;
    console.log("todo",todo);

    //parse
    const newDate = new Date(newDateString);

    //don't update if dropped on current data
    const currentDate = todo.completeAt ? new Date(todo.completeAt) : null;

    if(
        currentDate &&
        currentDate.getFullYear() === newDate.getFullYear() &&
        currentDate.getMonth() === newDate.getMonth() &&
        currentDate.getDate() === newDate.getDate()
    ){
        return;
    }
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const day = newDate.getDate();
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    const newCompleteAt = endOfDay.toISOString();
    console.log("newCompleteAt", newCompleteAt);
    const updatedTodo = {
        ...todo,
        completeAt: newCompleteAt,
    };
    onUpdateTodo(updatedTodo);


    //call backend
    if(todo.id){
    try{    

        const payload: any = {
            title: todo.title,
            description: todo.description,
            completeAt: newCompleteAt,
            category: todo.category,
            priority: todo.priority ?? null,
            isRecurring: todo.isRecurring || false,
        };
        
        // Only include recurrence fields if the todo is recurring
        if (todo.isRecurring) {
            payload.recurrencePattern = todo.recurrencePattern;
            payload.recurrenceInterval = todo.recurrenceInterval;
            if (todo.recurrenceEndDate) {
                payload.recurrenceEndDate = todo.recurrenceEndDate;
            }
        }
        console.log("payload", payload);
        await api.put(`/v1/todo/${todo.id}`, payload);
        }catch(error){
            console.error("Error updating todo", error);
            onUpdateTodo(todo);
        }
    }
  }

  return(
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 overflow-hidden">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-3xl md:text-4xl font-bold hidden sm:block">Upcoming</h1>
          <div className="relative" ref={pickerRef}>
            <div
              className="flex items-center gap-2 text-[#A2A2A9] cursor-pointer hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              onClick={handleShowMonthYearPicker}
            >
              <span className="text-lg">{getCurrentMonthYear()}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showMonthYearPicker ? "rotate-180" : ""}`}
              />
            </div>

            {/* Month/Year Picker Dropdown */}
            {showMonthYearPicker && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 bg-[#101018]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 min-w-[280px] max-w-[90vw] sm:min-w-[320px]">
                <div className="grid grid-cols-2 gap-6">
                  {/* Month Selector */}
                  <div>
                    <div className="text-white text-sm font-semibold mb-3 text-center">Month</div>
                    <div className="grid grid-cols-3 gap-2 overflow-hidden">
                      {getMonths(startDate.getFullYear()).map((month) => {
                        const isSelected = startDate.getMonth() === month.value;
                        const isDisabled = isPastDate(startDate.getFullYear(), month.value);

                        return (
                          <button
                            key={month.value}
                            onClick={() => {
                              if (!isDisabled) {
                                handleMonthYearSelect(startDate.getFullYear(), month.value, false);
                              }
                            }}
                            disabled={isDisabled}
                            className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 cursor-pointer"
                                : isDisabled
                                ? "text-[#4A4A4A] cursor-not-allowed opacity-40"
                                : "text-[#A2A2A9] hover:bg-white/5 hover:text-white hover:scale-105 active:scale-95"
                            }`}
                          >
                            {month.label.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Year Selector */}
                  <div>
                    <div className="text-white text-sm font-semibold mb-3 text-center">Year</div>
                    <div className="max-h-56 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
                      {getYears().map((year) => {
                        const isSelected = startDate.getFullYear() === year;
                        const isCurrentYear = year === new Date().getFullYear();

                        return (
                          <button
                            key={year}
                            onClick={() => {
                              // If selecting current year, ensure we don't go to past months
                              const today = new Date();
                              const monthToUse = isCurrentYear
                                ? Math.max(startDate.getMonth(), today.getMonth())
                                : startDate.getMonth();
                              handleMonthYearSelect(year, monthToUse, true);
                            }}
                            className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all text-left cursor-pointer ${
                              isSelected
                                ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 font-semibold"
                                : "text-[#A2A2A9] hover:bg-white/5 hover:text-white hover:translate-x-1"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-[#9EA0BB] text-xs text-center">
                    Only future dates are available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={navigatePrevious}
            className="text-[#A2A2A9] hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={navigateToToday}
            className="text-[#A2A2A9] hover:text-white transition-colors px-2 sm:px-4 py-2 rounded-lg hover:bg-white/5 text-sm font-medium cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={navigateNext}
            className="text-[#A2A2A9] hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ">
        {dateRange.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const dateKey = date.toISOString();
          const isFormOpen = openFormDate === dateKey;
          return (
            <DroppableDateColumn
              key={dateKey}
              date={date}
              dayTasks={dayTasks}
              isToday={isToday}
              onAddTask={handleAddTask}
              isFormOpen={isFormOpen}
              onOpenForm={() => setOpenFormDate(dateKey)}
              onCloseForm={() => setOpenFormDate(null)}
              onTaskCreated={(todo) => {
                if (onTaskCreated) {
                  onTaskCreated(todo);
                }
              }}
              onTaskUpdated={(todo) => {
                if (onTaskUpdated) {
                  onTaskUpdated(todo);
                }
              }}
            >
                {dayTasks.map((todo, taskIndex) => (
                  <DraggableTask
                    key={todo.id || `temp-${index}-${todo.title}`}
                    todo={todo}
                    index={taskIndex}
                    onToggleComplete={onToggleComplete}
                    onDelete={handleDeleteClick}
                    onEdit={handleEditClick}
                    onViewDetails={onViewDetails}
                    openDropdownId={openDropdownId}
                    setOpenDropdownId={setOpenDropdownId}
                    hoveredTodoId={hoveredTodoId}
                    setHoveredTodoId={setHoveredTodoId}
                    dropdownRefs={dropdownRefs}
                    playSound={playSound}
                    onDuplicateTask={onDuplicateTask}
                    onTaskUpdated={(todo) => {
                        if (onTaskUpdated) {
                          onTaskUpdated(todo);
                        }
                      }}
                  />
                ))}
            </DroppableDateColumn>
          );
        })}
      </div>

      {/* Drag Overlay for better UX */}
      <DragOverlay>
        {activeTodo ? (
          <div className="p-3 bg-[#101018]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] opacity-90 cursor-grabbing"
          style={{
            transform: 'rotate(3deg)'
          }}>
            <div className="flex gap-3 pr-8">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium mb-1 line-clamp-2">
                  {activeTodo.title}
                </div>
                {activeTodo.description && (
                  <div className="text-[#A2A2A9] text-xs mt-1 line-clamp-2">
                    {activeTodo.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </div>

    <WarningModal
      isOpen={isWarningModalOpen}
      onClose={handleDeleteCancel}
      onDelete={handleDeleteConfirm}
      title="Delete Task"
      description="Are you sure you want to delete this task?"
      buttonText="Delete"
    />
  </DndContext>
  );
};

export default UpcomingView;

