import { useState, useRef, useEffect } from "react";
import type { Todo } from "./Modal";
import { Button } from "./ui/button";
import {
  Bell,
  Clock4,
  CopyPlus,
  MoreHorizontal,
  Play,
  Trash2,
  X,
  Check,
  Pencil,
  TextAlignStart,
  Inbox,
  ChevronDown,
  ChevronUp,
  Calendar,
  RefreshCw,
  Flag
} from "lucide-react";
import { formatCompleteAt } from "@shiva200701/todotypes";
import api from "../utils/api";
import AddTaskCalender from "./AddTaskCalender";
import { useSearchParams } from "react-router-dom";
import { useQuery} from "@tanstack/react-query";
import CustomDatePicker from "./CustomDatePicker";
import { roundToNearest15Minutes, getTimeFromDate} from "./InlineTaskForm";
import PriorityPicker from "./PriorityPicker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip"
import { Kbd } from "./ui/kbd";



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
  const [searchParams,setSearchParams] = useSearchParams();
  const [isSmallScreen,setIsSmallScreen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string>(roundToNearest15Minutes(new Date()));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<"daily" | "weekly" | "monthly" | "yearly" | null>(null);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number | null>(null);
  const [priority,setPriority] = useState<"high" | "medium" | "low" | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker,setShowPriorityPicker] = useState(false);
  const dateButtonRef = useRef<HTMLDivElement>(null);
  const hasChangesRef =useRef(false);
  const priorityButtonRef = useRef<HTMLButtonElement>(null)



  // Use useQuery for todos - data is already cached from RequireAuth
  const { data: todos = []} = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await api.get("/v1/todo/");
      return res.data.todos;
    },
  });
  const idArray = todos.map(todo => todo.id)

  const taskIdParam = searchParams.get("task")
  const currentId = taskIdParam ? parseInt(taskIdParam) : null
  const currentIndex = currentId != null ? idArray.indexOf(currentId) : -1;

  const isAtTop = currentIndex <= 0
  const isAtBottom = currentIndex === idArray.length - 1
  const priorityColors = {
    high: "text-red-500",
    medium: "text-blue-500",
    low: "text-green-500",
    undefined: "text-gray-500",
  };

  function getDateFromDate(date: string){
    if(!date) return "";
    if(!todo?.isAllDay){
      const dateObj = new Date(date);
      console.log(dateObj);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }else{
    return date.split("T")[0];
    }
  }

  useEffect(() => {
    console.log(todo);
    if (todo) {
      setSelectedDate(getDateFromDate(todo?.completeAt ?? "")); 
      setIsAllDay(todo.isAllDay ?? true);
    
      if(!todo.isAllDay){
        setSelectedTime(getTimeFromDate(todo?.completeAt ?? ""));
      }
      else {
        setSelectedTime(roundToNearest15Minutes(new Date()));
      }
    const initPriority = (todo.priority as "high" | "medium" | "low") ?? null;
    setPriority(initPriority);
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

  useEffect(()=>{
    const handleResize=()=>{
      setIsSmallScreen(window.innerWidth<750)
    }
    handleResize()
    window.addEventListener('resize',handleResize)
  },[])

  const combineDateAndTime = (date: string, time: string) => {
    let dateObj
    if(!date || !time) return "";
    const [year, month, day] = date.split('-').map(Number);
    dateObj = new Date(year, month - 1, day);
    
    const [hours, minutes] = time.split(":").map(Number);

    dateObj.setHours(hours, minutes, 0, 0);

    return dateObj.toISOString();
  }

  

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
    
    // setIsSaving(true);
    try {

      const updatedTodo: Todo = {
        ...todo,
        title: editedTitle,
        description:editedDescription
      }
      onEdit(updatedTodo)
      setIsEditing(false);
      const payload: any = {
        title: editedTitle,
        description: editedDescription,
        completeAt: todo.completeAt,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring || false,
        color: todo.color ?? null,
        isAllDay: todo.isAllDay ?? null,

      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
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
  const formatDate = (isoDate:string|null) => {
    if (!isoDate)return

    const date = new Date(isoDate)

    const formattedDate = date.toLocaleDateString('en-Us',{
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return formattedDate.replace(',',' ').replace(',',' · ')

  }

  const handleBefore = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("task",String(idArray[currentIndex - 1]))
    setSearchParams(params,{replace:false})
  }

  const handleAfter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("task",String(idArray[currentIndex + 1]))
    setSearchParams(params,{replace:false})
  
  }
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };


  const convertDateTime = (dateStr:string|null,time:string|null): string | null => {
    if (!dateStr) return null;

    if(!todo.isAllDay && !time) return null

    if(!todo?.isAllDay){
      dateStr = dateStr.split("T")[0];
    }
    // Parse YYYY-MM-DD string as local date (not UTC)
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);

    //timelabel
    const timeLabel = formatTime(time)

  return timeLabel ? `${selectedDate.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year:'numeric' }).replaceAll(",","")} ${timeLabel}` : `${selectedDate.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year:'numeric' }).replaceAll(",","")} 11:59 PM`
    }

    
    const getReccurenceLabel= ():string|null =>{
      let reccurenceLabel = ""
      const date = new Date(selectedDate)
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dayOrdinal = getOrdinal(date.getDate())
      const month = date.toLocaleDateString('en-US', { month: 'long' });
  
      if(todo.isRecurring){
        const reccurencePatten = todo.recurrencePattern
        switch(reccurencePatten){
          case "daily":
            reccurenceLabel = todo?.isAllDay ? 'every day' : `every day at ${formatTime(selectedTime)}`
            break;
          
          case "weekly":
            reccurenceLabel = todo?.isAllDay ? `every ${day}` : `every ${day} at ${formatTime(selectedTime)}`
            break;
          
          case "monthly":
            reccurenceLabel = todo?.isAllDay ? `every ${dayOrdinal}` : `every ${dayOrdinal} at ${formatTime(selectedTime)}`
            break;
          
          case "yearly":
            reccurenceLabel = todo?.isAllDay ? `every ${dayOrdinal} ${month}` : `every ${dayOrdinal} ${month} at ${formatTime(selectedTime)}`
            break;

        }
      }
      return reccurenceLabel
    }

  const formatTime = (time:string|null): string | null => {
      let timeLabel = ""
      if(!todo?.isAllDay && time){
        const [hours, minutes] = time.split(":")
        const hour24 = parseInt(hours);
        const ampm = hour24 >= 12 ? "PM" : "AM";
        const hour12 = hour24 % 12 || 12;
        timeLabel = `${hour12}:${minutes} ${ampm}`;
      }
      return timeLabel
  }
    

  const getDateLabel = (dateStr: string | null, time: string | null): string | null => {
    if (!dateStr) return null;

    if(!dateStr && !time) return null

    // console.log(dateStr);
    // console.log("====")
    // console.log(time);
    ;
    
    
    if(!todo?.isAllDay){
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


    const timeLabel = formatTime(time)
    
    if (selectedDate.getTime() === today.getTime()) {
      return !todo?.isAllDay ? `Today ${timeLabel}` : "Today";
    } else if (selectedDate.getTime() === tomorrow.getTime()) {
      return !todo?.isAllDay ? `Tomorrow ${timeLabel}` : "Tomorrow";
    } else {
      // For other dates, return formatted date
      return !todo?.isAllDay ? `${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeLabel}` : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  

  const dayLeft = (dateStr:string | null):string | null =>{
    if(!dateStr) return null

    const today = new Date()
    today.setHours(0,0,0,0)
    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);



    const diffInMs = Math.abs(selectedDate.getTime() - today.getTime())
    const dayDiff = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if(dayDiff == 0)return null
    
    return dayDiff === 1 ? `${dayDiff} day left` : `${dayDiff} days left` 

  }
  

  const handleDateSelect = async (date:string,isQuickAction?:boolean)=>{
    if(!date) return
    let finalDate = date;
    if (!todo?.isAllDay && selectedTime) {
      finalDate = combineDateAndTime(date, selectedTime);
    }
    
    setSelectedDate(finalDate)
    const updatedTodo: Todo = {
      ...todo,
      completeAt: finalDate
    }
    
    onEdit(updatedTodo)
    if(isQuickAction){
    setShowDatePicker(false);
    }
    try{
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: finalDate,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring || false,
        color: todo.color ?? null,
        isAllDay: todo.isAllDay ?? null,

      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    }catch(error){
      console.error("error updating the date",error);
      
    }

  }
  const handleNoDate = async() => {
    setSelectedDate("");
    setIsRecurring(false);
    setIsAllDay(true)
    setSelectedTime(roundToNearest15Minutes(new Date()))
    const updatedTodo: Todo = {
      ...todo,
      completeAt: null,
      isRecurring:false,
      isAllDay: true,
      recurrencePattern:null,
      recurrenceInterval:null,
      recurrenceEndDate:null
    }
    onEdit(updatedTodo);
    try{
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: null,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: false,
        recurrencePattern:null,
        recurrenceInterval:null,
        recurrenceEndDate:null,
        color: todo.color ?? null,
        isAllDay: true,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    }catch(error){
      console.error("error updating the time", error);
    }
  };
  const handleNoTime = async() => {
    setSelectedTime(roundToNearest15Minutes(new Date()))
    setIsAllDay(true)
    const updatedTodo: Todo = {
      ...todo,
      completeAt: selectedDate,
      isRecurring: isRecurring,
      isAllDay: true,
      recurrencePattern:recurrencePattern,
      recurrenceInterval:recurrenceInterval,
      recurrenceEndDate:recurrenceEndDate
    }
    onEdit(updatedTodo);
    try{
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: selectedDate,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: isRecurring,
        recurrencePattern:recurrencePattern,
        recurrenceInterval:recurrenceInterval,
        recurrenceEndDate:recurrenceEndDate,
        color: todo.color ?? null,
        isAllDay: true,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    }catch(error){
      console.error("error updating the time", error);
    }
  }

  const handleTimeSave = async () => {
    if (!selectedTime || !selectedDate) return;
    
    // Get the date part (YYYY-MM-DD) from selectedDate
    const datePart = selectedDate.includes("T") 
      ? selectedDate.split("T")[0] 
      : selectedDate;
    
    const combinedDate = combineDateAndTime(datePart, selectedTime);
    setSelectedDate(combinedDate);
    setIsAllDay(false)
    
    const updatedTodo: Todo = {
      ...todo,
      completeAt: combinedDate,
      isAllDay: false
    }
    
    onEdit(updatedTodo);

    try {
      const payload: any = {
        title: todo.title,
        description: todo.description,
        completeAt: combinedDate,
        category: todo.category,
        priority: todo.priority ?? null,
        isRecurring: todo.isRecurring || false,
        color: todo.color ?? null,
        isAllDay: false,
      };

      if (todo.isRecurring) {
        payload.recurrencePattern = todo.recurrencePattern;
        payload.recurrenceInterval = todo.recurrenceInterval;
        if (todo.recurrenceEndDate) {
          payload.recurrenceEndDate = todo.recurrenceEndDate;
        }
      }

      await api.put(`/v1/todo/${todo.id}`, payload);
    } catch (error) {
      console.error("error updating the time", error);
    }
  };

  const handlePrioritySelect = async(priority:"high" | "medium" | "low" | null) => {
    if(!priority)return

    setPriority(priority)

    const updatedTodo: Todo = {
      ...todo,
      priority:priority
    }
    onEdit(updatedTodo)
      try {
        const payload: any = {
          title: todo.title,
          description: todo.description,
          completeAt: todo.completeAt,
          category: todo.category,
          priority: priority,
          isRecurring: todo.isRecurring || false,
          color: todo.color ?? null,
          isAllDay: todo.isAllDay,
        };
  
        if (todo.isRecurring) {
          payload.recurrencePattern = todo.recurrencePattern;
          payload.recurrenceInterval = todo.recurrenceInterval;
          if (todo.recurrenceEndDate) {
            payload.recurrenceEndDate = todo.recurrenceEndDate;
          }
        }
  
        await api.put(`/v1/todo/${todo.id}`, payload);
    }catch(error){
      console.error("error updating the priority",error);
      
    }
  }

  const handleRecurringSelect = async(config: {
    isRecurring: boolean;
    recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurrenceInterval?: number;
    recurrenceEndDate?: string | null}) => {      
      if(!config) return
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
      
      const updatedTodo:Todo ={
        ...todo,
        isRecurring:config.isRecurring,
        recurrencePattern:config.recurrencePattern,
        recurrenceInterval:config.recurrenceInterval,
        recurrenceEndDate:config.recurrenceEndDate
      }
      onEdit(updatedTodo)
      try {
        const payload: any = {
          title: todo.title,
          description: todo.description,
          completeAt: todo.completeAt,
          category: todo.category,
          priority: todo.priority ?? null,
          isRecurring: config.isRecurring || false,
          recurrencePattern: config.recurrencePattern,
          recurrenceInterval: config.recurrenceInterval,
          recurrenceEndDate: config.recurrenceEndDate,
          color: todo.color ?? null,
          isAllDay: false,
        };
    
        await api.put(`/v1/todo/${todo.id}`, payload);
      } catch (error) {
        console.error("error updating the time", error);
      }
  }

  
  

  const dateLabel = getDateLabel(selectedDate,selectedTime)
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
          className="w-full h-full sm:h-[800px] lg:min-w-4xl lg:max-w-4xl  flex flex-col overflow-hidden bg-card sm:rounded-md border-0 shadow-2xl m-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-2 gap-1.5 relative">
            <div className="pl-2 flex gap-1.5">
              <div className="flex items-center justify-center">
              <Inbox size={17} className="text-muted-foreground"/>
              </div>
              <span className="text-muted-foreground text-[13px]">Inbox</span>
            </div>
            <div className="flex gap-2">
            <button className={`text-muted-foreground p-2 rounded-md  transition-colors cursor-pointer disabled:cursor-not-allowed ${isAtTop ? "opacity-10 hover:none" : "hover:bg-muted"}`}
            onClick={handleBefore}
            disabled={isAtTop}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                    <ChevronUp className="h-5 w-5" strokeWidth={1} style={{ transform: 'scale(1.3)' }}/>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                  <div className="flex items-center gap-2 ">
                    Previous Task<Kbd>K</Kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            
            </button>
            <button className={`text-muted-foreground p-2 rounded-md hover:bg-muted transition-colors cursor-pointer ${isAtBottom ? "opacity-10 hover:none" : "hover:bg-muted"}`}
            onClick={handleAfter}
            disabled={isAtBottom}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ChevronDown className="w-5 h-5" strokeWidth={1} style={{ transform: 'scale(1.3)'}}/>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                  <div className="flex items-center gap-2 ">
                    Next Task<Kbd>J</Kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className={`text-muted-foreground p-2 rounded-md hover:bg-muted transition-colors cursor-pointer flex items-center justify-center ${isDropdownOpen && 'bg-muted'}`}
                title="More options"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MoreHorizontal className="h-5 w-5 p-0 m-0" style={{ transform: 'scale(1.3)' }} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More options</p>
                  </TooltipContent>
                </Tooltip>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-70 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="flex flex-col">
                  <div className="w-full px-3 py-2">
                    <span className="text-muted-foreground text-[13px]">Added on {formatDate(todo?.createdAt)}</span>
                  </div>
                  <div className="h-px bg-muted"/>
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-secondary hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(todo.id as string | number);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-[13px]">Delete</span>
                  </button>
                  </div>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <X className="h-5 w-5 p-0 m-0" strokeWidth={1} style={{ transform: 'scale(1.3)' }} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close task</p>
                </TooltipContent>
              </Tooltip>
            </button>
            </div>
          </div>
          <div className="h-[1.5px] bg-secondary"/>
          <div className=" grid grid-cols-1 md:grid-cols-[1fr_250px] flex-1 min-h-0">
            <div className="flex flex-col justify-between">
            <div>
            <div className="flex items-start justify-between px-6 mt-2">
            
              <div className="flex-1">
                <div className="flex items-start justify-start gap-3">
                <div
                className={`group flex items-center justify-center  rounded-full p-2  h-5 w-5 mt-3 font-bold border-2  ${
                  isEditing
                    ? "opacity-90 cursor-not-allowed"
                    : priority === "high" ? "border-red-500" : priority === "medium" ? "border-blue-500" : priority === "low" ? "border-green-500" : "border-gray-500"
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
                    <div className="relative">
                      {editedDescription === "" && (
                      <div className="absolute top-0 left-0  flex items-center gap-1 text-gray-400 pointer-events-none">
                        <TextAlignStart size={10} />
                        <span>Description</span>
                      </div>
                    )}
                    <textarea
                      ref={descriptionInputRef}
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      className="w-full  text-sm text-muted-foreground bg-transparent focus:outline-none focus:border-purple-400 resize-none min-h-[60px] pb-2"
                      disabled={isSaving}
                    />
                    </div>
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
                    <h2 className="mt-1 text-2xl font-bold text-foreground transition-colors">
                      {todo.title}
                    </h2>
                    <h3 className="text-sm text-muted-foreground transition-colors mt-2">
                      {todo.description || <div className="flex gap-1">
                        <div className="flex justify-center items-center">
                        <TextAlignStart size={15} className=""/>
                        </div>
                        <span>Description</span>
                        </div>}
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
            {!isSmallScreen &&(<div className={`text-white bg-sidebar ${isEditing ? "opacity-50" : "opacity-100"} w-full p-4 px-5`}>
              <div className="flex flex-col">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] text-muted-foreground font-medium">Project</span>
                  <button className={`flex justify-between gap-2 p-1 px-2  ${!isEditing && "dark:hover:bg-accent/30 hover:bg-accent/10"} rounded-sm duration-300 transition-all group ${isEditing ? "cursor-not-allowed" : "cursor-pointer"} `}>
                    <div className="flex gap-2">
                    <div className="flex items-center justify-center">
                    <Inbox size={15} className="text-muted-foreground"/>
                    </div>
                    <div className="flex justify-center items-center">
                    <span className="text-muted-foreground text-[13px] font-light">Inbox</span>
                    </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ChevronDown className="group-hover:block hidden" size={15} />
                    </div>
                  </button>
                  <div className="h-[1.5px] bg-secondary"/>
                  <div ref={dateButtonRef}>
                  <span className={`text-[13px] text-muted-foreground font-medium`}>
                  Date
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDatePicker(!showDatePicker);
                    }}
                    className={`px-2 py-1.5 text-xs font-medium rounded-sm duration-300 transition-all group  focus:outline-none focus-visible:ring-3 focus-visible:ring-purple-400 shrink-0
                    relative w-full
                    ${!isEditing && "[&:not(:has(.clear-icon:hover))]:hover:bg-accent/10 dark:[&:not(:has(.clear-icon:hover))]:hover:bg-accent/30 "}
                    ${isEditing ? "cursor-not-allowed" : "cursor-pointer"} 
                    ${showDatePicker && "dark:bg-accent/30 bg-accent/10"}
                    `}
                  >
                    <div className="flex justify-between">
                      <div className="flex gap-2 items-center justify-center">
                        <Calendar size={15} className={`${true ? "text-green-500" : "text-white"}`}/>
                        <div className="flex gap-3">
                        {dateLabel && <span className="whitespace-nowrap max-w-[100px] text-muted-foreground text-[12px] font-light">{dateLabel}</span>}
                        <div className="flex items-center justify-center text-muted-foreground">
                        {isRecurring && <RefreshCw size={10} />}
                        </div>
                        </div>
                      </div>
                      <div>
                      <div className="flex items-center justify-center">
                          <span
                          // Note: Change 'clear-icon' to 'clear-icon-wrapper' in the parent :has selector
                          className={`clear-icon flex items-center justify-center 
                                     opacity-0 ${!isEditing && 'group-hover:opacity-100'}
                                     p-2 rounded-sm bottom-0 top-0 right-0
                                     duration-200 transition-all absolute
                                     dark:hover:bg-accent/30
                                     hover:bg-accent/10
                                     `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNoDate();
                          }}
                        >
                          {/* The X icon stays small and centered */}
                          <X size={13} /> 
                        </span>
                      </div>
                      </div>
                    </div>
                    </button>
                    </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-white gap-2">
                      <p className="text-[12px]">{convertDateTime(selectedDate,selectedTime)}</p>
                      <p>{dayLeft(selectedDate)}</p>
                      <p className="text-[11px] mb-2">{getReccurenceLabel()}</p>
                      <div className="h-px bg-ring "/>
                    </div>
                  </TooltipContent>
                  </Tooltip>
                  
                  </div>
                  <div className="h-[1.5px] bg-secondary"/>
                  <span className="text-[13px] text-muted-foreground font-medium">Priority</span>
                  <button className={`flex justify-between gap-2 p-1 px-2 ${!isEditing && "dark:hover:bg-accent/30 hover:bg-accent/10"}
                  ${isEditing ? "cursor-not-allowed" : "cursor-pointer"}  rounded-sm duration-300 transition-all group active:bg-accent/30
                  ${showPriorityPicker ? "dark:bg-accent/30 bg-accent/10" : ""}
                  `}
                  ref={priorityButtonRef}
                  onClick={() => setShowPriorityPicker(!showPriorityPicker)}
                  >
                    <div className="flex gap-2">
                    <div className="flex items-center justify-center">
                    <Flag size={15} className={`${priority ? priorityColors[priority] : "text-gray-500"}`}
                    style={{fill: priority === "high" ? "#DC2828":
                                  priority === "medium" ? "#3B82F6":
                                  priority === "low" ? "#28A745" : "none"
                    }}
                    />
                    </div>
                    <div className="flex justify-center items-center">
                    <span className="text-muted-foreground text-[13px] font-light">{priority ? priority : "None"}</span>
                    </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ChevronDown className={`${!isEditing  && 'group-hover:opacity-100' } opacity-0 ${showPriorityPicker ? 'opacity-100' : ''}`} size={15} />
                    </div>
                  </button>

                </div>
              </div>
            </div>
            )}
          </div>
        </div>
        </div>
        {showDatePicker && (
            <CustomDatePicker
              todo={todo}
              isAllDay={isAllDay}
              todos={todos}
              selectedDate={selectedDate}
              setIsAllDay={setIsAllDay}
              selectedTime={selectedTime}
              isRecurring={isRecurring}
              setIsRecurring={setIsRecurring}
              recurrencePattern={recurrencePattern}
              setRecurrencePattern={setRecurrencePattern}
              onTimeSelect={(time: string) => {
                setSelectedTime(time)
                hasChangesRef.current = true;
              }}
              onDateSelect={(date: string,isQuickAction?:boolean) => {
                if(isQuickAction){
                handleDateSelect(date,isQuickAction)
                }else{
                  handleDateSelect(date)
                }
                hasChangesRef.current = true;
              }}
              onRecurringSelect={(config) => {                
                handleRecurringSelect(config)
                hasChangesRef.current = true;
              }}
              onClose={() => setShowDatePicker(false)}
              buttonRef={dateButtonRef}
              onSave={handleTimeSave}
              noTimeSelect={handleNoTime}
            />
          )}
          {showPriorityPicker && (
            <PriorityPicker
              selectedPriority={priority}
              onPrioritySelect={(newPriority) => {
                setShowPriorityPicker(false);
                handlePrioritySelect(newPriority)
                hasChangesRef.current = true;
              }}
              onClose={() => setShowPriorityPicker(false)}
              buttonRef={priorityButtonRef}
            />
          )}
    </>
  );
};

export default TaskDetailDrawer;
