import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import type { Todo } from "./Modal";
import { isTaskOnDate } from "@shiva200701/todotypes";
import AddTaskCalender from "./AddTaskCalender";

interface CalendarViewProps {
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

const CalendarView = ({
  todos,
  onViewDetails,
  onTaskCreated,
  onTaskUpdated,
}: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [openFormDate, setOpenFormDate] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [isViewingMoreTasks, setIsViewingMoreTasks] = useState(false);
  const [viewMoreTasks, setViewMoreTasks] = useState<Todo[]>([]);
  const [viewMoreDate, setViewMoreDate] = useState<Date | null>(null);
  const [viewMorePosition, setViewMorePosition] = useState<{ top: number; left: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement|null>(null);
  // Get first day of the month and number of days
  const monthStart = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1);
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0);
  }, [currentDate]);

  // Get calendar days (including days from previous/next month to fill the grid)
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const startDate = new Date(monthStart);
    
    // Get the first day of the week (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = startDate.getDay();
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - (i + 1));
      days.push(date);
    }
    
    // Add all days of current month
    const daysInMonth = monthEnd.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(monthStart);
      date.setDate(i);
      days.push(date);
    }
    
    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, [monthStart, monthEnd]);

  const getTasksForDate = (date: Date): Todo[] => {
    return todos.filter(
      (todo) => !todo.completed && isTaskOnDate(todo.completeAt, date)
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isCurrentMonth = (date: Date): boolean => {
    return (
      date.getFullYear() === currentDate.getFullYear() &&
      date.getMonth() === currentDate.getMonth()
    );
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentDate(today);
  };

  const getCurrentMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleMonthYearSelect = (year: number, month: number) => {
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
    if (newDate >= today || month > currentMonth || year > currentYear) {
      setShowMonthYearPicker(false);
      setCurrentDate(newDate);
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

  // Generate months
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

  const isPastDate = (year: number, month: number): boolean => {
    const today = new Date();
    if (month === today.getMonth() && year === today.getFullYear()) {
      return false;
    }
    const date = new Date(year, month, 1);
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowMonthYearPicker(false);
      }
    };

    if (showMonthYearPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthYearPicker]);

  const viewMoreModalStyle = viewMorePosition
    ? {
        top: `${viewMorePosition.top}px`,
        left: `${viewMorePosition.left}px`,
        transform: "translate(-50%, -50%)",
      }
    : {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  return (
    <div className="flex-col space-y-6 relative overflow-auto"
    ref={calendarRef}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2 overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="absolute left-0" ref={pickerRef}>
            <div
              className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted font-bold"
              onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
            >
              <span className="text-lg">{getCurrentMonthYear()}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showMonthYearPicker ? "rotate-180" : ""}`}
              />
            </div>

            {/* Month/Year Picker Dropdown */}
            {showMonthYearPicker && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 min-w-[280px] max-w-[90vw] sm:min-w-[320px]">
                <div className="grid grid-cols-2 gap-6">
                  {/* Month Selector */}
                  <div>
                    <div className="text-white text-sm font-semibold mb-3 text-center">Month</div>
                    <div className="grid grid-cols-3 gap-2 overflow-hidden">
                      {getMonths(currentDate.getFullYear()).map((month) => {
                        const isSelected = currentDate.getMonth() === month.value;
                        const isDisabled = isPastDate(currentDate.getFullYear(), month.value);

                        return (
                          <button
                            key={month.value}
                            onClick={() => {
                              if (!isDisabled) {
                                handleMonthYearSelect(currentDate.getFullYear(), month.value);
                              }
                            }}
                            disabled={isDisabled}
                            className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 cursor-pointer"
                                : isDisabled
                                ? "text-[#4A4A4A] cursor-not-allowed opacity-40"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95"
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
                        const isSelected = currentDate.getFullYear() === year;
                        const isCurrentYear = year === new Date().getFullYear();

                        return (
                          <button
                            key={year}
                            onClick={() => {
                              const today = new Date();
                              const monthToUse = isCurrentYear
                                ? Math.max(currentDate.getMonth(), today.getMonth())
                                : currentDate.getMonth();
                              handleMonthYearSelect(year, monthToUse);
                            }}
                            className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all text-left cursor-pointer ${
                              isSelected
                                ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 font-semibold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
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
            className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 rounded-lg hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={navigateToToday}
            className="text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-4 py-2 rounded-lg hover:bg-muted text-sm font-medium cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={navigateNext}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 rounded-lg hover:bg-muted cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div 
      className="relative bg-card/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] ">
        {/* Backdrop - appears when form is open, covers the calendar */}
        {openFormDate && (
          <div
            className="absolute inset-0 bg-transparent  z-40 rounded-2xl"
            onClick={() => setOpenFormDate(null)}
          />
        )}
        {/* Week Day Headers */}
        <div className="flex w-full">
          {weekDays.map((day, dayIndex) => (
            <div
              key={day}
              className={`text-muted-foreground text-xs font-semibold text-center py-2 flex-1 ${
                dayIndex < 6 ? "border-r border-border" : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date);
            const dateKey = date.toISOString();
            const isFormOpen = openFormDate === dateKey;
            const rowIndex = Math.floor(index / 7);
            const colIndex = index % 7;
            const isLastRow = rowIndex === Math.floor((calendarDays.length - 1) / 7);

            return (
              <div  
                key={index}
                className={`max-h-[170px] min-h-[170px] transition-all relative z-10 ${colIndex < 6 ? "border-r border-border" : ""} ${
                  !isLastRow ? "border-b border-border" : ""
                }`}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenFormDate(dateKey);
                }}
                ref={(el) => {
                  if (el) {
                    dayRefs.current.set(dateKey, el);
                  }
                }}

              >
                {/* Date Number */}
                <div className="flex items-center justify-center">
                <div
                  className={`text-sm font-semibold mt-1 mb-2 text-center w-7 h-7  rounded-full flex items-center justify-center ${
                    isTodayDate
                      ? "bg-purple-500 text-white"
                      : isCurrentMonthDate
                      ? "text-white"
                      : "text-muted-foreground"
                  }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
                {/* Tasks */}
                <div className="mb-5 ">
                  {dayTasks.slice(0, 3).map((todo) => (
                    <div
                      key={todo.id || `todo-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(todo);
                      }}
                      className={`text-xs p-1 my-0.5 border border-purple-500/30 rounded-md cursor-pointer transition-opacity line-clamp-1 text-white ${todo.color ?? 'bg-purple-500'} hover:opacity-90`}
                      title={todo.title}
                    >
                      {todo.title}
                    </div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground my-0.5 px-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer p-1 w-full text-left "
                      onClick={(e) => {
                        e.stopPropagation();
                        const anchor = dayRefs.current.get(dateKey);
                        if (anchor) {
                          const rect = anchor.getBoundingClientRect();
                          setViewMorePosition({
                            top: rect.top + window.scrollY + rect.height / 2,
                            left: rect.left + window.scrollX + rect.width / 2,
                          });
                        } else {
                          setViewMorePosition(null);
                        }
                        setViewMoreTasks(dayTasks);
                        setViewMoreDate(date);
                        setIsViewingMoreTasks(true);
                      }}
                    >
                      {dayTasks.length - 3} more
                    </button>
                  )}
                </div>
                {/* Add Task Button */}
                {isCurrentMonthDate && (
                  <div>
                    {isFormOpen && (
                      <div 
                        className='z-50 bg-card '
                        style={{
                                  top: '0px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                          }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={`transition-all duration-3000 z-50 ${isFormOpen ? " translate-x-0" : "translate-x-full"}`}>
                        <AddTaskCalender
                          width="w-[500px]"
                          backgroundColor="bg-secondary"
                          index={dayTasks.length}
                          preselectedDate={date}
                          onCancel={() => setOpenFormDate(null)}
                          onSuccess={(todo) => {
                            if (onTaskCreated) {
                              onTaskCreated(todo);
                            }
                            setOpenFormDate(null);
                          }}
                          onUpdate={(todo) => {
                            if (onTaskUpdated) {
                              onTaskUpdated(todo);
                            }
                            setOpenFormDate(null);
                          }}
                        />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* View More Tasks Modal */}
      {isViewingMoreTasks && viewMoreDate && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-transparent  z-40"
            onClick={() => {
              setIsViewingMoreTasks(false);
              setViewMoreTasks([]);
              setViewMoreDate(null);
              setViewMorePosition(null);
            }}
          />

          {/* Anchored Modal */}
          <div
            className="fixed z-50 w-full max-w-xs"
            style={viewMoreModalStyle}
          >
            <div className="relative w-full rounded-[32px] bg-card shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-border p-4 ">
              {/* Close button */}
              <button
                type="button"
                className="absolute right-5 top-5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => {
                  setIsViewingMoreTasks(false);
                  setViewMoreTasks([]);
                  setViewMoreDate(null);
                  setViewMorePosition(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Day label */}
              <div className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-2 uppercase">
                {viewMoreDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
              </div>

              {/* Date number */}
              <div className="text-center text-5xl font-semibold text-white mb-5">
                {viewMoreDate.getDate()}
              </div>

              {/* Tasks list */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {viewMoreTasks.map((todo) => (
                  <button
                    key={todo.id}
                    type="button"
                    className="w-full rounded-xl bg-[#3B82F6] text-left px-4 py-2 text-sm text-black font-medium hover:bg-[#60A5FA] transition-colors cursor-pointer"
                    onClick={() => {
                      onViewDetails(todo);
                      setIsViewingMoreTasks(false);
                      setViewMoreTasks([]);
                      setViewMoreDate(null);
                      setViewMorePosition(null);
                    }}
                  >
                    {todo.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarView;

