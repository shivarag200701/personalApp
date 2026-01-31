import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Sun, Sofa, ArrowRight, CircleX,Clock, Repeat, X} from "lucide-react";
import { parseNaturalLanguageDate , type ParsedDateResult} from "../utils/nlpDateParser";
import { RefreshCw} from 'lucide-react';
import { createPortal } from "react-dom";
import TimePicker from "./TimePicker";
import type { Todo } from "./Modal";
import type { RecurrencePattern } from "@shiva200701/todotypes";
import ReccurencePicker from "./ReccurencePicker";
interface CustomDatePickerProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateSelect: (date: string,isQuickAction?:boolean) => void;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | HTMLDivElement | null>;
  index?: number;
  onRecurringSelect?: (config: {
    isRecurring: boolean;
    recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurrenceInterval?: number;
    recurrenceEndDate?: string | null;
  }) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  noTimeSelect?: () => void
  todos: Todo[];
  todo?: Todo;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly" | null;
  columnIndex?: number;
  onSave?: ()=>void;
  setIsAllDay: (isAllDay:boolean) => void
  setIsRecurring: (isRecurring:boolean) => void
  setRecurrencePattern?: (pattern: "daily" | "weekly" | "monthly" | "yearly" | null) => void
}

interface TimeOption {
  value: string;
  label: string;
}
const CustomDatePicker = ({ selectedDate, onDateSelect, onClose, buttonRef, index, onRecurringSelect, selectedTime, onTimeSelect, todos, todo, isAllDay, columnIndex, onSave, setIsAllDay, noTimeSelect, isRecurring, recurrencePattern, setIsRecurring, setRecurrencePattern }: CustomDatePickerProps) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [showReccurencePicker, setShowReccurencePicker] = useState(false);
  const timeButtonRef = useRef<HTMLButtonElement | null>(null);
  const reccurenceButtonRef = useRef<HTMLButtonElement | null>(null);
  const [prevDisabled,setPrevDisabled] = useState(false);

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const today = new Date()
  const date = new Date(selectedDate)
  const Day = date.toLocaleDateString('en-US', { weekday: 'long' });
  const DayOrdinal = getOrdinal(date.getDate());
  const Month = date.toLocaleDateString('en-US', { month: 'short' });
  
  const recurrencePatternMap = {"daily":"Every Day",
                                "weekly":`every ${Day}`,
                                "monthly":`Every ${DayOrdinal}`,
                                "yearly":`Every ${DayOrdinal} ${Month}`}
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });
  const getInitialPosition = () => {
    if (buttonRef?.current && index!=null) {
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
    }else if (buttonRef?.current){
      const rect = buttonRef.current.getBoundingClientRect();
      return {
        left:rect.left,
        top:rect.bottom
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
    if (buttonRef?.current && index != null) {
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
              left: rect.left,
              top: 50,
            });
          }
        }
      }
  }else if (buttonRef?.current){
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      left:rect.left,
      top:rect.bottom
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
          handleRecurringSelect({
            isRecurring: true,
            recurrencePattern: parsedResult.recurrencePattern,
            recurrenceInterval: parsedResult.recurrenceInterval,
            recurrenceEndDate: parsedResult.recurrenceEndDate
          });
        } else if (onRecurringSelect) {
          // Clear recurring if not recurring
          handleRecurringSelect({
            isRecurring: false
          });
        }
      }
      onClose();
  }

  function handleRecurringSelect (config: {
    isRecurring: boolean;
    recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurrenceInterval?: number;
    recurrenceEndDate?: string | null}){

      setIsRecurring(config.isRecurring)
      if (setRecurrencePattern) {
        setRecurrencePattern(config.recurrencePattern ?? null)
      }
      if(onRecurringSelect){
        onRecurringSelect(config)
      }

    }



  // Update current month when parsed date changes
  useEffect(() => {
    if (parsedResult?.date) {
      const [year, month] = parsedResult.date.split('-').map(Number);
      setCurrentMonth(new Date(year, month - 1, 1));
    }
  }, [parsedResult]);

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
  const calculateHalfDone = ():boolean =>{
    return currentMonth.getMonth() == getTodayMonth() && todayDate() >= 18
  }

  const getDaysInMonth = (date: Date,nextMonth: boolean) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const eighteenthDay = new Date(year,month,18)
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const halfDone = calculateHalfDone()

    const days = [];
    // Add empty cells for days before the first day of the month
    if(!halfDone || nextMonth){
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
  }else{
    for (let i = 0; i < eighteenthDay.getDay(); i++) {
      days.push(null);
    }
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
    let selectedDateStr: string;
    if (selectedDate.includes("T")) {
      const selectedDateObj = new Date(selectedDate);
      selectedDateStr = dateToInput(selectedDateObj);
    } else {
      selectedDateStr = selectedDate;
    }
  
    return dateStr === selectedDateStr;
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getTime() === today.getTime();
  };

  const todayDate = (): number =>{
    return today.getDate()
  }

  const getTodayMonth = (): number =>{
    return today.getMonth()
  }

  const isPastDate = (date: Date | null): boolean => {
    if (!date) return false;
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (!isPastDate(date)) {
      onDateSelect(dateToInput(date),false);
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

  const days = getDaysInMonth(currentMonth,false);
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Get next month for display
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthDays = getDaysInMonth(nextMonth,true);
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
  useEffect(()=>{
    const today = new Date()
    if (currentMonth < today){
      setPrevDisabled(true)
    }else{
      setPrevDisabled(false)
    }
  },[currentMonth])

  
  
  const convert24hrTo12hr = (time: string|null): string => {
    if(!time) return ""
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
        className="fixed inset-0 z-60"
        onClick={()=>{
          onClose();
        }}
      />
      {/* Date Picker */}
      <div
        ref={pickerRef}
        className="fixed bg-task border border-border rounded-md shadow-2xl z-70 w-[250px] transition-opacity duration-150 max-h-[600px] overflow-hidden"
        style={{
          ...position,
          transform: `${columnIndex && columnIndex >= 3 ? "translateX(-100%)" : ""}`,
        }}
      >
      {/* NLP Input Section */}
      <div className="border-b border-border">
        <div className={`${parsedResult?.confidence === "high" ? "border-b border-border" : ""}`}>
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
          placeholder="Type a date"
          className="w-full text-base sm:text-lg text-foreground placeholder:text-secondary focus:outline-none focus:border-ring bg-transparent h-10 px-3 "
        />
        </div>
        {parsedResult?.confidence === "high" && (
          <div className="mt-3 text-xs flex items-center gap-3 px-3">
              <div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={handleApplyDate}>
              {parsedResult.isRecurring && <RefreshCw className="w-4 h-4 text-muted-foreground" />}
              {!parsedResult.isRecurring && <Calendar className="w-4 h-4 text-muted-foreground" />}
              <div className="text-white text-[13px] flex items-center gap-1">
                {parsedResult.displayText}
                {parsedResult.isRecurring && (
                  <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-white" /> Forever</span>
                )}
              </div>
              </div>
            <div className="text-muted-foreground mt-3 text-[10px] pb-2">
            You can also type in recurring dates like <span className="text-gray-300">every day, every 2 weeks, and every month.</span> 
            </div>
            </div>
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
                  if(!isAllDay){
                  }
                  onDateSelect(dateToInput(option.date),true);
                  
                } else {
                  onDateSelect("");
                }

                setNlpInput("");
                setParsedResult(null);
                onClose()
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
      <div className={`p-4 overflow-y-auto  ${parsedResult?.confidence === "high" ? "max-h-[160px]" : "max-h-[250px]" }`}>
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
        <span className="text-white font-semibold">{monthLabel}</span>
        <div className="flex">
          <button
            onClick={() => navigateMonth('prev')}
            className={`p-1 hover:bg-secondary  rounded transition-colors cursor-pointer ${prevDisabled && "opacity-5"}`}
            disabled={prevDisabled}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="w-6 h-6 rounded hover:bg-secondary  transition-colors flex items-center justify-center cursor-pointer"
            >
              <div className="w-2 h-2 rounded bg-transparent border border-white"></div>
            </button>
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-secondary rounded transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
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
            const today = todayDate()
            
            if(today >= 18 && date.getDate() >= 18 || currentMonth.getMonth() != getTodayMonth() )
            {
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
          }
          }
          )}
        </div>

        {/* Next Month Preview */}
        <div className="mt-6">
          <div className="text-xs text-[#6B6B75] mb-2">{nextMonthLabel}</div>
          <div className="grid grid-cols-7 gap-1">
            {nextMonthDays.slice(0, 14).map((date, idx) => {
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
        <button ref={timeButtonRef} className="w-full p-1.5 border border-border flex items-center justify-center text-center gap-2 rounded-sm cursor-pointer group [&:not(:has(.clear-icon:hover))]:hover:bg-secondary transition-colors duration-300 relative" onClick={() => {setShowTimePicker(true)}}>
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            {!isAllDay ? (<div className="text-foreground font-medium">{convert24hrTo12hr(selectedTime)}</div>) : (<div className="text-white">Time</div>)}
            {!isAllDay && (
              <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent opening the time picker
                setIsAllDay(true); // Remove the time by setting isAllDay to true
                if(noTimeSelect){
                noTimeSelect()
                }
              }}
              >
              <X className="absolute clear-icon cursor-pointer right-0.5 top-1/2 -translate-y-1/2 hover:bg-secondary p-1 h-5.5 w-5.5 rounded-sm " size={13}/>
              </button>
            )}
            </button>
        </div>
        <div className="w-full p-2.5 text-muted-foreground text-xs flex items-center justify-center text-center gap-2">
          <button ref={reccurenceButtonRef} className="w-full p-1.5 border border-border flex items-center justify-center text-center gap-2 rounded-sm cursor-pointer group [&:not(:has(.recurring-clear-icon:hover))]:hover:bg-secondary  transition-colors duration-300 relative" onClick={() => {setShowReccurencePicker(true)}}>
            <div className="flex items-center justify-center gap-2">
            <Repeat className="w-3.5 h-3.5 text-muted-foreground " />
            {isRecurring && recurrencePattern && (<span className="font-bold text-foreground">{recurrencePatternMap[recurrencePattern]}</span>)}
            </div>
            {!isRecurring && (<div>Repeat</div>)}
            {isRecurring && (
              <button onClick={(e)=>{
                e.stopPropagation()
                setIsRecurring(false)
                if (setRecurrencePattern) {
                  setRecurrencePattern(null)
                }
              }}>
                <X className="recurring-clear-icon absolute cursor-pointer right-0.5 top-1/2 -translate-y-1/2 hover:bg-secondary p-1 h-5.5 w-5.5 rounded-sm " size={13}/>
              </button>
            )}
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
        isTimeSelected={!isAllDay}
        onSave={onSave}
      />
    )}
    {showReccurencePicker && (
      <ReccurencePicker
        onClose={() => setShowReccurencePicker(false)}
        buttonRef={reccurenceButtonRef}
        onDateSelect={onDateSelect}
        onRecurringSelect={handleRecurringSelect}
        selectedDate={selectedDate}
      />
    )}
    </>,
    document.body
  );
};

export default CustomDatePicker;

