import { useState, useEffect, useRef } from "react";
import { Calendar, Flag, AlarmClock, MoreHorizontal, X, RefreshCw} from "lucide-react";
import api from "../utils/api";
import type { Todo } from "./Modal";
import CustomDatePicker from "./CustomDatePicker";
import PriorityPicker from "./PriorityPicker";
import { parseNaturalLanguageDate} from "../utils/nlpDateParser";
import MoreOptionsPicker, { CategoryPicker } from "./MoreOptionsPicker";
import { createPortal } from "react-dom";
import ColorPicker from "./ColorPicker";
import { getTimeFromDate } from "./InlineTaskForm";
interface AddTaskCalenderProps {
  todo?: Todo;
  preselectedDate: Date;
  onCancel: () => void;
  onSuccess: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  index: number;
  backgroundColor?: string;
  width?: string;
  isEditMode?: boolean;
}

const AddTaskCalender = ({ todo, preselectedDate, onCancel, onSuccess, onUpdate, isEditMode=false , index, width="w-full"}: AddTaskCalenderProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>(roundToNearest15Minutes(new Date()));
  const [isAllDay, setIsAllDay] = useState(true);
  const [priority, setPriority] = useState<"high" | "medium" | "low" | null>(null);
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<"daily" | "weekly" | "monthly" | "yearly" | null>(null);
  const [recurrenceInterval, setRecurrenceInterval] = useState<number | null>(null);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showMoreOptionsPicker, setShowMoreOptionsPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);
  const moreOptionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const colorButtonRef = useRef<HTMLButtonElement | null>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>(todo?.color ?? "bg-red-600");
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible,setIsVisible] = useState(false)

  function roundToNearest15Minutes(date: Date) {

    const ms = 1000 * 60 * 15

    const roundedDate = new Date(Math.ceil(date.getTime() / ms) * ms);
    return roundedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    })


  }
  // Helper function to convert Date to YYYY-MM-DD format
  const dateToInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to convert ISO date string to YYYY-MM-DD format (using local timezone)
  const isoToDateInput = (isoString: string | null | undefined): string => {
    if (!isoString) {
      return "";
    }
    // Parse the ISO string and get local date components
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateFromDate = (date: string) => {
    if(!date) return "";
    return date.split("T")[0];
  }

  // Initialize form fields from todo prop when editing
  useEffect(() => {

    
    if (todo) {
      setSelectedDate(todo?.completeAt ? getDateFromDate(todo.completeAt) : dateToInput(preselectedDate)); 
      if(!todo.isAllDay){
        setIsAllDay(false);
        setSelectedTime(getTimeFromDate(todo?.completeAt ?? ""));
      }
      setTitle(todo.title || "");
      setDescription(todo.description || "");
      setSelectedDate(todo.completeAt ? isoToDateInput(todo.completeAt) : dateToInput(preselectedDate));
      setPriority((todo.priority as "high" | "medium" | "low") ?? null);
      setCategory(todo.category || "");
      setIsRecurring(todo.isRecurring || false);
      setRecurrencePattern(todo.recurrencePattern ?? null);
      setRecurrenceInterval(todo.recurrenceInterval ?? null);
      setRecurrenceEndDate(todo.recurrenceEndDate 
        ? new Date(todo.recurrenceEndDate).toISOString().split("T")[0]
        : "");
    } else {
      // Reset form for new todo
      setTitle("");
      setDescription("");
      setSelectedDate(dateToInput(preselectedDate));
      setPriority(null);
      setCategory("");
      setIsRecurring(false);
      setRecurrencePattern(null);
      setRecurrenceInterval(null);
      setRecurrenceEndDate("");
    }
  }, [todo]);

  useEffect(() => {
      setIsVisible(true)
  },[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    
    try {
      let res;
      if (todo?.id) {
        // Update existing todo
        res = await api.put(`/v1/todo/${todo.id}`, {
          title,
          description,
          completeAt: selectedDate,
          isAllDay,
          category,
          priority: priority ?? null,
          isRecurring,
          recurrencePattern: recurrencePattern ?? null,
          recurrenceInterval: recurrenceInterval ?? null,
          recurrenceEndDate: recurrenceEndDate ?? null,
          color: selectedColor ?? null,
        });
        onUpdate(res.data.todo);
      } else {
        
        // Create new todo
        res = await api.post("/v1/todo/", {
          title,
          description,
          completeAt: selectedDate,
          isAllDay,
          category,   
          priority: priority ?? null,
          isRecurring,
          recurrencePattern: recurrencePattern ?? null,
          recurrenceInterval: recurrenceInterval ?? null,
          recurrenceEndDate: recurrenceEndDate ?? null,
          color: selectedColor ?? null,
        });
      }

      if (res.data.todo) {
        onSuccess(res.data.todo);
      } else {
        onSuccess({
          ...todo,
          title,
          description,
          completeAt: selectedDate,
          isAllDay,
          category,
          priority: priority ?? null,
          completed: todo?.completed || false,
          completedAt: todo?.completedAt || null,
          isRecurring,
          recurrencePattern: recurrencePattern ?? null,
          recurrenceInterval: recurrenceInterval ?? null ,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
          parentRecurringId: todo?.parentRecurringId || null,
          color: selectedColor ?? null,
          createdAt: null
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedDate(dateToInput(preselectedDate));
      setPriority(null);
      setCategory("");
      setIsRecurring(false);
      setRecurrencePattern(null);
      setRecurrenceInterval(null);
      setRecurrenceEndDate("");
      onCancel();
    } catch (error) {
      console.error(todo?.id ? "Error updating todo" : "Error creating todo", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDateLabel = (dateStr: string | null, time: string | null): string | null => {
    if (!dateStr || !time) return null;
    if(!isAllDay){
      dateStr = dateStr.split("T")[0];
    }

    // Parse YYYY-MM-DD string as local date (not UTC)
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    //covert 24hr to 12hr
    const [hours, minutes] = time.split(":")
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    const timeLabel = `${hour12}:${minutes} ${ampm}`;
    
    if (selectedDate.getTime() === today.getTime()) {
      return !isAllDay ? `Today ${timeLabel}` : "Today";
    } else if (selectedDate.getTime() === tomorrow.getTime()) {
      return !isAllDay ? `Tomorrow ${timeLabel}` : "Tomorrow";
    } else {
      // For other dates, return formatted date
      return !isAllDay ? `${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeLabel}` : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const priorityColors = {
    high: "text-red-500",
    medium: "text-blue-500",
    low: "text-green-500",
    undefined: "text-gray-500",
  };

  const dateLabel = getDateLabel(selectedDate,selectedTime);
  
  // Check if selected date is today
  const isTodaySelected = (() => {
    if (!selectedDate) return false;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDateObj.getTime() === today.getTime();
  })();

  // Handle empty date (No Date selected)
  const handleNoDate = () => {
    setSelectedDate("");
    setIsRecurring(false);
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = descriptionTextareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight, but cap at max-height (200px)
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // Max height in pixels before scrolling
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      // Add overflow-y-auto when content exceeds max height
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [description, todo]);
  useEffect(() =>{
    if(!title.trim()){
      return;
    }
    const timeoutId = setTimeout(() => {
      const result = parseNaturalLanguageDate(title);
      if(result.confidence === "high" && result.date){
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  },[title])
  console.log("width", width);

  useEffect(() => {
    const checkMobile = ()  => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  })

  const handleClose = () =>{
    setIsVisible(false)

    setTimeout(() => {
      onCancel()
    },300)
  }

  return createPortal(
    <>
    <div className="fixed inset-0 z-40" onClick={handleClose}></div>
    <form onSubmit={handleSubmit} className={`px-4 pt-4 pb-2 bg-task fixed z-50 backdrop-blur-sm border border-border rounded-sm transition-all duration-300 ${isMobile ? "w-100" : width} min-w-0 shadow-[0px_4px_25px_rgba(0,0,0,1)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
    style={{
      top: '50px',
      left: '50%',
      transform: 'translate(-50%, 100%)',
    }}
    >
      {/* Category Tag */}
      {category && (
        <div className="mb-2">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted border border-border text-white text-xs font-medium">
            <span>@{category}</span>
            <button
              type="button"
              onClick={() => setCategory("")}
              className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Task Name Input */}
      <input
        ref={titleInputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task name"
        className="w-full bg-transparent text-foreground placeholder:text-[#A2A2A9] placeholder:font-bold font-bold text-xl! outline-none focus:outline-none min-w-0 mb-1"
        autoFocus
      />

      {/* Description Input */}
      <textarea
        ref={descriptionTextareaRef}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={1}
        className="w-full bg-transparent text-foreground placeholder:text-[#A2A2A9] text-md! mb-2 outline-none focus:outline-none min-w-0 resize-none overflow-y-auto"
        style={{ minHeight: '20px', maxHeight: '200px' }}
      />

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Date Button */}
        <div className="relative">
          <button
            ref={dateButtonRef}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowDatePicker(!showDatePicker);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium hover:bg-muted hover:border-white/20 transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 cursor-pointer shrink-0 ${dateLabel ? "text-green-500" : "text-white"} ${
              isTodaySelected ? "rounded-full" : "rounded-md"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0 " />
            {<span className="whitespace-nowrap max-w-[100px] font-extralight">{selectedDate ? dateLabel : "Date"}</span>}
            {isRecurring && <RefreshCw className="w-2.5 h-2.5 shrink-0 text-gray-300" />}
            {selectedDate && (
              <X
                className="w-3 h-3 ml-1 text-foreground hover:bg-hover   shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNoDate();
                }}
              />
            )}
          </button>
          
          {/* Custom Date Picker */}
          {showDatePicker && (
            <CustomDatePicker
              isAllDay={isAllDay}
              selectedDate={selectedDate}
              todo={todo}
              selectedTime={selectedTime}
              isRecurring={isRecurring}
              setIsRecurring={setIsRecurring}
              recurrencePattern={recurrencePattern}
              setRecurrencePattern={setRecurrencePattern}
              onTimeSelect={(time: string) => {
                setSelectedTime(time);
              }}
              setIsAllDay={setIsAllDay}
              todos={[]}
              onDateSelect={(date: string) => {
                setSelectedDate(date);
                // setShowDatePicker(false);
              }}
              onRecurringSelect={(config) => {
                setIsRecurring(config.isRecurring || false);
                if (config.recurrencePattern) {
                  setRecurrencePattern(config.recurrencePattern);
                }
                if (config.recurrenceInterval) {
                  setRecurrenceInterval(config.recurrenceInterval);
                }
                if (config.recurrenceEndDate !== undefined) {
                  setRecurrenceEndDate(config.recurrenceEndDate || "");
                }
              }}
              index={index}
              onClose={() => setShowDatePicker(false)}
              buttonRef={dateButtonRef}
            />
          )}
        </div>

        {/* Priority Button */}
        <div className="relative">
          <button
            ref={priorityButtonRef}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPriorityPicker(!showPriorityPicker);
            }}
            className={`p-1.5 rounded-md border border-border hover:border-white/20 hover:bg-muted transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 cursor-pointer shrink-0`}
          >
            <div className="flex items-center gap-1">
            <Flag 
              className={`w-4 h-4 ${priority ? priorityColors[priority] : "text-gray-500"}`}
              style={{ 
                fill: priority === "high" ? "#DC2828" : 
                      priority === "medium" ? "#3B82F6" : 
                      priority === "low" ? "#28A745" : "none" 
              }}
            />
            <span className="text-foreground text-xs font-extralight">{priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Priority"}</span>
            </div>
          </button>
          
          {/* Priority Picker */}
          {showPriorityPicker && (
            <PriorityPicker
              selectedPriority={priority}
              onPrioritySelect={(newPriority) => {
                setPriority(newPriority);
                setShowPriorityPicker(false);
              }}
              onClose={() => setShowPriorityPicker(false)}
              buttonRef={priorityButtonRef}
            />
          )}
        </div>

        {/* Reminder Button (placeholder) */}
        <button
          type="button"
          className="p-1.5 rounded-md border border-border hover:border-white/20 hover:bg-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 text-white shrink-0"
        >
          <div className="flex items-center gap-1 text-foreground">
          <AlarmClock className="w-4 h-4" />
          <span className="text-xs font-extralight">Reminders</span>
          </div>
        </button>

        {/* More Options Button */}
        <button
          ref={moreOptionsButtonRef}
          type="button"
          className="p-1.5 rounded-md border border-border hover:border-white/20 hover:bg-muted transition-colors cursor-pointer text-fore ground shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400"
          onClick={(e) => {
            e.preventDefault();
            setShowMoreOptionsPicker(!showMoreOptionsPicker);
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <button
          ref={colorButtonRef}
          type="button"
          className="p-1.5 rounded-md border border-border hover:border-white/20 hover:bg-muted transition-colors cursor-pointer text-white shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400"
          onClick={(e) => {
            e.preventDefault();
            setShowColorPicker(!showColorPicker);
          }}
        >
          <div className={`w-4 h-4 ${selectedColor} rounded-full`}></div>
          {/* Color Picker */}
        </button>
        {showColorPicker && (
          <ColorPicker
            selectedColor={selectedColor}
            onColorSelect={(color: string) => {
              setSelectedColor(color);
              setShowColorPicker(false);
            }}
            onClose={() => setShowColorPicker(false)}
            buttonRef={colorButtonRef}
          />
        )}
        {showMoreOptionsPicker && (
          <MoreOptionsPicker
            onClose={() => setShowMoreOptionsPicker(false)}
            buttonRef={moreOptionsButtonRef}
            onCategoryClick={() => {
              setShowCategoryPicker(true);
            }}
          />
        )}
        {showCategoryPicker && (
          <CategoryPicker
            onClose={() => setShowCategoryPicker(false)}
            onCategorySelect={(category: string) => {
              setCategory(category);
              setShowCategoryPicker(false);
            }}
            selectedCategory={category}
            titleInputRef={titleInputRef}
          />
        )}
      </div>

      {/* Bottom Row: Project and Submit */}
      <div className="flex items-center justify-end pt-1.5 border-t border-border gap-2 min-w-0">

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 py-1.5">
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-md text-white bg-muted hover:bg-muted transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 border border-border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="p-1.5 rounded-sm bg-linear-to-r from-purple-500 to-pink-400 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 shadow-[0_4px_12px_rgba(168,85,247,0.3)] text-white"
          >
            {isEditMode ? "Save" : "Add Task"}
          </button>
        </div>
      </div>
    </form>
    </>,
    document.body
  );
};

export default AddTaskCalender;

