import { useState, useRef, useEffect } from "react";
import type { Todo } from "./Modal";
import { Button } from "./ui/button";
import {
  Bell,
  Clock4,
  CopyPlus,
  MoreHorizontal,
  Play,
  Trash,
  X,
  Check,
} from "lucide-react";
import { formatCompleteAt } from "@shiva200701/todotypes";
import api from "../utils/api";

interface TaskDetailDrawerProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  handleDuplicate: (todo: Todo) => void;
}

const labelClass = "text-xs uppercase tracking-wide text-gray-400";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TaskDetailDrawer = ({
  todo,
  isOpen,
  onClose,
  onEdit,
  onToggleComplete,
  onDelete,
  handleDuplicate,
}: TaskDetailDrawerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const justClosedDropdownRef = useRef(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (todo) {
      setEditedTitle(todo.title);
      setEditedDescription(todo.description || "");
    }
  }, [todo]);
  console.log("todo", todo?.id);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    console.log("isDropdownOpen", isDropdownOpen);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        // Set flag to prevent edit from opening immediately after closing dropdown
        justClosedDropdownRef.current = true;
        // Clear the flag after a short delay to allow normal clicks again
        setTimeout(() => {
          justClosedDropdownRef.current = false;
        }, 100);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleStartEdit = () => {
    if (!todo) return;
    console.log("clicked inside handleStartEdit");
    
    // Prevent edit from opening if dropdown was just closed (user clicked to close dropdown)
    if (justClosedDropdownRef.current) {
      return;
    }


    setIsEditing(true);
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || "");
  };

  const handleCancelEdit = () => {
    if (!todo) return;
    setIsEditing(false);
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || "");
  };

  const handleSave = async () => {
    if (!todo || !todo.id) return;
    
    setIsSaving(true);
    try {
      const payload: any = {
        title: editedTitle,
        description: editedDescription,
        completeAt: todo.completeAt,
        category: todo.category,
        priority: todo.priority,
        isRecurring: todo.isRecurring || false,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      const response = await api.put(`/v1/todo/${todo.id}`, payload);
      
      if (response.data.todo) {
        const updatedTodo: Todo = {
          ...todo,
          title: editedTitle,
          description: editedDescription,
        };
        onEdit(updatedTodo);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating todo", error);
    } finally {
      setIsSaving(false);
    }
  };

  // const priorityTone = useMemo(() => {
  //   if (!todo) {
  //     return { text: "text-white", bg: "bg-white/10" };
  //   }
  //   const dictionary: Record<string, { text: string; bg: string }> = {
  //     high: { text: "text-[#DC2828]", bg: "bg-[#DC282833]" },
  //     medium: { text: "text-[#F39C12]", bg: "bg-[#F39C1233]" },
  //     low: { text: "text-[#28A745]", bg: "bg-[#28A74533]" },
  //   };
  //   return dictionary[todo.priority?.toLowerCase()] ?? dictionary.low;
  // }, [todo]);

  // const metadata = useMemo(() => {
  //   if (!todo) return [];
  //   return [
  //     {
  //       label: "Due",
  //       value: formatCompleteAt(todo.completeAt),
  //       icon: Calendar,
  //     },
  //     {
  //       label: "Completed at",
  //       value: todo.completedAt ? formatDateTime(todo.completedAt) : "—",
  //       icon: CheckCircle2,
  //     },
  //     {
  //       label: "Category",
  //       value: todo.category || "Uncategorized",
  //       icon: Tag,
  //     },
  //     {
  //       label: "Recurring",
  //       value: todo.isRecurring
  //         ? `${todo.recurrenceInterval ?? 1} ${todo.recurrencePattern}`
  //         : "Does not repeat",
  //       icon: Repeat,
  //     },
  //     {
  //       label: "Next occurrence",
  //       value: todo.nextOccurrence
  //         ? formatCompleteAt(todo.nextOccurrence)
  //         : todo.isRecurring
  //         ? "Auto-scheduling on complete"
  //         : "—",
  //       icon: AlarmClock,
  //     },
  //     {
  //       label: "Recurrence end",
  //       value: todo.recurrenceEndDate
  //         ? formatDateTime(todo.recurrenceEndDate)
  //         : todo.isRecurring
  //         ? "No end date"
  //         : "—",
  //       icon: Bell,
  //     },
  //   ];
  // }, [todo]);

  if (!todo) {
    return null;
  }
  const handleToggleComplete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleComplete(todo.id! as string | number);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-100 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 transform transition-all duration-300 w-full min-h-screen ${
          isOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
        }`}
        aria-hidden={!isOpen}
        onClick={(e) => {
          // Close when clicking on the backdrop (not on the modal content)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="w-full h-full sm:h-auto sm:max-w-2xl flex flex-col overflow-hidden bg-[#131316] sm:rounded-md border-0 sm:border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end p-2 gap-2 relative">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="text-gray-400 p-2 rounded-md hover:bg-[#1B1B1E] transition-colors cursor-pointer flex items-center justify-center"
                title="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-[#1B1B1E] border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-[#A2A2A9] hover:bg-[#131315] hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(todo.id as string | number);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Trash className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
            <button
              className="text-gray-400 p-2 rounded-md hover:bg-[#1B1B1E] transition-colors cursor-pointer"
              onClick={onClose}
              title="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-start justify-between px-6">
          
            <div className="flex-1">
              <div className="flex items-start justify-start gap-3">
              <div
              className={`group flex items-center justify-center bg-transparent rounded-full p-2 border border-white/10 h-5 w-5 mt-3 font-bold ${
                isEditing
                  ? "border-purple-400 cursor-not-allowed"
                  : "border-white/50 hover:cursor-pointer"
              }`}

            >
            {!isEditing && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <button onClick={handleToggleComplete} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <Check className="h-3 w-3 text-white font-bold" />
                </button>
              </div>
            )}
          </div>
            <div className="flex-1 cursor-text">
              {isEditing ? (
                <>
                <div className="space-y-3 border-2 border-white/10 rounded-md p-2">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    className="w-full text-2xl font-semibold text-white bg-transparent focus:outline-none focus:border-purple-400 pb-2"
                    disabled={isSaving}
                    placeholder="Title"
                  />
                  <textarea
                    ref={descriptionInputRef}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    className="w-full text-sm text-gray-400 bg-transparent focus:outline-none focus:border-purple-400 resize-none min-h-[60px] pb-2"
                    disabled={isSaving}
                    placeholder="Description"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="border border-white/10 bg-[#1B1B1E] text-gray-200 hover:bg-[#222227] disabled:opacity-50 text-xs min-w-[60px] py-1 px-5! rounded-sm!"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#cf4348] text-white hover:bg-red-500 disabled:opacity-50 text-xs min-w-[60px] py-2! px-5! rouded-sm!"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div> 

              </>
              ) : (
                <div onClick={handleStartEdit} className="h-full mb-2">
                  <h2 className="mt-1 text-2xl font-semibold text-white transition-colors">
                    {todo.title}
                  </h2>
                  <h3 className="text-sm text-gray-400 transition-colors mt-2">
                    {todo.description || "No description"}
                  </h3>
                </div>
              )}
            </div>
            </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section className="rounded-2xl bg-[#1B1B1E] p-5">
              <p className={labelClass}>Progress & reminders</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Reminder", active: !!todo.completeAt },
                  { label: "Snoozed", active: false },
                  { label: "Notifications", active: todo.completed },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className={`rounded-full px-3 py-1 text-xs ${
                      chip.active
                        ? "bg-purple-500/20 text-purple-200"
                        : "bg-[#111114] text-gray-500"
                    }`}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-200">
                    <Clock4 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white">
                      Due {formatCompleteAt(todo.completeAt)}
                    </p>
                    {todo.completedAt && (
                      <p className="text-xs text-gray-400">
                        Completed {formatDateTime(todo.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t border-white/10 p-6">
        
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border border-white/10 bg-transparent text-gray-200 hover:bg-white/5"
                >
                  <Bell className="mr-2 h-4 w-4" /> Add Reminder
                </Button>
                <Button
                  variant="ghost"
                  className="bg-[#1B1B1E] text-white hover:bg-[#222227] cursor-pointer"
                  onClick={(e)=>{
                    e.stopPropagation();
                    handleDuplicate(todo);
                    onClose();
                  }}
                >
                  <CopyPlus className="mr-2 h-4 w-4" /> Duplicate
                </Button>
                <Button className="flex-1 justify-center bg-purple-600 text-white hover:bg-purple-500">
                  <Play className="mr-2 h-4 w-4" /> Start Focus Session
                </Button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetailDrawer;
