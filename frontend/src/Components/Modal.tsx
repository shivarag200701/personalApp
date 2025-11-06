import { useEffect, useState} from "react";
import { Button } from "./ui/button";
import { AlertCircle, Tag } from "lucide-react";
import api from "../utils/api";

export interface Todo {
  id?: number;
  title: string;
  description: string;
  priority: string;
  completeAt: string;
  category: string;
  completed: boolean;
  completedAt: Date | null;
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
  recurrenceInterval?: number;
  recurrenceEndDate?: Date | null;
  parentRecurringId?: number | null;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  addTodo: (task: Todo) => void;
  editTodo?: (task: Todo) => void;
  todoToEdit?: Todo | null;
}

const Modal = ({ isOpen, onClose, addTodo, editTodo, todoToEdit }: ModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeSelection, setTimeSelection] = useState("Today");
  const [priority, setPriority] = useState("high");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");

  useEffect(() => {
    if (todoToEdit) {
      setTitle(todoToEdit.title);
      setDescription(todoToEdit.description);
      setTimeSelection(todoToEdit.completeAt);
      setPriority(todoToEdit.priority);
      setCategory(todoToEdit.category);
      setIsRecurring(todoToEdit.isRecurring || false);
      setRecurrencePattern(todoToEdit.recurrencePattern || "daily");
      setRecurrenceInterval(todoToEdit.recurrenceInterval || 1);
      setRecurrenceEndDate(todoToEdit.recurrenceEndDate 
        ? new Date(todoToEdit.recurrenceEndDate).toISOString().split("T")[0]
        : "");
    } else {
      // Reset form for new todo
      setTitle("");
      setDescription("");
      setTimeSelection("Today");
      setPriority("high");
      setCategory("");
      setIsRecurring(false);
      setRecurrencePattern("daily");
      setRecurrenceInterval(1);
      setRecurrenceEndDate("");
    }
  }, [todoToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  const handleClick = () => {
    setTitle("");
    setDescription("");
    setTimeSelection("Today");
    setCategory("high");
    setCategory("");
    onClose();
  };
  const createTodo = async () => {
    console.log(timeSelection);

    console.log(priority);
    console.log(category);
    setIsSubmitting(true);
    try {
      await api.post("/v1/todo/", {
        title,
        description,
        completeAt: timeSelection,
        category,
        priority,
        isRecurring,
        recurrencePattern,
        recurrenceInterval,
        recurrenceEndDate,
      });
      console.log("Todo created");
      addTodo({
        title,
        description,
        completeAt: timeSelection,
        category,
        priority,
        completed: false,
        completedAt: null,
        isRecurring,
        recurrencePattern,
        recurrenceInterval,
        recurrenceEndDate: null,
        parentRecurringId: null,
      });
      onClose();
      handleClick();
    } catch (error) {
      console.error("error while creating todo", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTodo = async () => {
    if (!todoToEdit?.id) return;
    
    setIsSubmitting(true);
    try {
      await api.put(`/v1/todo/${todoToEdit.id}`, {
        title,
        description,
        completeAt: timeSelection,
        category,
        priority,
        isRecurring,
        recurrencePattern,
        recurrenceInterval,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        parentRecurringId: null,
      });
      console.log("Todo updated");
      if (editTodo) {
        editTodo({
          ...todoToEdit,
          title,
          description,
          completeAt: timeSelection,
          category,
          priority,
          isRecurring,
          recurrencePattern,
          recurrenceInterval,
          recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
          parentRecurringId: null,
        });
      }
      handleClick();
    } catch (error) {
      console.error("error while updating todo", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmit = () =>{
    if(todoToEdit) {
      updateTodo();
    } else {
      createTodo();
    }
  }
  if (!isOpen) return null;

  const isEditMode = !!todoToEdit;

  return (
    <div className="fixed inset-0  z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-[#131315] p-6 rounded-lg shadow-lg bg-opacity-30 relative w-11/12 md:w-1/3 lg:w-1/3 2xl:w-1/4 max-h-[90vh] flex flex-col overflow-y-auto ">
        <button
          onClick={handleClick}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700  cursor-pointer z-10 text-2xl"
        >
          &times;
        </button>
        <div className="flex-col">
          <div className="text-white text-center md:text-left text-2xl mb-8">
            Add New Task
          </div>
          <div className="text-white text-md font-extralight mb-3">
            Task Title
          </div>
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-[#141415] rounded-sm p-2 pl-4 placeholder:text-[#A2A2A9] placeholder:font-extralight border-[0.1px] border-gray-600 w-full text-white"
            />
          </div>
          <div className="text-white text-md font-extralight mb-3">
            Description (Optional)
          </div>
          <div className="mb-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-white border-[0.1px] rounded-sm border-gray-600 w-full font-extralight p-3 "
              rows={3}
              placeholder="Add more details..."
            ></textarea>
          </div>

          <div className="text-white text-md font-extralight mb-3">When?</div>
          <div className="flex gap-2 mb-6">
            {(["Today", "Tomorrow", "Someday"] as const).map((time) => (
              <Button
                key={time}
                variant={time == timeSelection ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeSelection(time)}
                className="flex-1 capitalize"
              >
                {time}
              </Button>
            ))}
          </div>
          <div className="text-white text-md font-extralight mb-3">
            Priority
          </div>
          <div className="flex gap-2 mb-6">
            {(["high", "medium", "low"] as const).map((p) => (
              <Button
                key={p}
                variant={p == priority ? "default" : "outline"}
                size="sm"
                onClick={() => setPriority(p)}
                className="flex-1 capitalize"
              >
                {p === "high" && <AlertCircle className="w-3 h-3 mr-1" />}
                {p}
              </Button>
            ))}
          </div>
          <div className="text-white text-md font-extralight mb-3">
            Category (Optional)
          </div>
          <div className="mb-6 relative">
            <Tag className="absolute text-gray-500 top-3 left-3 w-5 h-5" />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              type="text"
              placeholder="e.g., Work, Personal, Health"
              className="bg-[#141415] rounded-sm p-2 pl-10 text-white placeholder:text-[#A2A2A9] placeholder:font-extralight border-[0.1px] border-gray-600 w-full"
            />
          </div>
          <div className="text-white text-md font-extralight mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4"
            />
            Make this task recurring
          </label>
        </div>
        {isRecurring && (
  <>
    <div className="text-white text-md font-extralight mb-3">
      How often should this repeat?
    </div>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[#A2A2A9] text-sm">Every</span>
      <input
        type="number"
        min="1" 
        value={recurrenceInterval}
        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value))}
        className="bg-[#141415] rounded-sm p-2 w-24 text-white border-[0.1px] border-gray-600 text-center"
      />
      <select
        value={recurrencePattern}
        onChange={(e) => setRecurrencePattern(e.target.value as any)}
        className="bg-[#141415] rounded-sm p-2 flex-1 text-white border-[0.1px] border-gray-600"
      >
        <option value="daily">Day(s)</option>
        <option value="weekly">Week(s)</option>
        <option value="monthly">Month(s)</option>
        <option value="yearly">Year(s)</option>
      </select>
    </div>
    <div className="text-[#A2A2A9] text-sm mb-4 italic">
      ✓ Repeats every {recurrenceInterval} {recurrencePattern === 'daily' ? 'day' : recurrencePattern === 'weekly' ? 'week' : recurrencePattern === 'monthly' ? 'month' : 'year'}{recurrenceInterval > 1 ? 's' : ''}
    </div>
    <div className="text-white text-md font-extralight mb-3">
      End Date (Optional)
    </div>
    <div className="mb-6">
      <input
        type="date"
        value={recurrenceEndDate}
        onChange={(e) => setRecurrenceEndDate(e.target.value)}
        className="bg-[#141415] rounded-sm p-2 w-full text-white border-[0.1px] border-gray-600"
      />
      {recurrenceEndDate && (
        <div className="text-[#A2A2A9] text-xs mt-1">
          Recurrence will stop on {new Date(recurrenceEndDate).toISOString().split("T")[0]}
        </div>
      )}
    </div>
  </>
)}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClick}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              disabled={!title || isSubmitting}
              onClick={handleSubmit}
              className="cursor-pointer"
            >
              {isSubmitting
              ? (isEditMode ? "Updating..." : "Adding...")
              : (isEditMode ? "Update Task" : "Add Task")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
