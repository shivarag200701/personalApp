import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Sun, Sofa, ArrowRight, CircleX, Sparkles, Clock, Repeat} from "lucide-react";
import { parseNaturalLanguageDate , type ParsedDateResult} from "../utils/nlpDateParser";
import { RefreshCw} from 'lucide-react';
import { createPortal } from "react-dom";
import TimePicker from "./TimePicker";
import type { Todo } from "./Modal";
import type { RecurrencePattern } from "@shiva200701/todotypes";
import ReccurencePicker from "./ReccurencePicker";
interface CustomDatePickerProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateSelect: (date: string) => void;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  index: number;
  onRecurringSelect?: (config: {
    isRecurring: boolean;
    recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurrenceInterval?: number;
    recurrenceEndDate?: string | null;
  }) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  setIsAllDay: (isAllDay: boolean) => void;
  todos: Todo[];
  todo?: Todo;
  isAllDay: boolean;
  columnIndex?: number;
}

interface TimeOption {
  value: string;
  label: string;
}
const CustomDatePicker = ({ selectedDate, onDateSelect, onClose, buttonRef, index, onRecurringSelect, selectedTime, onTimeSelect, setIsAllDay, todos, todo, isAllDay, columnIndex }: CustomDatePickerProps) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [showReccurencePicker, setShowReccurencePicker] = useState(false);
  const timeButtonRef = useRef<HTMLButtonElement | null>(null);
  const reccurenceButtonRef = useRef<HTMLButtonElement | null>(null);
  
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });
  const getInitialPosition = () => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        return {
          left: rect.left,
          top: rect.bottom,
        };
      } else {
        if (index <= 2){
          if (columnIndex && columnIndex >= 3){
            return {
              left: rect.left,
              top: 100 , 
            };
          } else {
            return {
              left: rect.right,
              top: 100,
            };
          }
        } else{
          if (columnIndex && columnIndex >= 3){
            return {
              left: rect.left,
              top: 50 , 
            };
          } else {
            return {
              left: rect.right,
              top: 50,
            };
          }
        }
      }
    }
    return { left: 0, top: 0 };
  }
  // Calculate initial position synchronously to avoid flash
  const [position, setPosition] = useState(getInitialPosition);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const [nlpInput, setNlpInput] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedDateResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updatePosition = () => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        
        setPosition({
          left: rect.left,
          top: rect.bottom,
        });
      } else {
        if (index <= 2){
          if (columnIndex && columnIndex >= 3){
            setPosition({
                  left: rect.left,
                  top: 100 , 
                });
          } else {
            setPosition({
              left: rect.right,
              top: 100,
            });
          }
        } else{
          if (columnIndex && columnIndex >= 3){
            setPosition({
                  left: rect.left,
                  top: 50 , 
                });
          } else {
            setPosition({
              left: rect.right,
              top: 50,
            });
          }
        }
      }
    }
    };
    updatePosition();
  }, [buttonRef, index, pickerRef,selectedDate]);


  useEffect(() => {
    if (inputRef.current && buttonRef?.current) {
      inputRef.current.focus();
    }
  }, [buttonRef]);

  // Debounced NLP parsing
  useEffect(() => {
    if (!nlpInput.trim()) {
      setParsedResult(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      const result = parseNaturalLanguageDate(nlpInput);
      setParsedResult(result);
      
      // Auto-apply if high confidence
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nlpInput, onDateSelect, onRecurringSelect]);

  function handleApplyDate(){
    if (parsedResult?.confidence === "high" && parsedResult?.date) {
        onDateSelect(parsedResult.date);
        
        // If recurring, notify parent
        if (parsedResult.isRecurring && onRecurringSelect) {
          onRecurringSelect({
            isRecurring: true,
            recurrencePattern: parsedResult.recurrencePattern,
            recurrenceInterval: parsedResult.recurrenceInterval,
            recurrenceEndDate: parsedResult.recurrenceEndDate
          });
        } else if (onRecurringSelect) {
          // Clear recurring if not recurring
          onRecurringSelect({
            isRecurring: false
          });
        }
      }
      onClose();
  }



  // Update current month when parsed date changes
  useEffect(() => {
    if (parsedResult?.date) {
      const [year, month] = parsedResult.date.split('-').map(Number);
      setCurrentMonth(new Date(year, month - 1, 1));
    }
  }, [parsedResult]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const getLaterThisWeek = () => {
    const date = new Date(today);
    const dayOfWeek = date.getDay();
    const daysUntilWednesday = (3 - dayOfWeek + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilWednesday);
    return date;
  };

  const getThisWeekend = () => {
    const date = new Date(today);
    const dayOfWeek = date.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilSaturday);
    return date;
  };

  const getNextWeek = () => {
    const date = new Date(today);
    const dayOfWeek = date.getDay();
    const daysUntilNextMonday = (8 - dayOfWeek) % 7 || 7;
    date.setDate(date.getDate() + daysUntilNextMonday);
    return date;
  };

  const calculateNextOccurence = (
    pattern: RecurrencePattern,
    interval: number,
    lastOccurence: Date
): Date => {
    const next = new Date(lastOccurence);
    next.setHours(0, 0, 0, 0);
    switch (pattern){
        case "daily":
            next.setDate(next.getDate() + interval);
            break;
        case "weekly":
            next.setDate(next.getDate() + interval * 7);
            break;
        case "monthly":
            next.setMonth(next.getMonth() + interval);
            break;
        case "yearly":
            next.setFullYear(next.getFullYear() + interval);
            break;
        default:
            throw new Error(`Invalid recurrence pattern: ${pattern}`);
    }
    return next;
}

  const dateToInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const dateToLocaleDate = (date: Date): string => {
    const localeDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formattedDate = localeDate.replace(",", "").trim();
    return formattedDate;
  };

  const formatDateLabel = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const timeStringToTimeOption = (timeString: string): TimeOption => {
    const [hours, minutes] = timeString.split(":")
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    const label = `${hour12}:${minutes} ${ampm}`;

    return {value: timeString, label: label};
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  

  const recurringOccurenceDates = useMemo(() => {
    
    const occurenceSet = new Set<string>();


    if (!todo?.recurrencePattern || !todo?.recurrenceInterval || !todo?.completeAt) return occurenceSet;

    const startDate = new Date(todo.completeAt);
    startDate.setHours(0, 0, 0, 0);

    const endDate = todo.recurrenceEndDate ? new Date(todo.recurrenceEndDate) : null;

    const calenderStart = new Date(currentMonth);
    calenderStart.setDate(1);
    calenderStart.setHours(0, 0, 0, 0);

    const calenderEnd = new Date(currentMonth);
    calenderEnd.setMonth(calenderEnd.getMonth() + 2);
    calenderEnd.setDate(0);

    let currentOccurence = new Date(startDate);

    const maxIterations = 1000;
    let iteration = 0;

    while (iteration < maxIterations) {
      if (currentOccurence > calenderEnd) break;
      if (endDate && currentOccurence > endDate) break;

      if (currentOccurence >= today && currentOccurence >= calenderStart) {
        occurenceSet.add(dateToInput(currentOccurence));
      }

      currentOccurence = calculateNextOccurence(todo.recurrencePattern, todo.recurrenceInterval, currentOccurence);
      iteration++;
    }

    return occurenceSet
  },[todo?.recurrencePattern, todo?.recurrenceInterval, todo?.completeAt, todo?.recurrenceEndDate, currentMonth, today]);

  const isRecurringOccurence = (date: Date): boolean => {
    if (!date) return false;
    return recurringOccurenceDates.has(dateToInput(date));
  }

  const isSelectedDate = (date: Date | null): boolean => {
    if (!date) return false;
    if (!selectedDate) return false;
    const dateStr = dateToInput(date);
    return dateStr === selectedDate.split("T")[0];
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getTime() === today.getTime();
  };

  const isPastDate = (date: Date | null): boolean => {
    if (!date) return false;
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (!isPastDate(date)) {
      onDateSelect(dateToInput(date));
      // Clear recurring when manually selecting date
      if (onRecurringSelect) {
        onRecurringSelect({
          isRecurring: false
        });
      }
      // Clear NLP input
      setNlpInput("");
      setParsedResult(null);
    }
  };

  const quickOptions = [
    {
      label: "Tomorrow",
      icon: Sun,
      date: tomorrow,
      subtitle: formatDayName(tomorrow),
    },
    {
      label: "Later this week",
      icon: Calendar,
      date: getLaterThisWeek(),
      subtitle: formatDayName(getLaterThisWeek()),
    },
    {
      label: "This weekend",
      icon: Sofa,
      date: getThisWeekend(),
      subtitle: formatDayName(getThisWeekend()),
    },
    {
      label: "Next week",
      icon: ArrowRight,
      date: getNextWeek(),
      subtitle: formatDateLabel(getNextWeek()),
    },
    {
      label: "No Date",
      icon: CircleX,
      date: null,
      subtitle: "",
    },
  ];

  const days = getDaysInMonth(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Get next month for display
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthDays = getDaysInMonth(nextMonth);
  const nextMonthLabel = nextMonth.toLocaleDateString('en-US', { month: 'short' });

  const getTaskCountForDate = useMemo(() => {
    
    //hashmap for date to task
    const dateCountMap = new Map<string, number>();

    todos.forEach((todo) =>{
      if(!todo.completed && todo.completeAt){
        const date = todo.completeAt.split("T")[0];
        dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1);
      }
    })

    return (date: string):number => {
      return dateCountMap.get(date) || 0;
    }
  },[todos])

  
  
  const convert24hrTo12hr = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12.toString()}:${minutes.toString()} ${ampm}`;
  }
 
  
  
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={()=>{
          onClose();
        }}
      />
      {/* Date Picker */}
      <div
        ref={pickerRef}
        className="fixed bg-card border border-border rounded-md shadow-2xl z-50 w-[250px] transition-opacity duration-150"
        style={{
          ...position,
          transform: `${columnIndex && columnIndex >= 3 ? "translateX(-100%)" : ""}`,
        }}
      >
      {/* NLP Input Section */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-gray-500" />
          <span className="text-gray-500 text-xs font-medium">Type a date</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={nlpInput}
          onChange={(e) => setNlpInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleApplyDate();
            }
          }}
          placeholder="e.g., tomorrow, every Monday, in 5 days"
          className="w-full bg-input border border-border rounded-md px-2 py-1.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
        />
        {parsedResult && (
          <div className="mt-3 text-xs flex items-center gap-3">
            {parsedResult.confidence === "high" && (
              <div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={handleApplyDate}>
              {parsedResult.isRecurring && <RefreshCw className="w-4 h-4 text-muted-foreground" />}
              {!parsedResult.isRecurring && <Calendar className="w-4 h-4 text-muted-foreground" />}
              <div className="text-white flex items-center gap-1">
                {parsedResult.displayText}
                {parsedResult.isRecurring && (
                  <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-white" /> Forever</span>
                )}
              </div>
              </div>
            <div className="text-muted-foreground mt-3 text-xs">
            You can also type in recurring dates like <span className="text-gray-300">every day, every 2 weeks, and every month.</span> 
            </div>
            </div>
            )}
          </div>
        )}
      </div>


      {/* Quick Options */}
      <div className="p-2 border-b border-border space-y-1">
        {quickOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.date && isSelectedDate(option.date);
          const isNoDate = option.label === "No Date" && !selectedDate;

          return (
            <button
              key={option.label}
              onClick={() => {
                if (option.date) {
                  onDateSelect(dateToInput(option.date));
                } else {
                  onDateSelect("");
                }
                // Clear recurring when selecting quick option
                if (onRecurringSelect) {
                  onRecurringSelect({
                    isRecurring: false
                  });
                }
                setNlpInput("");
                setParsedResult(null);
              }}
              className={`w-full flex items-center gap-3 p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer ${
                (isSelected || isNoDate) ? "bg-muted" : ""
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected || isNoDate ? "text-white" : "text-muted-foreground"}`} />
              <div className="flex-1 text-left">
                <div className={`text-sm ${isSelected || isNoDate ? "text-white" : "text-muted-foreground"}`}>
                  {option.label}
                </div>
              </div>
              {option.subtitle && (
                  <div className="text-xs text-[#6B6B75]">{option.subtitle}</div>
                )}
            </button>
          );
        })}
      </div>

      {/* Calendar */}
      <div className="p-4">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{monthLabel}</span>
            <button
              onClick={goToToday}
              className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </button>
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Days of Week */}
        { !hoverDate ? (<div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-xs text-[#6B6B75] py-1">
              {day}
            </div>
          ))}
        </div>):(
          <div className="flex items-center justify-center gap-1">
            <div className=" font-light text-center text-[10px] text-[#6B6B75] py-2">
              {dateToLocaleDate(hoverDate)}
            </div>
            <div className="w-[2px] h-[2px] bg-white font-light rounded-full"/>
            <div className="text-center text-[10px] text-white font-light py-2">
              {getTaskCountForDate(hoverDate?.toLocaleDateString("en-CA").split("T")[0])}
            </div>
            <div className="text-center text-[10px] text-white font-light py-2">
              {getTaskCountForDate(hoverDate?.toISOString().split("T")[0]) == 0 ? "tasks" : getTaskCountForDate(hoverDate?.toISOString().split("T")[0]) > 1 ? "tasks" : "task"}
              </div>
          </div>

      )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="aspect-square p-1"></div>;
            }
            const isSelected = isSelectedDate(date);
            const isTodayDate = isToday(date);
            const isPast = isPastDate(date);
            const isParsedDate = parsedResult?.date === dateToInput(date);
            const isRecurringDate = isRecurringOccurence(date);
            
            return (
              <button
                onMouseEnter={() => {setHoverDate(date);}}
                onMouseLeave={() => {setHoverDate(null);}}
                key={date.getTime()}
                onClick={() => handleDateClick(date)}
                disabled={isPast}
                className={`w-full h-full aspect-square rounded-full text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-red-500 text-white font-semibold"
                    : isParsedDate
                    ? "bg-blue-500/50 text-white"
                    : isTodayDate
                    ? "bg-muted text-foreground"
                    : isPast
                    ? "text-[#4A4A4A] cursor-not-allowed"
                    : isRecurringDate
                    ? "border border-dashed border-white/50 text-white "
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
                    `}
              >
                <div className="flex flex-col items-center">
                {date.getDate()}
                {getTaskCountForDate(dateToInput(date)) > 0 && <div className="h-[3px] w-[3px] bg-white rounded-full"/>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Month Preview */}
        <div className="mt-6">
          <div className="text-xs text-[#6B6B75] mb-2">{nextMonthLabel}</div>
          <div className="grid grid-cols-7 gap-1">
            {nextMonthDays.slice(0, 7).map((date, idx) => {
              if (!date) {
                return <div key={`empty-next-${idx}`} className="aspect-square"></div>;
              }

              const isSelected = isSelectedDate(date);
              const isPast = isPastDate(date);
              const isParsedDate = parsedResult?.date === dateToInput(date);

              return (
                <button
                  key={date.getTime()}
                  onClick={() => handleDateClick(date)}
                  disabled={isPast}
                  className={`aspect-square rounded-lg text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-red-500 text-white font-semibold"
                      : isParsedDate
                      ? "bg-blue-500/50 text-white"
                      : isPast
                      ? "text-[#4A4A4A] cursor-not-allowed"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex-col items-center justify-between">
      <div className="border-t border-border p-2.5 text-xs text-muted-foreground flex items-center justify-center text-center gap-2">
        <button ref={timeButtonRef} className="w-full p-1.5 border border-border flex items-center justify-center text-center gap-2 rounded-sm cursor-pointer hover:bg-muted transition-colors duration-300" onClick={() => {setShowTimePicker(true)}}>
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            {!isAllDay ? (<div className="text-white">{convert24hrTo12hr(selectedTime)}</div>) : (<div className="text-white">Time</div>)}
            </button>
        </div>
        <div className="w-full p-2.5 text-muted-foreground text-xs flex items-center justify-center text-center gap-2">
          <button ref={reccurenceButtonRef} className="w-full p-1.5 border border-border flex items-center justify-center text-center gap-2 rounded-sm cursor-pointer hover:bg-muted transition-colors duration-300" onClick={() => {setShowReccurencePicker(true)}}>
            <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
            <div>Repeat</div>
            </button>
        </div>
        </div>
    </div>
    {showTimePicker && (
      <TimePicker
        onClose={() => setShowTimePicker(false)}
        buttonRef={timeButtonRef}
        selectedTime={timeStringToTimeOption(selectedTime)}
        onTimeSelect={(time: string) => {
          onTimeSelect(time);
        }}
        setIsAllDay={setIsAllDay}
      />
    )}
    {showReccurencePicker && (
      <ReccurencePicker
        onClose={() => setShowReccurencePicker(false)}
        buttonRef={reccurenceButtonRef}
        onDateSelect={onDateSelect}
        onRecurringSelect={onRecurringSelect}

      />
    )}
    </>,
    document.body
  );
};

export default CustomDatePicker;

