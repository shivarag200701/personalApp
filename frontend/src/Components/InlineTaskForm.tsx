import { useState, useEffect, useRef } from "react";
import { Calendar, Flag, AlarmClock, MoreHorizontal, X, Send } from "lucide-react";
import api from "../utils/api";
import type { Todo } from "./Modal";
import CustomDatePicker from "./CustomDatePicker";
import PriorityPicker from "./PriorityPicker";
interface InlineTaskFormProps {
  preselectedDate: Date;
  onCancel: () => void;
  onSuccess: (todo: Todo) => void;
}

const InlineTaskForm = ({ preselectedDate, onCancel, onSuccess }: InlineTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("high");
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);

  // Helper function to convert Date to YYYY-MM-DD format
  const dateToInput = (date: Date): string => {
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

  useEffect(() => {
    setSelectedDate(dateToInput(preselectedDate));
  }, [preselectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const completeAtIso = dateInputToIso(selectedDate);
    setIsSubmitting(true);

    try {
      const res = await api.post("/v1/todo/", {
        title,
        description,
        completeAt: completeAtIso,
        category,
        priority,
        isRecurring,
        recurrencePattern,
        recurrenceInterval,
        recurrenceEndDate: recurrenceEndDate || undefined,
      });

      if (res.data.todo) {
        onSuccess(res.data.todo);
      } else {
        onSuccess({
          title,
          description,
          completeAt: completeAtIso,
          category,
          priority,
          completed: false,
          completedAt: null,
          isRecurring,
          recurrencePattern,
          recurrenceInterval,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
          parentRecurringId: null,
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
      console.error("Error creating todo", error);
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
  };
  console.log("dateLabel", dateLabel ? "yes" : "no");
  

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-[#1B1B1E] border border-gray-800 rounded-xl mt-3 w-full min-w-0">
      {/* Task Name Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task name"
        className="w-full bg-transparent text-white placeholder:text-[#A2A2A9] text-sm mb-2 outline-none focus:outline-none min-w-0"
        autoFocus
      />

      {/* Description Input */}
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full bg-transparent text-white placeholder:text-[#A2A2A9] text-xs mb-3 outline-none focus:outline-none min-w-0"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 text-xs font-medium hover:bg-[#323238] transition-colors cursor-pointer shrink-0 ${dateLabel ? "text-green-500" : "text-white"} ${
              isTodaySelected ? "rounded-full" : "rounded-md"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0 " />
            {dateLabel && <span className="whitespace-nowrap truncate max-w-[100px]">{dateLabel}</span>}
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
                setShowDatePicker(false);
              }}
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
            className={`p-1.5 rounded-md border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer shrink-0 ${priorityColors[priority]}`}
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
          className="p-1.5 rounded-md border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer text-white shrink-0"
        >
          <AlarmClock className="w-4 h-4" />
        </button>

        {/* More Options Button */}
        <button
          type="button"
          className="p-1.5 rounded-md border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer text-white shrink-0"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Row: Project and Submit */}
      <div className="flex items-center justify-end pt-3 border-t border-gray-800 gap-2 min-w-0">

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-md bg-[#27272B] hover:bg-[#323238] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="p-1.5 rounded-md bg-[#A0522D] hover:bg-[#8B4513] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Recurring Options (collapsed by default, can be expanded) */}
      {isRecurring && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[#A2A2A9] text-xs">Every</span>
            <input
              type="number"
              min="1"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
              className="bg-[#141415] rounded-sm p-1.5 w-16 text-white border border-gray-600 text-xs text-center"
            />
            <select
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value as any)}
              className="bg-[#141415] rounded-sm p-1.5 flex-1 text-white border border-gray-600 text-xs"
            >
              <option value="daily">Day(s)</option>
              <option value="weekly">Week(s)</option>
              <option value="monthly">Month(s)</option>
              <option value="yearly">Year(s)</option>
            </select>
          </div>
          {recurrenceEndDate && (
            <div className="text-[#A2A2A9] text-xs">
              Ends on {new Date(recurrenceEndDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default InlineTaskForm;

