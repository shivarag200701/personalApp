import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Sun, Sofa, ArrowRight, CircleX, Sparkles} from "lucide-react";
import { parseNaturalLanguageDate , type ParsedDateResult} from "../utils/nlpDateParser";
import { RefreshCw} from 'lucide-react';
import { createPortal } from "react-dom";

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
}

const CustomDatePicker = ({ selectedDate, onDateSelect, onClose, buttonRef, index, onRecurringSelect }: CustomDatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });
  
  // Calculate initial position synchronously to avoid flash
  const [position, setPosition] = useState(() => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        return {
          left: rect.left,
          top: rect.top,
        };
      } else {
        if (index <= 2) {
          return {
            left: rect.right + 100,
            top: rect.top,
          };
        }
        if (index >= 3) {
          // For index >= 3, we'll need pickerHeight which isn't available yet
          // So use a reasonable default and update in useEffect
          return {
            left: rect.left,
            top: rect.top - 400, // Default height, will be updated
          };
        }
      }
    }
    return { left: 0, top: 0 };
  });
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const [nlpInput, setNlpInput] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedDateResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track if position has been calculated (starts false, set to true after first calculation)
  const [isPositioned, setIsPositioned] = useState(false);

  // Calculate position based on button
  useEffect(() => {
      if (buttonRef?.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const pickerHeight = pickerRef.current?.offsetHeight || 400;
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          setPosition({
            left: rect.left,
            top: rect.bottom,
          });
        } else {
            if (index <= 2){
                setPosition({
                    left: rect.right,
                    top: 50,
                })
            }
            if (index >= 3){
                setPosition({
                    left: rect.right,
                    top: rect.top - pickerHeight/1.5,
                })
            }
        }
        setIsPositioned(true);
        
    }
  }, [buttonRef, index]);

  useEffect(() => {
    if (inputRef.current && buttonRef?.current) {
      inputRef.current.focus();
    }
  }, [buttonRef]);
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, buttonRef]);

  // Debounced NLP parsing
  useEffect(() => {
    if (!nlpInput.trim()) {
      setParsedResult(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      const result = parseNaturalLanguageDate(nlpInput);
      console.log(result);
      setParsedResult(result);
      
      // Auto-apply if high confidence
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [nlpInput, onDateSelect, onRecurringSelect]);

  function handleApplyDate(){
    console.log("parsedResult", parsedResult);
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

  const dateToInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateLabel = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

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

  const isSelectedDate = (date: Date | null): boolean => {
    if (!date) return false;
    if (!selectedDate) return false;
    const dateStr = dateToInput(date);
    return dateStr === selectedDate;
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
  
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Date Picker */}
      <div
        ref={pickerRef}
        className="fixed bg-[#1B1B1E] border border-gray-800 rounded-md shadow-2xl z-50 w-[250px] transition-opacity duration-150"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          opacity: isPositioned || (position.left !== 0 && position.top !== 0) ? 1 : 0,
          pointerEvents: isPositioned || (position.left !== 0 && position.top !== 0) ? 'auto' : 'none',
        }}
      >
      {/* NLP Input Section */}
      <div className="p-3 border-b border-gray-800">
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
          className="w-full bg-[#141415] border border-gray-700 rounded-md px-2 py-1.5 text-base sm:text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-600"
        />
        {parsedResult && (
          <div className="mt-3 text-xs flex items-center gap-3">
            {parsedResult.confidence === "high" && (
              <div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={handleApplyDate}>
              {parsedResult.isRecurring && <RefreshCw className="w-4 h-4 text-gray-400" />}
              {!parsedResult.isRecurring && <Calendar className="w-4 h-4 text-gray-400" />}
              <div className="text-white flex items-center gap-1">
                {parsedResult.displayText}
                {parsedResult.isRecurring && (
                  <span className="flex items-center gap-1"><ArrowRight className="w-4 h-4 text-white" /> Forever</span>
                )}
              </div>
              </div>
            <div className="text-gray-400 mt-3 text-xs">
            You can also type in recurring dates like <span className="text-gray-300">every day, every 2 weeks, and every month.</span> 
            </div>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Current Selected Date Header */}
      {selectedDate && !nlpInput && (
        <div className="p-3 border-b border-gray-800 text-gray-500 text-sm">
          <div>Selected: {selectedDate}</div>
        </div>
      )}

      {/* Quick Options */}
      <div className="p-2 border-b border-gray-800 space-y-1">
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
              className={`w-full flex items-center gap-3 p-1 rounded-lg hover:bg-[#27272B] transition-colors cursor-pointer ${
                (isSelected || isNoDate) ? "bg-[#27272B]" : ""
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected || isNoDate ? "text-white" : "text-[#A2A2A9]"}`} />
              <div className="flex-1 text-left">
                <div className={`text-sm ${isSelected || isNoDate ? "text-white" : "text-[#A2A2A9]"}`}>
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
            className="p-1 hover:bg-[#27272B] rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{monthLabel}</span>
            <button
              onClick={goToToday}
              className="w-6 h-6 rounded-full hover:bg-[#27272B] transition-colors flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </button>
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-[#27272B] rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-xs text-[#6B6B75] py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const isSelected = isSelectedDate(date);
            const isTodayDate = isToday(date);
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
                    : isTodayDate
                    ? "bg-[#27272B] text-white"
                    : isPast
                    ? "text-[#4A4A4A] cursor-not-allowed"
                    : "text-[#A2A2A9] hover:bg-[#27272B] hover:text-white"
                }`}
              >
                {date.getDate()}
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
                      : "text-[#A2A2A9] hover:bg-[#27272B] hover:text-white"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 p-2 text-xs text-[#6B6B75]">
            Repet
        </div>
    </div>
    </>,
    document.body
  );
};

export default CustomDatePicker;

