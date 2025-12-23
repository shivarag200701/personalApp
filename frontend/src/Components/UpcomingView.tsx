import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ChevronDown, Plus, MoreHorizontal, PencilLine, Trash2, CopyPlus, Flag, Tag, Repeat, Calendar, AlarmClock} from "lucide-react";
import type { Todo } from "./Modal";
import { Checkbox } from "./ui/checkbox";
import { getUpcomingDateRange, formatUpcomingDateHeader} from "@shiva200701/todotypes";
import WarningModal from "./WarningModal";
import InlineTaskForm from "./InlineTaskForm";
import completedSound from "@/assets/completed.wav";
import {DndContext, useDraggable, useDroppable, DragOverlay, MouseSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";
import CalendarView from "./CalendarView";
import { toast } from "sonner";
import type {DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import api from "../utils/api";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";



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
  viewType?: "board" | "calendar";
  onViewTypeChange?: (viewType: "board" | "calendar") => void;
}

interface DraggableTaskProps {
    todo: Todo;
    index: number;
    columnIndex: number;
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
    todos: Todo[];
}

interface DroppableDateColumnProps {
    date: Date;
    dayTasks: Todo[];
    isToday: boolean;
    isOverdue?: boolean;
    onAddTask: (date: Date) => void;
    onTaskCreated: (todo: Todo) => void;
    onTaskUpdated: (todo: Todo) => void;
    children: React.ReactNode;
    isFormOpen: boolean;
    onOpenForm: () => void;
    onCloseForm: () => void;
    todos: Todo[];
    columnIndex: number;
}

const DraggableTask = ({
    todo,
    index,
    columnIndex,
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
    todos,
}: DraggableTaskProps) => {
    const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
        id: todo.id || `temp-${index}`,
        data:{
            todo
        }
    })

    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

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
    
    // Check if todo.completeAt is for today (comparing local dates)
    const isToday = (completeAt: string | null | undefined): boolean => {
      if (!completeAt) return false;
      const todoDate = new Date(completeAt);
      const now = new Date();

      return (
        todoDate.getFullYear() === now.getFullYear() &&
        todoDate.getMonth() === now.getMonth() &&
        todoDate.getDate() === now.getDate()
      );
    };

    const isTomorrow = (completeAt: string | null | undefined): boolean => {
      if (!completeAt) return false;
      const todoDate = new Date(completeAt);
      const now = new Date();
      return (
        todoDate.getFullYear() === now.getFullYear() &&
        todoDate.getMonth() === now.getMonth() &&
        todoDate.getDate() === now.getDate() + 1
      );
    };

    const isMobile = window.innerWidth < 768;

    const toggleDropdown = (todoId: number | string | undefined, event: React.MouseEvent) => {
        event.stopPropagation();
        if (!todoId) return;
        const willOpen = openDropdownId !== todoId;
        setOpenDropdownId(willOpen ? todoId : null);
        
        if (willOpen && buttonRef.current) {
            // Calculate position when opening
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            });
        } else {
            setDropdownPosition(null);
        }
    };

    // Reset position when dropdown closes externally
    useEffect(() => {
        if (openDropdownId !== todo.id) {
            setDropdownPosition(null);
        }
    }, [openDropdownId, todo.id]);

    
      const handleDeleteClick = (todo: Todo) => {
        setOpenDropdownId(null);
        setDropdownPosition(null);
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
          setOpenDropdownId(null);
          setDropdownPosition(null);
        } catch (error) {
          console.error("Error updating priority", error);
        }
      }
      const getTimeFromDate12hr = (date: string): string => {
        if(!date) return "";
        const dateObj = new Date(date);
        return dateObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }

    
      return (
        <>
        {isEditing ? (
          <InlineTaskForm
            columnIndex={columnIndex}
            index={index}
            preselectedDate={todo.completeAt ? new Date(todo.completeAt) : new Date()}
            todo={todo}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
            onUpdate={onTaskUpdated}
            todos={todos}
          />
        ):(
        <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-[#101018]/80 backdrop-blur-sm border border-white/10 rounded-xl relative cursor-pointer active:cursor-grabbing hover:border-white/20 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${openDropdownId === todo.id ? "z-50": ""}`}
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
            ref={buttonRef}
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
        </div>
      )}

      {/* Dropdown Menu - Rendered via Portal */}
      {openDropdownId === todo.id && dropdownPosition && createPortal(
          <div 
            className="fixed z-9999 w-45 bg-[#101018]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            data-dropdown-menu="true"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
          >
              <button
                className="w-full px-3 py-2 text-left text-sm text-[#A2A2A9] hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 cursor-pointer border-b border-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsEditing(true);
                  setOpenDropdownId(null);
                  setDropdownPosition(null);
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
                  setDropdownPosition(null);
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
            </div>,
          document.body
        )
      }
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
          <div className="flex gap-2">
          {todo.category && (
            <div className="mt-2 text-gray-500  w-fit  rounded-md text-xs flex gap-1">
              <div className="flex justify-center items-center">
                <Tag className="w-3 h-3" />
              </div>
              <div>{todo.category}</div>
            </div>
          )}
          <div className="flex items-center gap-2">
          {!todo.isAllDay && (
            <div className={`mt-2 ${isToday(todo.completeAt) ? "text-[#f46d63]" : isTomorrow(todo.completeAt) ? "text-[#b77424]" : "text-[#9062d4]"}  w-fit  rounded-md text-xs flex gap-1`}>
              <div className="flex justify-center items-center">
                <Calendar className="w-3 h-3" />
              </div>
              <div>{getTimeFromDate12hr(todo.completeAt ?? "")}</div>
            </div>
          )}
          {todo.isRecurring  && (
            <div className={`mt-2 ${isToday(todo.completeAt) ? "text-[#f46d63]" : isTomorrow(todo.completeAt) ? "text-[#b77424]" : "text-[#9062d4]"}  w-fit  rounded-md text-xs flex gap-1`}>
              <div className="flex justify-center items-center">
                <Repeat className="w-3 h-3" />
              </div>
              <div>{todo.recurrencePattern}</div>
            </div>
          )}
          {!todo.isAllDay && (
            <div className="mt-2 w-fit  rounded-md text-xs flex gap-1 text-gray-400 hover:text-white transition-colors cursor-pointer">
                <div className="flex justify-center items-center">
                  <AlarmClock className="w-3 h-3" />
                </div>
            </div>
          )}
          </div>
          </div>
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
    isOverdue = false,
    onTaskCreated,
    onTaskUpdated,
    children,
    isFormOpen,
    onOpenForm,
    onCloseForm,
    todos,
    columnIndex,
}: DroppableDateColumnProps) => {    
    const {setNodeRef, isOver} = useDroppable({
        id: date.toLocaleDateString('en-CA'),
        data:{
            date
        },
    });
    

    const handleAddTaskClick = () => {
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
            className={`group flex flex-col bg-[#101018]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 min-h-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors ${
                isToday ? "ring-2 ring-purple-500/50 border-purple-500/30" : ""
              } ${isOver ? "ring-2 ring-purple-500/70 border-purple-500/50 bg-[#101018]/90" : ""}`}
        >
            
            {/* Date Header */}
            <div className="mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-1">
                    <div className="text-white text-sm font-semibold">
                        {isOverdue ? "Overdue" : formatUpcomingDateHeader(date)}
                    </div>
                    <div className="text-[#A2A2A9] text-xs">
                        {dayTasks.length}
                    </div>
                </div>
            </div>

            {/* Tasks Container - Only tasks should scroll */}
            <div className="mb-4 space-y-3 max-h-[350px] overflow-y-auto scrollbar-hide-on-hover">
                {children}
            </div>
            
            {/* Add Task Button and Inline Form - Outside scroll container, always visible */}
            {!isOverdue && (
                <>
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
                            columnIndex={columnIndex}
                            todos={todos}
                            index={dayTasks.length}
                            preselectedDate={date}
                            onCancel={handleCancel}
                            onSuccess={handleTaskCreated}
                            onUpdate={handleTaskUpdated}
                        />
                    )}
                </>
            )}
            <div className="flex items-center gap-2"></div>
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
  viewType: externalViewType,
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
  
  // Use external viewType if provided, otherwise default to "board"
  const viewType = externalViewType ?? "board";

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


  const getOverDueTasks = (): Todo[] => {
    //For all day todo
    const todayLocalStr = new Date().toLocaleDateString('en-CA');
    
    return todos.filter(
      (todo) => !todo.completed && todo.completeAt && new Date(todo.completeAt).toLocaleDateString('en-CA') < todayLocalStr
    );
  };

  // Calculate number of days based on screen size
  const getDayCount = () => {
    const smallTablet = windowWidth >= 768 && windowWidth <= 850;
    const isTablet = windowWidth <= 1024;
    
    let dayCount;
    if(smallTablet){
        dayCount = 3;
    } else if(isTablet){
        dayCount = 4;
    } else {
        dayCount = 5;
    }
    // Reduce by 1 if overdue tasks are present (to make room for overdue column)
    return getOverDueTasks().length > 0 ? dayCount - 1 : dayCount;
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
        const target = event.target as HTMLElement;
        // Check if click is on the portal dropdown menu
        const isPortalDropdown = target.closest('[data-dropdown-menu="true"]');
        if (dropdownElement && !dropdownElement.contains(target) && !isPortalDropdown) {
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
    const formatted = date.toLocaleDateString('en-CA')
    return todos.filter(
      (todo) => !todo.completed && todo.completeAt && new Date(todo.completeAt).toLocaleDateString('en-CA') === formatted
    );
  };

  const handleAddTask = (date: Date) => {
    // Create date in local timezone at noon to avoid timezone rollover issues
    onAddTask(date.toISOString());
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

  // Helper function to format date: day name if in current week, else "MMM d, yyyy"
  const formatDateForToast = (date: Date): string => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    
    if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
      return format(date, "EEEE"); // Day name (Monday, Tuesday, etc.)
    } else {
      return format(date, "MMM d, yyyy"); // Month day, year
    }
  };
  const combineDateAndTime = (date: string, time: string) => {
    if(!date || !time) return "";
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);

    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj.toISOString();
  }

  async function handleDragEnd(event: DragEndEvent) {
    
    const {active, over} = event;
    setActiveTodo(null);
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 1);
    if(!over || !active.data.current) return;

    if(over.id && over.id === overdueDate.toLocaleDateString('en-CA')){
      return;
    }
    const todo = active.data.current?.todo as Todo;
    const newDateString = over.id as string;
    //old date for undo
    const oldDate = todo.completeAt ? new Date(todo.completeAt) : null;
    const time = oldDate ? oldDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    }) : null;
    //parse
    const newDate = new Date(newDateString);

    //don't update if dropped on current data
    const currentDate = todo.completeAt ? new Date(todo.completeAt) : null;
    const newDateTime = combineDateAndTime(newDateString, time ?? "");
    if(
        currentDate &&
        currentDate.getFullYear() === newDate.getFullYear() &&
        currentDate.getMonth() === newDate.getMonth() &&
        currentDate.getDate() === newDate.getDate()
    ){
        return;
    }

    const updatedTodo = {
        ...todo,
        completeAt: newDateTime,
    };
    onUpdateTodo(updatedTodo);
    toast(
      <div className="flex items-center justify-between gap-10 w-full">
        <span className="pl-2">Date updated to <span className="underline cursor-pointer">{formatDateForToast(newDate)}</span></span>
        <div className="flex items-center">
          <div className="hover:bg-white/10 px-3 py-1 rounded-md cursor-pointer" onClick={async () => {
            onUpdateTodo({
              ...todo,
              completeAt: oldDate?.toISOString() ?? null,
            });
            //call backend
            await api.put(`/v1/todo/${todo.id}`, {
              ...todo,
              completeAt: oldDate?.toISOString() ?? null,
            });
          }}>Undo</div>
        </div>
      </div>,{
      position: "bottom-left",
      style: {
        background: '#2A2A3D',
        color: 'white',
        border: '1px solid #2A2A35',
        fontWeight: 'light',
      },
      action:{
        label: "X",
        onClick: () => {

        },
      },
      actionButtonStyle: {
        background: '#2A2A3D',
        color: 'white',
        fontWeight: 'light',
        borderRadius: 'full',
        width: '5px',
        padding: '0px',
        margin: '0px',
        height: '20px',
      },

    });


    //call backend
    if(todo.id){
    try{    

        const payload: any = {
            title: todo.title,
            description: todo.description,
            completeAt: newDateTime,
            category: todo.category,
            priority: todo.priority ?? null,
            isRecurring: todo.isRecurring || false,
            isAllDay: todo.isAllDay || false,
        };
        
        // Only include recurrence fields if the todo is recurring
        if (todo.isRecurring) {
            payload.recurrencePattern = todo.recurrencePattern;
            payload.recurrenceInterval = todo.recurrenceInterval;
            if (todo.recurrenceEndDate) {
                payload.recurrenceEndDate = todo.recurrenceEndDate;
            }
        }
        await api.put(`/v1/todo/${todo.id}`, payload);
        }catch(error){
            console.error("Error updating todo", error);
            onUpdateTodo(todo);
        }
    }
  }

  return (
    <div className="flex-col space-y-6 ">
      {/* Header */}
      <div className="flex justify-between items-center">
        {viewType === "board" && (
          <>
        <div className="flex items-center gap-4">
          <h1 className="text-white text-3xl md:text-4xl font-bold hidden sm:block">Upcoming</h1>
          <div className="relative" ref={pickerRef}>
            <div
              className="flex items-center gap-2 text-[#A2A2A9] cursor-pointer hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 select-none"
              onClick={handleShowMonthYearPicker}
            >
              <span className="text-lg">{getCurrentMonthYear()}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showMonthYearPicker ? "rotate-180" : ""}`}
              />
            </div>

            {/* Month/Year Picker Dropdown */}
            {showMonthYearPicker && (
              <div className="absolute top-full left-0 mt-2 bg-[#101018]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-9999 min-w-[280px] max-w-[90vw] sm:min-w-[320px] select-none">
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
                            className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center cursor-pointer select-none ${
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
                            className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all text-left cursor-pointer select-none ${
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
        </>
        )}
        <div className="flex items-center gap-1 sm:gap-2">
          {viewType === "board" && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Conditional Rendering: Board View or Calendar View */}
      {viewType === "board" ? (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Calendar Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ">
        {/* Overdue Section */}
        {(() => {
          const overDueTasks = getOverDueTasks();
          if (overDueTasks.length > 0) {
            const overdueDate = new Date();
            overdueDate.setDate(overdueDate.getDate() - 1); // Use yesterday's date as placeholder
            const overdueDateKey = "overdue";
            const isFormOpen = openFormDate === overdueDateKey;
            return (
              <DroppableDateColumn
                columnIndex={-1}
                key={overdueDateKey}
                date={overdueDate}
                dayTasks={overDueTasks}
                isToday={false}
                isOverdue={true}
                onAddTask={handleAddTask}
                isFormOpen={isFormOpen}
                onOpenForm={() => setOpenFormDate(overdueDateKey)}
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
                todos={todos}
              >
                {overDueTasks.map((todo, taskIndex) => (
                  <DraggableTask
                    key={todo.id || `temp-overdue-${todo.title}`}
                    todo={todo}
                    columnIndex={-1}
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
                    todos={todos}
                  />
                ))}
              </DroppableDateColumn>
            );
          }
          return null;
        })()}
        
        {/* Regular Date Columns */}
        {dateRange.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const dateKey = date.toISOString();
          const isFormOpen = openFormDate === dateKey;
          return (
            <DroppableDateColumn
              columnIndex={index}
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
              todos={todos}
            >
                {dayTasks.map((todo, taskIndex) => (
                  <DraggableTask
                    key={todo.id || `temp-${index}-${todo.title}`}
                    todo={todo}
                    columnIndex={index}
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
                      todos={todos}
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
        </DndContext>
      ) : (
        <CalendarView
          todos={todos}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdateTodo={onUpdateTodo}
          onAddTask={onAddTask}
          onViewDetails={onViewDetails}
          onTaskCreated={onTaskCreated}
          onDuplicateTask={onDuplicateTask}
          onTaskUpdated={onTaskUpdated}
        />
      )}

    <WarningModal
      isOpen={isWarningModalOpen}
      onClose={handleDeleteCancel}
      onDelete={handleDeleteConfirm}
      title="Delete Task"
      description="Are you sure you want to delete this task?"
      buttonText="Delete"
    />
    </div>
  );
};

export default UpcomingView;

