import { useState, useEffect, useRef } from "react";
import { Calendar, Flag, AlarmClock, MoreHorizontal, X, SendHorizontal , RefreshCw} from "lucide-react";
import api from "../utils/api";
import type { Todo } from "./Modal";
import CustomDatePicker from "./CustomDatePicker";
import PriorityPicker from "./PriorityPicker";
import { parseNaturalLanguageDate} from "../utils/nlpDateParser";
import WarningModal from "./WarningModal";
import MoreOptionsPicker, { CategoryPicker } from "./MoreOptionsPicker";
interface InlineTaskFormProps {
  todo?: Todo;
  preselectedDate: Date;
  onCancel: () => void;
  onSuccess: (todo: Todo) => void;
  onUpdate: (todo: Todo) => void;
  index: number;
  backgroundColor?: string;
  width?: string;
  todos: Todo[];
  columnIndex: number;
}
 export function getTimeFromDate(date: string): string {
  if(!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  })
}
const InlineTaskForm = ({ todo, preselectedDate, onCancel, onSuccess, onUpdate , index, backgroundColor, width="w-full", todos, columnIndex}: InlineTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  let [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>(roundToNearest15Minutes(new Date()));
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
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);
  const moreOptionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isAllDay, setIsAllDay] = useState(true);
  // Track whether any field has changed using a ref so it updates synchronously
  const hasChangesRef = useRef(false);

  const combineDateAndTime = (date: string, time: string) => {
    if(!date || !time) return "";
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);

    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj.toISOString();
  }
  if(!isAllDay){
    selectedDate = combineDateAndTime(selectedDate,selectedTime);
  }


  

  
  // Helper function to convert Date to YYYY-MM-DD format
  const dateToInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  function roundToNearest15Minutes(date: Date) {

    const ms = 1000 * 60 * 15

    const roundedDate = new Date(Math.ceil(date.getTime() / ms) * ms);
    return roundedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    })

  }

  // Helper function to convert ISO date string to YYYY-MM-DD format (using local timezone)
 

  
  const getDateFromDate = (date: string) => {
    if(!date) return "";
    return date.split("T")[0];
  }


  // Initialize form fields from todo prop when editing
  useEffect(() => {
    if (todo) {
      setSelectedDate(getDateFromDate(todo?.completeAt ?? "")); 
      if(!todo.isAllDay){
        setIsAllDay(false);
        setSelectedTime(getTimeFromDate(todo?.completeAt ?? ""));
      }
      setTitle(todo.title || "");
    setDescription(todo.description || "");
    const initPriority = (todo.priority as "high" | "medium" | "low") ?? null;
    setPriority(initPriority);
    setCategory(todo.category || "");
    const initIsRecurring = todo.isRecurring || false;
    const initRecurrencePattern = todo.recurrencePattern ?? null;
    const initRecurrenceInterval = todo.recurrenceInterval ?? null;
    const initRecurrenceEndDate = todo.recurrenceEndDate
      ? new Date(todo.recurrenceEndDate).toISOString().split("T")[0]
      : "";

    setIsRecurring(initIsRecurring);
    setRecurrencePattern(initRecurrencePattern);
    setRecurrenceInterval(initRecurrenceInterval);
    setRecurrenceEndDate(initRecurrenceEndDate);
    } else {
      // Reset form for new todo
      const initSelectedDate = dateToInput(preselectedDate);
    setTitle("");
    setDescription("");
    setSelectedDate(initSelectedDate);
    setPriority(null);
    setCategory("");
    setIsRecurring(false);
    setRecurrencePattern(null);
    setRecurrenceInterval(null);
    setRecurrenceEndDate("");
    }
  }, [todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
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
        });
        onUpdate(res.data.todo);
      } else {
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
          color: 'bg-purple-500',
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
          category,
          priority: priority ?? null,
          completed: todo?.completed || false,
          completedAt: todo?.completedAt || null,
          isRecurring,
          recurrencePattern: recurrencePattern ?? null,
          recurrenceInterval: recurrenceInterval ?? null ,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
          parentRecurringId: todo?.parentRecurringId || null,
          isAllDay,
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
      hasChangesRef.current = false;
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



  const handleCancel = () => {
    setIsWarningModalOpen(false);
  }
  const handleDiscard = () => {
    onCancel();
    setIsWarningModalOpen(false);
  }
  
  return (
    <>
    <form onSubmit={handleSubmit} className={`p-2 ${backgroundColor} backdrop-blur-sm border border-white/10 rounded-xl ${width} min-w-0 shadow-[0_4px_12px_rgba(0,0,0,0.3)]`}>
      {/* Category Tag */}
      {category && (
        <div className="mb-2">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 border border-white/10 text-white text-xs font-medium">
            <span>@{category}</span>
            <button
              type="button"
              onClick={() => setCategory("")}
              className="ml-1 hover:bg-white/10 rounded-full p-0.5 transition-colors"
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
        onChange={(e) => {
          setTitle(e.target.value);
          hasChangesRef.current = true;
        }}
        placeholder="Task name"
        className="w-full bg-transparent text-white placeholder:text-[#A2A2A9] text-base md:text-sm outline-none focus:outline-none min-w-0"
        autoFocus
      />

      {/* Description Input */}
      <textarea
        ref={descriptionTextareaRef}
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          hasChangesRef.current = true;
        }}
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
            className={`flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-xs font-medium hover:bg-white/5 hover:border-white/20 transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 cursor-pointer shrink-0 ${dateLabel ? "text-green-500" : "text-white"} ${
              isTodaySelected ? "rounded-full" : "rounded-md"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0 " />
            {dateLabel && <span className="whitespace-nowrap max-w-[100px]">{dateLabel}</span>}
            <div className="flex items-center gap-1 ml-3">
              {isRecurring && <RefreshCw className="w-2.5 h-2.5 shrink-0 text-gray-300" />}
              {selectedDate && (
                <X
                  className="w-3 h-3 text-white hover:text-gray-300 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNoDate();
                  }}
                />
              )}
            </div>
          </button>
          
          {/* Custom Date Picker */}
          {showDatePicker && (
            <CustomDatePicker
              columnIndex={columnIndex}
              todo={todo}
              isAllDay={isAllDay}
              todos={todos}
              selectedDate={selectedDate}
              setIsAllDay={setIsAllDay}
              selectedTime={selectedTime}
              onTimeSelect={(time: string) => {
                setSelectedTime(time);
                hasChangesRef.current = true;
              }}
              onDateSelect={(date: string) => {
                setSelectedDate(date);
                hasChangesRef.current = true;
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
                hasChangesRef.current = true;
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
            className={`p-1.5 rounded-md border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 cursor-pointer shrink-0`}
          >
            <Flag 
              className={`w-4 h-4 ${priority ? priorityColors[priority] : "text-gray-500"}`}
              style={{ 
                fill: priority === "high" ? "#DC2828" : 
                      priority === "medium" ? "#3B82F6" : 
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
                hasChangesRef.current = true;
              }}
              onClose={() => setShowPriorityPicker(false)}
              buttonRef={priorityButtonRef}
            />
          )}
        </div>

        {/* Reminder Button (placeholder) */}
        <button
          type="button"
          className="p-1.5 rounded-md border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 text-white shrink-0"
        >
          <AlarmClock className="w-4 h-4" />
        </button>

        {/* More Options Button */}
        <div className="relative">
        <button
          ref={moreOptionsButtonRef}
          type="button"
          className="p-1.5 rounded-md border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer text-white shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400"
          onClick={(e) => {
            e.preventDefault();
            setShowMoreOptionsPicker(!showMoreOptionsPicker);
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMoreOptionsPicker && (
          <MoreOptionsPicker
            onClose={() => setShowMoreOptionsPicker(false)}
            buttonRef={moreOptionsButtonRef}
            onCategoryClick={() => {
              setShowCategoryPicker(true);
            }}
          />
        )}
        </div>
        {showCategoryPicker && (
          <CategoryPicker
            onClose={() => setShowCategoryPicker(false)}
            onCategorySelect={(category: string) => {
              setCategory(category);
              setShowCategoryPicker(false);
                hasChangesRef.current = true;
            }}
            selectedCategory={category}
            titleInputRef={titleInputRef}
          />
        )}
      </div>

      {/* Bottom Row: Project and Submit */}
      <div className="flex items-center justify-end pt-1.5 border-t border-white/10 gap-2 min-w-0">

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>{
              if(hasChangesRef.current){
                setIsWarningModalOpen(true);
              } else {
                onCancel();
              }
            }}
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 border border-white/10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="p-2 rounded-md bg-linear-to-r from-purple-500 to-pink-400 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer shrink-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 shadow-[0_4px_12px_rgba(168,85,247,0.3)]"
          >
            <SendHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </form>
    <WarningModal
      isOpen={isWarningModalOpen}
      onClose={handleCancel}
      onDiscard={handleDiscard}
      title="Discard unsaved changes"
      description="Your unsaved changes will be discarded."
      buttonText="Discard"
    />
    </>
  );
};

export default InlineTaskForm;

