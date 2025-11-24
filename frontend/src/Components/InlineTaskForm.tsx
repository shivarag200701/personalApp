import { useState, useEffect, useRef } from "react";
import { Calendar, Flag, AlarmClock, MoreHorizontal, X, SendHorizontal , RefreshCw} from "lucide-react";
import api from "../utils/api";
import type { Todo } from "./Modal";
import CustomDatePicker from "./CustomDatePicker";
import PriorityPicker from "./PriorityPicker";
import { parseNaturalLanguageDate} from "../utils/nlpDateParser";
interface InlineTaskFormProps {
  todo?: Todo;
  preselectedDate: Date;
  onCancel: () => void;
  onSuccess: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  index: number;
}

const InlineTaskForm = ({ todo, preselectedDate, onCancel, onSuccess, onUpdate , index}: InlineTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("high");
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<"daily" | "weekly" | "monthly" | "yearly" | undefined>(undefined);
  const [recurrenceInterval, setRecurrenceInterval] = useState<number | undefined>(undefined);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);


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

  // Helper function to convert YYYY-MM-DD to ISO string (end of day in UTC)
  const dateInputToIso = (dateInput: string): string => {
    if (!dateInput) {
      // If no date, use tomorrow as default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      return tomorrow.toISOString();
    }
    const [year, month, day] = dateInput.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    return date.toISOString();
  };

  // Initialize form fields from todo prop when editing
  useEffect(() => {
    if (todo) {
      setTitle(todo.title || "");
      setDescription(todo.description || "");
      setSelectedDate(todo.completeAt ? isoToDateInput(todo.completeAt) : dateToInput(preselectedDate));
      setPriority((todo.priority as "high" | "medium" | "low") || "high");
      setCategory(todo.category || "");
      setIsRecurring(todo.isRecurring || false);
      setRecurrencePattern(todo.recurrencePattern || undefined);
      setRecurrenceInterval(todo.recurrenceInterval || undefined);
      setRecurrenceEndDate(todo.recurrenceEndDate 
        ? new Date(todo.recurrenceEndDate).toISOString().split("T")[0]
        : "");
      console.log("todo in useEffect", todo);
    } else {
      // Reset form for new todo
      setTitle("");
      setDescription("");
      setSelectedDate(dateToInput(preselectedDate));
      setPriority("high");
      setCategory("");
      setIsRecurring(false);
      setRecurrencePattern(undefined);
      setRecurrenceInterval(undefined);
      setRecurrenceEndDate("");
    }
  }, [todo, preselectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const completeAtIso = dateInputToIso(selectedDate);
    setIsSubmitting(true);
    
    try {
      let res;
      if (todo?.id) {
        // Update existing todo
        res = await api.put(`/v1/todo/${todo.id}`, {
          title,
          description,
          completeAt: completeAtIso,
          category,
          priority,
          isRecurring,
          recurrencePattern: recurrencePattern || undefined,
          recurrenceInterval: recurrenceInterval || undefined,
          recurrenceEndDate: recurrenceEndDate || undefined,
        });
        onUpdate(res.data.todo);
      } else {
        console.log("creating new todo");
        
        // Create new todo
        res = await api.post("/v1/todo/", {
          title,
          description,
          completeAt: completeAtIso,
          category,
          priority,
          isRecurring,
          recurrencePattern: recurrencePattern || undefined,
          recurrenceInterval: recurrenceInterval || undefined,
          recurrenceEndDate: recurrenceEndDate || undefined,
        });
      }

      if (res.data.todo) {
        onSuccess(res.data.todo);
      } else {
        onSuccess({
          ...todo,
          title,
          description,
          completeAt: completeAtIso,
          category,
          priority,
          completed: todo?.completed || false,
          completedAt: todo?.completedAt || null,
          isRecurring,
          recurrencePattern: recurrencePattern || undefined,
          recurrenceInterval: recurrenceInterval || undefined ,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
          parentRecurringId: todo?.parentRecurringId || null,
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedDate(dateToInput(preselectedDate));
      setPriority("high");
      setCategory("");
      setIsRecurring(false);
      setRecurrencePattern("daily");
      setRecurrenceInterval(1);
      setRecurrenceEndDate("");
      onCancel();
    } catch (error) {
      console.error(todo?.id ? "Error updating todo" : "Error creating todo", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDateLabel = (dateStr: string | null): string | null => {
    if (!dateStr) return null;
    
    // Parse YYYY-MM-DD string as local date (not UTC)
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (selectedDate.getTime() === today.getTime()) {
      return "Today";
    } else if (selectedDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      // For other dates, return formatted date
      return selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const priorityColors = {
    high: "text-red-500",
    medium: "text-yellow-500",
    low: "text-green-500",
  };

  const dateLabel = getDateLabel(selectedDate);
  
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
          console.log("matched string", result.matchedString);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  },[title])
  return (
    <form onSubmit={handleSubmit} className="p-2 bg-[#1B1B1E] border border-gray-700 rounded-xl mt-3 w-full min-w-0">
      {/* Task Name Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task name"
        className="w-full bg-transparent text-white placeholder:text-[#A2A2A9] text-base md:text-sm outline-none focus:outline-none min-w-0"
        autoFocus
      />

      {/* Description Input */}
      <textarea
        ref={descriptionTextareaRef}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={1}
        className="w-full bg-transparent text-white placeholder:text-[#A2A2A9] text-sm md:text-xs mb-2 outline-none focus:outline-none min-w-0 resize-none overflow-y-auto"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 text-xs font-medium hover:bg-[#323238] transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400  cursor-pointer shrink-0 ${dateLabel ? "text-green-500" : "text-white"} ${
              isTodaySelected ? "rounded-full" : "rounded-md"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0 " />
            {dateLabel && <span className="whitespace-nowrap truncate max-w-[100px]">{dateLabel}</span>}
            {isRecurring && <RefreshCw className="w-2.5 h-2.5 shrink-0 text-gray-300" />}
            {selectedDate && (
              <X
                className="w-3 h-3 ml-1 text-white hover:text-gray-300 shrink-0"
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
              selectedDate={selectedDate}
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
            className={`p-1.5 rounded-md border border-gray-700 hover:border-gray-600 transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 cursor-pointer shrink-0 ${priorityColors[priority]}`}
          >
            <Flag 
              className={`w-4 h-4 ${priorityColors[priority]}`}
              style={{ 
                fill: priority === "high" ? "#DC2828" : 
                      priority === "medium" ? "#F39C12" : 
                      priority === "low" ? "#28A745" : "none" 
              }}
            />
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
          className="p-1.5 rounded-md border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 text-white shrink-0"
        >
          <AlarmClock className="w-4 h-4" />
        </button>

        {/* More Options Button */}
        <button
          type="button"
          className="p-1.5 rounded-md border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer text-white shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Row: Project and Submit */}
      <div className="flex items-center justify-end pt-1.5 border-t border-gray-800 gap-2 min-w-0">

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-md bg-[#27272B] hover:bg-[#323238] transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="p-2 rounded-md bg-[#A0522D] hover:bg-[#8B4513] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400"
          >
            <SendHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default InlineTaskForm;

