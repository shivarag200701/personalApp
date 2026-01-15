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
  Pencil,
} from "lucide-react";
import { formatCompleteAt } from "@shiva200701/todotypes";
import api from "../utils/api";
import AddTaskCalender from "./AddTaskCalender";

interface TaskDetailDrawerProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  handleDuplicate: (todo: Todo) => void;
  editAllowed: boolean;

}

const labelClass = "text-xs uppercase tracking-wide text-muted-foreground";

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
  editAllowed,
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
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (todo) {
      setEditedTitle(todo.title);
      setEditedDescription(todo.description || "");
    }
  }, [todo]);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
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
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring || false,
        color: todo.color ?? null,
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
          className="w-full h-full sm:h-auto sm:max-w-2xl flex flex-col overflow-hidden bg-card sm:rounded-md border-0 sm:border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end p-2 gap-2 relative">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="text-muted-foreground p-2 rounded-md hover:bg-muted transition-colors cursor-pointer flex items-center justify-center"
                title="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
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
            {editAllowed && (
              <button
                className="text-muted-foreground p-2 rounded-md hover:bg-muted transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  setIsFormOpen(true);
                }}
                title="Edit"
              >
                <Pencil className="h-5 w-5" />
              </button>
            )}
            {isFormOpen && (
              <AddTaskCalender
                index={0}
                todo={todo}
                preselectedDate={new Date(todo.completeAt || "")}
                onCancel={() => setIsFormOpen(false)}
                onSuccess={onEdit}
                onUpdate={onEdit}
                isEditMode={true}
                width="w-[500px]"
                backgroundColor="bg-secondary"
                
              />
            )}
            <button
              className="text-muted-foreground p-2 rounded-md hover:bg-muted transition-colors cursor-pointer"
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
              className={`group flex items-center justify-center bg-transparent rounded-full p-2 border border-border h-5 w-5 mt-3 font-bold ${
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
                <div className="space-y-3 border-2 border-border rounded-md p-2">
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
                    className="w-full text-sm text-muted-foreground bg-transparent focus:outline-none focus:border-purple-400 resize-none min-h-[60px] pb-2"
                    disabled={isSaving}
                    placeholder="Description"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 text-xs min-w-[60px] py-1 px-5! rounded-sm!"
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
                  <h3 className="text-sm text-muted-foreground transition-colors mt-2">
                    {todo.description || "No description"}
                  </h3>
                </div>
              )}
            </div>
            </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <section className="rounded-2xl bg-card p-5">
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
                        : "bg-secondary text-muted-foreground"
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
                      <p className="text-xs text-muted-foreground">
                        Completed {formatDateTime(todo.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t border-border p-6">
        
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border border-border bg-transparent text-foreground hover:bg-muted"
                >
                  <Bell className="mr-2 h-4 w-4" /> Add Reminder
                </Button>
                <Button
                  variant="ghost"
                  className="bg-card text-white hover:bg-muted cursor-pointer"
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
