import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Plus, MoreHorizontal, Pencil, Trash } from "lucide-react";
import type { Todo } from "./Modal";
import { Checkbox } from "./ui/checkbox";
import { getUpcomingDateRange, formatUpcomingDateHeader, isTaskOnDate } from "@shiva200701/todotypes";
import WarningModal from "./WarningModal";
import completedSound from "@/assets/completed.wav";
import {DndContext, useDraggable, useDroppable, DragOverlay, PointerSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";

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
}

interface DroppableDateColumnProps {
    date: Date;
    dayTasks: Todo[];
    isToday: boolean;
    onAddTask: (date: Date) => void;
    children: React.ReactNode;
}

const DraggableTask = ({
    todo,
    index,
    onToggleComplete,
    onDelete,
    onEdit,
    onViewDetails,
    openDropdownId,
    setOpenDropdownId,
    hoveredTodoId,
    setHoveredTodoId,
    dropdownRefs,
    playSound,
}: DraggableTaskProps) => {
    const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
        id: todo.id || `temp-${index}`,
        data:{
            todo
        }
    })

    const style = {
        opacity: isDragging ? 0 : 1,
    }

    const [isActivating, setIsActivating] = useState(false);
    const activationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleDropdown = (todoId: number | string | undefined, event: React.MouseEvent) => {
        event.stopPropagation();
        if (!todoId) return;
        setOpenDropdownId(openDropdownId === todoId ? null : todoId);
      };

      const handleEditClick = (todo: Todo) => {
        setOpenDropdownId(null);
        onEdit(todo);
      };
    
      const handleDeleteClick = (todo: Todo) => {
        setOpenDropdownId(null);
        onDelete(todo);
      };

      const handleTouchStart = () =>{
        setIsActivating(true);
        activationTimeout.current = setTimeout(()=>{
            setIsActivating(false);
        },250);
      }

      const handleTouchEnd = () =>{
        if(activationTimeout.current){
            clearTimeout(activationTimeout.current);
        }
        setIsActivating(false);
      }

      return (
        <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`p-3 bg-[#131315] border border-gray-800 rounded-xl relative cursor-pointer active:cursor-grabbing hover:border-purple-500/50 transition-all duration-300 ${isActivating  ? "border-purple-500 scale-105 shadow-lg shadow-purple-500/50 ring-2 ring-purple-500/30"  : "border-gray-800 hover:border-purple-500/50"}`}
      onMouseEnter={() => todo.id && setHoveredTodoId(todo.id)}
      onMouseLeave={() => setHoveredTodoId(null)}
      onClick={() => onViewDetails(todo)}
    >
         {isActivating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-purple-500/50 animate-pulse">
                <span className="text-purple-400 text-xs font-medium">Hold to drag</span>
            </div>
        </div>
    )}
      {/* Three-dot Menu */}
      {todo.id && (
        <div
          className={`absolute top-2 right-2 z-20 transition-opacity duration-200 pointer-events-auto ${
            openDropdownId === todo.id || hoveredTodoId === todo.id ? "opacity-100" : "opacity-0"
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
            className="text-gray-500 hover:text-white p-1 rounded-md hover:bg-[#1B1B1E] transition-colors cursor-pointer"
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
            <div className="absolute right-0 mt-1 w-32 bg-[#1B1B1E] border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
              <button
                className="w-full px-3 py-2 text-left text-sm text-[#A2A2A9] hover:bg-[#131315] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(todo);
                }}
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm text-[#A2A2A9] hover:bg-[#131315] hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(todo);
                }}
              >
                <Trash className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-3 pr-4">
        <div className="pt-0.5">
          <Checkbox
            className="border-blue-600 cursor-pointer"
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
        </div>
      </div>
    </div>
      )
}

const DroppableDateColumn = ({
    date,
    dayTasks,
    isToday,
    onAddTask,
    children,
}: DroppableDateColumnProps) => {
    const {setNodeRef, isOver} = useDroppable({
        id: date.toISOString(),
        data:{
            date
        }
    });
    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col bg-[#1B1B1E] border border-gray-800 rounded-2xl p-4 min-h-[400px] shadow-lg shadow-black/50 transition-colors ${
                isToday ? "ring-2 ring-purple-500/50" : ""
              } ${isOver ? "ring-2 ring-purple-500 border-purple-500/50" : ""}`}
        >
            {/* Date Header */}
            <div className="mb-4 pb-3 border-b border-gray-800">
                <div className="text-white text-sm font-semibold mb-1">
                {formatUpcomingDateHeader(date)}
                </div>
                <div className="text-[#A2A2A9] text-xs">
                {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                </div>
            </div>

            {/* Tasks */}
            <div className="flex-1 mb-4 space-y-3 overflow-y-auto">
                {children}
            </div>

            {/* Add Task Button */}
            <button
                onClick={() => onAddTask(date)}
                className="flex items-center gap-2 text-[#A2A2A9] hover:text-red-400 transition-colors text-sm font-medium mt-auto pt-3 border-t border-gray-800 cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                <span>Add task</span>
            </button>
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
  const pickerRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<Map<number | string, HTMLDivElement>>(new Map());
  const audio = new Audio(completedSound);

  const dateRange = useMemo(() => {
    return getUpcomingDateRange(startDate, 5);
  }, [startDate]);


  const playSound = () => {
    audio.play();
  };

  //smoother UI transitions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,   // Require 8px of movement before drag starts
      },
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
    newDate.setDate(newDate.getDate() - 5);
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
    newDate.setDate(newDate.getDate() + 5);
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
            priority: todo.priority,
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
      <div className="flex justify-between items-center mb-6 overflow-x-hidden">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-3xl md:text-4xl font-bold hidden sm:block">Upcoming</h1>
          <div className="relative" ref={pickerRef}>
            <div
              className="flex items-center gap-2 text-[#A2A2A9] cursor-pointer hover:text-white transition-colors"
              onClick={handleShowMonthYearPicker}
            >
              <span className="text-lg">{getCurrentMonthYear()}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showMonthYearPicker ? "rotate-180" : ""}`}
              />
            </div>

            {/* Month/Year Picker Dropdown */}
            {showMonthYearPicker && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 bg-[#1B1B1E] border border-gray-700 rounded-2xl p-5 shadow-2xl z-50 min-w-[280px] max-w-[90vw] sm:min-w-[320px] backdrop-blur-sm">
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
                                ? "text-[#4A4A4A] cursor-not-allowed! opacity-40"
                                : "text-[#A2A2A9] hover:bg-[#131315] hover:text-white hover:scale-105 active:scale-95"
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
                                : "text-[#A2A2A9] hover:bg-[#131315] hover:text-white hover:translate-x-1"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="text-[#6B6B75] text-xs text-center">
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
            className="text-[#A2A2A9] hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-[#1B1B1E] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={navigateToToday}
            className="text-[#A2A2A9] hover:text-white transition-colors px-2 sm:px-4 py-2  rounded-lg hover:bg-[#1B1B1E] text-sm font-medium cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={navigateNext}
            className="text-[#A2A2A9] hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-[#1B1B1E] cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {dateRange.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <DroppableDateColumn
              key={date.toISOString()}
              date={date}
              dayTasks={dayTasks}
              isToday={isToday}
              onAddTask={handleAddTask}
            >
              {dayTasks.length > 0 ? (
                dayTasks.map((todo, taskIndex) => (
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
                  />
                ))
              ) : (
                <div className="text-[#6B6B75] text-xs text-center py-8">No tasks</div>
              )}
            </DroppableDateColumn>
          );
        })}
      </div>

      {/* Drag Overlay for better UX */}
      <DragOverlay>
        {activeTodo ? (
          <div className="p-3 bg-[#131315] border-2 border-purple-500 rounded-xl shadow-lg opacity-90 cursor-grabbing"
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
    />
  </DndContext>
  );
};

export default UpcomingView;

