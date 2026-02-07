import { useState,useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import type { Todo } from "./Modal";
import AddTaskCalender from "./AddTaskCalender";

interface CalendarViewProps {
  todos: Todo[];
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  onEdit: (todo: Todo) => void;
  onUpdateTodo: (todo: Todo) => void;
  onAddTask: (preselectedDate?: string) => void;
  onViewDetails: (todo: Todo) => void;
  onTaskCreated?: (todo: Todo) => void;
  onDuplicateTask: (todo: Todo) => void;
  onTaskUpdated: (todo: Todo) => void;
}

const CalendarView = ({
  todos,
  onViewDetails,
  onTaskCreated,
  onTaskUpdated,
  onToggleComplete
}: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [openFormDate, setOpenFormDate] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [isViewingMoreTasks, setIsViewingMoreTasks] = useState(false);
  const [viewMoreTasks, setViewMoreTasks] = useState<Todo[]>([]);
  const [viewMoreDate, setViewMoreDate] = useState<Date | null>(null);
  const [viewMorePosition, setViewMorePosition] = useState<{ top: number; left: number } | null>(null);
  // const calendarRef = useRef<HTMLDivElement|null>(null);
  const topRef = useRef<HTMLDivElement|null>(null)
  const bottomRef = useRef<HTMLDivElement|null>(null)




  //visible month 
  const [visibleMonths,setVisibleMonths] = useState<Date[]>(()=>{
    let months: Date[] = []
    const today = new Date()
    today.setHours(0,0,0,0)
    for(let i =-1;i<=2;i++){
      let date = new Date(today)
      date.setMonth(date.getMonth() + i)
      date.setDate(1)
      date.setHours(0,0,0,0)
      months.push(date)
    }
    return months
  })

  // const [visibleMonthIndex,setVisibleMonthIndex] = useState<number>(1);
  const monthsRefs = useRef<Map<string,HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMonths = useRef(false);

  const getCalenderDaysForMonth = useCallback((monthDate:Date) => {

    const month = monthDate.getMonth()
    const year = monthDate.getFullYear()
    const monthStart = new Date(year,month,1)
    const monthEnd = new Date(year,month+1,0)
    const days:Date[] = []

    // Get calendar days (including days from previous/next month to fill the grid)
    const startDate = new Date(monthStart)
    const nextMonthStartDate = new Date(year,month+1,1)
    const firstDayOfWeek = startDate.getDay()
    const nextMonthFirstDayOfWeek = nextMonthStartDate.getDay()
    //add previous month days if > 0
    for(let i=firstDayOfWeek-1;i>=0;i--){
      const date = new Date(startDate)
      date.setDate(date.getDate() - (i+1))
      days.push(date)
    }

    //add current month days
    const daysInMonth = monthEnd.getDate()
    for(let i =1;i<=daysInMonth-nextMonthFirstDayOfWeek;i++){
      const date = new Date(monthStart)
      date.setDate(i)
      days.push(date)
    }

    //Add days from nect month to fill last week
    // const remainingDays = 42 - days.length
    // for(let i = 1;i<=remainingDays;i++){
    //   const date = new Date(monthEnd)
    //   date.setDate(date.getDate() + i)
    //   days.push(date)
    // }
    return days;
  },[])

  //Get moth key for refs
  const getMonthKey = useCallback((date:Date) =>{
    return `${date.getFullYear()}-${date.getMonth()}`
  },[])

  const loadMoreMonths = useCallback((direction: 'up' | 'down') => {
    if(isLoadingMonths.current) return
    isLoadingMonths.current = true

    if(direction == "up" && scrollContainerRef.current){
      const firstMonthKey = getMonthKey(visibleMonths[0])
      const firstMonthElement = monthsRefs.current.get(firstMonthKey)

      const container = scrollContainerRef.current
      const scrollTopBefore = container.scrollTop

      let firstMonthOffsetBefore = 0
      if(firstMonthElement){
        const rect = firstMonthElement.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        firstMonthOffsetBefore = rect.top - containerRect.top + scrollTopBefore
        
      }


    setVisibleMonths((prev)=>{
      const newMonths = [...prev]
      
      const months:Date[]=[]
      for(let i=3;i>=1;i--){
        const date = new Date(newMonths[0])
        date.setMonth(date.getMonth()-i)
        date.setDate(1)
        date.setHours(0,0,0,0)
        months.push(date)
    }
    newMonths.unshift(...months)

    return newMonths
    })
    
    //after DOM has updated
    setTimeout(() =>{
      if(firstMonthElement && container){
         // Get the new position of the first month element
         const rect = firstMonthElement.getBoundingClientRect()
         const containerRect = container.getBoundingClientRect()
         const firstMonthOffsetAfter = rect.top - containerRect.top + container.scrollTop
         
         // Calculate how much the element moved
         const offsetDifference = firstMonthOffsetAfter - firstMonthOffsetBefore
         
         // Adjust scroll position to compensate
         container.scrollTop = scrollTopBefore + offsetDifference
      }
      isLoadingMonths.current = false
    },100)
  }
  else {
    setVisibleMonths((prev)=>{
      const newMonths = [...prev]
      
      const months:Date[]=[]
      for(let i=1;i<=3;i++){
        const date = new Date(newMonths[newMonths.length - 1])
        date.setMonth(date.getMonth()+i)
        date.setDate(1)
        date.setHours(0,0,0,0)
        months.push(date)
    }
    newMonths.push(...months)

    return newMonths
    })

    setTimeout(() => {
      isLoadingMonths.current = false
    },100)
  }

  },[visibleMonths,getMonthKey])


  const getTasksForDate = (date: Date): Todo[] => {
    const formatted = date.toLocaleDateString("en-CA");
    
    return todos.filter((todo) => {
      if(!todo.completeAt || todo.completed) return false

      if(todo.isAllDay){
        return todo.completeAt.split("T")[0] === formatted
      }

      //timed todos
      return new Date(todo.completeAt).toLocaleDateString('en-CA') === formatted
    }
      
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isCurrentMonth = (date: Date, monthDate: Date): boolean => {
    return (
      date.getFullYear() === monthDate.getFullYear() &&
      date.getMonth() === monthDate.getMonth()
    );
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);

    const previousMonthKey = getMonthKey(newDate)
    const previousMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(),1)
    previousMonthDate.setHours(0,0,0,0)

    setTimeout(() => {
      const previousMonthElement = monthsRefs.current.get(previousMonthKey)
      if(previousMonthElement && scrollContainerRef.current){
        previousMonthElement.scrollIntoView({ 
          behavior: 'instant', 
          block: 'start',
          inline: 'nearest'
        })
      }
    },100)
  };
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (!scrollContainerRef.current) return;
      
  //     const container = scrollContainerRef.current;
  //     const scrollTop = container.scrollTop;
  //     const containerHeight = container.clientHeight;
  //     const viewportCenter = scrollTop + containerHeight / 2;
      
  //     // Find which month is most visible
  //     let closestMonth: { date: Date; distance: number } | null = null ;
      
  //     monthsRefs.current.forEach((element, key) => {
  //       if (!element) return;
        
  //       const rect = element.getBoundingClientRect();
  //       const containerRect = container.getBoundingClientRect();
  //       const elementTop = rect.top - containerRect.top + scrollTop;
  //       const elementBottom = elementTop + rect.height;
  //       const elementCenter = elementTop + rect.height / 2;
        
  //       // Check if month is in viewport
  //       if (elementBottom >= scrollTop && elementTop <= scrollTop + containerHeight) {
  //         const distance = Math.abs(viewportCenter - elementCenter);
          
  //         if (!closestMonth || distance < closestMonth.distance) {
  //           const [year, month] = key.split('-').map(Number);
  //           closestMonth = {
  //             date: new Date(year, month, 1),
  //             distance
  //           };
  //         }
  //       }
  //     });
      
  //     if (closestMonth) {
  //       const closestDate: Date = closestMonth.date
  //       setCurrentDate(closestDate);
        
  //       // Update visible month index
  //       const index = visibleMonths.findIndex(m => 
  //         m.getFullYear() === closestMonth!.date.getFullYear() &&
  //         m.getMonth() === closestMonth!.date.getMonth()
  //       );
  //       if (index !== -1) {
  //         setVisibleMonthIndex(index);
  //       }
  //     }
      
  //     // Load more months when near edges
  //     const scrollBottom = scrollTop + containerHeight;
  //     const scrollHeight = container.scrollHeight;
  //     const threshold = 1000; // Load more when within 1000px of edge
      
  //     if (scrollTop < threshold) {
  //       loadMoreMonths('up');
  //     } else if (scrollHeight - scrollBottom < threshold) {
  //       loadMoreMonths('down');
  //     }
  //   };
    
  //   const container = scrollContainerRef.current;
  //   if (container) {
  //     container.addEventListener('scroll', handleScroll, { passive: true });
  //     // Initial check
  //     handleScroll();
  //   }
    
  //   return () => {
  //     if (container) {
  //       container.removeEventListener('scroll', handleScroll);
  //     }
  //   };
  // }, [visibleMonths, loadMoreMonths]);
  useEffect(() => {
    if(topRef?.current){
      const observer = new IntersectionObserver((entries) => {
          const entry = entries[0]
          if(entry.isIntersecting){
            loadMoreMonths('up')
          }
          
      })
      observer.observe(topRef?.current)

      return () => {
        observer.disconnect()
      }
    }
  },[loadMoreMonths])

  useEffect(() => {
    if(bottomRef?.current){
      const observer = new IntersectionObserver((entries) => {
          const entry = entries[0]
          if(entry.isIntersecting){
            loadMoreMonths('down')
          }
          
      })
      observer.observe(bottomRef?.current)

      return () => {
        observer.disconnect()
      }
    }
  },[loadMoreMonths])

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);

    const nextMonthKey = getMonthKey(newDate)
    const nextMonthDate = new Date(newDate.getFullYear(), newDate.getMonth(),1)
    nextMonthDate.setHours(0,0,0,0)

    setTimeout(() => {
      const nextMonthElement = monthsRefs.current.get(nextMonthKey)
      if(nextMonthElement && scrollContainerRef.current){
        nextMonthElement.scrollIntoView({ 
          behavior: 'instant', 
          block: 'start',
          inline: 'nearest'
        })
      }
    },100)
  };

  useEffect(()=>{
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMonthKey = getMonthKey(today);
    const monthElement = monthsRefs.current.get(todayMonthKey)
    if (monthElement && scrollContainerRef.current) {
      // Calculate the position relative to the scroll container
      // Scroll to the element
      monthElement.scrollIntoView({ 
        behavior: 'instant', 
        block: 'start',
        inline: 'nearest'
      });
    }
  },[])

  const navigateToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentDate(today);

    const todayMonthKey = getMonthKey(today);
    const todayMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    todayMonthDate.setHours(0, 0, 0, 0);

    setTimeout(() => {
      const monthElement = monthsRefs.current.get(todayMonthKey);
      if (monthElement && scrollContainerRef.current) {
        // Calculate the position relative to the scroll container
        // Scroll to the element
        monthElement.scrollIntoView({ 
          behavior: 'instant', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const getCurrentMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleMonthYearSelect = (year: number, month: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    let newDate: Date;
    
    // If selecting current year and current month, start from today
    if (year === currentYear && month === currentMonth) {
      newDate = new Date(year, month, currentDay);
    } else {
      // Otherwise, start from the 1st of the selected month
      newDate = new Date(year, month, 1);
    }
    
    newDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Only allow selecting today or future dates
    if (newDate >= today || month > currentMonth || year > currentYear) {
      setShowMonthYearPicker(false);
      setCurrentDate(newDate);
    }
  };

  // Generate years (current year and future years only)
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // Generate months
  const getMonths = (selectedYear: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const allMonths = [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' },
    ];

    // If selected year is current year, show current month and future months
    if (selectedYear === currentYear) {
      return allMonths.filter(month => month.value >= currentMonth);
    }
    
    // For future years, show all months
    return allMonths;
  };

  const isPastDate = (year: number, month: number): boolean => {
    const today = new Date();
    if (month === today.getMonth() && year === today.getFullYear()) {
      return false;
    }
    const date = new Date(year, month, 1);
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowMonthYearPicker(false);
      }
    };

    if (showMonthYearPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthYearPicker]);

  const viewMoreModalStyle = viewMorePosition
    ? {
        top: `${viewMorePosition.top}px`,
        left: `${viewMorePosition.left}px`,
        transform: "translate(-50%, -50%)",
      }
    : {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    

  const renderMonthCalender = (monthDate:Date) => {
    const calenderDays = getCalenderDaysForMonth(monthDate)
    const monthKey = getMonthKey(monthDate)
    return (
      <div
        key={monthKey}
        ref={(el) => {
          if(el) {
            monthsRefs.current.set(monthKey,el)
          }
        }} 
        data-month-key={monthKey}
      >
        {/* calender grid */}
        <div className="relative bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="grid grid-cols-7">
          {calenderDays.map((date,index) => {
            const dayTasks = getTasksForDate(date)
            const isTodayDate = isToday(date)
            const isCurrentMonthDate = isCurrentMonth(date, monthDate);
            const dateKey = date.toISOString();
            const isFormOpen = openFormDate === dateKey;
            return (
              <div 
              key={dateKey}
              onClick={(e) => {
                e.stopPropagation()
                setOpenFormDate(dateKey)
              }}
              ref={(el) => {
                if(el){
                  dayRefs.current.set(dateKey,el)
                }
              }}
              className={`max-h-[170px] min-h-[170px] p-1 transition-all relative z-10 border-r border-t border-foreground/10`}
              >
                <div className="flex items-center justify-end text-foreground">
                  <div className={`text-sm font-semibold mt-1 mb-2 rounded-lg flex items-center justify-center p-1 ${date.getDate() != 1 ? 'w-7 h-7 ':''}
                    ${isTodayDate
                     ? 'bg-accent text-white': 
                     isCurrentMonthDate ? 
                     "text-foreground" : 
                     "text-muted-foreground" 
                     }`} 
                     >
                    {date.getDate() == 1 ? date.toLocaleString('en-CA',{month:"short",day:"numeric"}):date.getDate()}
                  </div>
                </div>
                <div className="mb-5">
                  {dayTasks.slice(0,3).map((todo) => (
                    <div
                    key={todo.id || `todo-${index}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(todo)
                    }}
                    className={`text-xs flex p-1 my-0.5 cursor-pointer rounded-xs transition-opacity line-clamp-1 text-foreground bg-foreground/20 opacity-70 hover:opacity-100 gap-2`}
                    title={todo.title}
                    >
                      <button className={`rounded-full border-2 h-5 w-5 border-border shrink-0 group cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if(todo.id){
                          onToggleComplete(todo.id)
                        }
                      }}
                      >
                        <Check className="w-4 h-4 group-hover:block hidden text-foreground"/>
                      </button>
                      <div className="font-bold truncate w-full">
                      {todo.title}
                      </div>
                    </div>
                  ))}

                  {dayTasks.length > 3 && (
                    <button
                    type="button"
                    className="text-xs text-muted-foreground my-0.5 px-1.5 rounded-xs hover:bg-options-hover transition-colors cursor-pointer p-1 w-full text-left"
                    onClick={(e) => {
                      e.stopPropagation()
                      const anchor = dayRefs.current.get(dateKey)
                      if(anchor){
                        const rect = anchor.getBoundingClientRect()
                        const position = {top:rect.top + window.scrollY + rect.height/2,left:rect.left + window.scrollX + rect.height/2}
                        setViewMorePosition(position)
                        setIsViewingMoreTasks(true)
                        setViewMoreTasks(dayTasks)
                        setViewMoreDate(date)
                      }else{
                        setViewMorePosition(null)
                      }
                        setIsViewingMoreTasks(true)
                        setViewMoreTasks(dayTasks)
                        setViewMoreDate(date)
                    }}
                    >
                      {dayTasks.length -3} more
                    </button>
                  )}
                </div>
                {isCurrentMonthDate && (
                  <div>
                    {isFormOpen && (
                      <div
                      className='z-50 bg-card'
                          style={{
                            top: '100px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                      >
                        <div className={`transition-all duration-3000 z-50 ${isFormOpen ? "translate-x-0" : "translate-x-full"}`}>
                            <AddTaskCalender
                              width="w-[500px]"
                              backgroundColor="bg-secondary"
                              index={dayTasks.length}
                              preselectedDate={date}
                              onCancel={() => setOpenFormDate(null)}
                              onSuccess={(todo) => {
                                if (onTaskCreated) {
                                  onTaskCreated(todo);
                                }
                                setOpenFormDate(null);
                              }}
                              onUpdate={(todo) => {
                                if (onTaskUpdated) {
                                  onTaskUpdated(todo);
                                }
                                setOpenFormDate(null);
                              }}
                            />
                          </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          }
          )}

        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col relative h-full">
      {/* Header - Sticky */}
      <div className="flex justify-between items-center sticky top-0 z-30 mb-3">
        <div className="flex items-center gap-4">
          <div className="absolute left-0" ref={pickerRef}>
            <div
              className="flex items-center gap-2 text-muted-foreground transition-colors px-3 py-1.5 rounded-lg  font-bold"
            >
              <span className="text-lg">{getCurrentMonthYear()}</span>
            </div>

            {/* Month/Year Picker Dropdown - same as before */}
            {showMonthYearPicker && (
              <div className="absolute top-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50  min-w-[280px] max-w-[90vw] sm:min-w-[320px]">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-white text-sm font-semibold mb-3 text-center">Month</div>
                    <div className="grid grid-cols-3 gap-2 overflow-hidden">
                      {getMonths(currentDate.getFullYear()).map((month) => {
                        const isSelected = currentDate.getMonth() === month.value;
                        const isDisabled = isPastDate(currentDate.getFullYear(), month.value);

                        return (
                          <button
                            key={month.value}
                            onClick={() => {
                              if (!isDisabled) {
                                handleMonthYearSelect(currentDate.getFullYear(), month.value);
                              }
                            }}
                            disabled={isDisabled}
                            className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 cursor-pointer"
                                : isDisabled
                                ? "text-[#4A4A4A] cursor-not-allowed opacity-40"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95"
                            }`}
                          >
                            {month.label.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-white text-sm font-semibold mb-3 text-center">Year</div>
                    <div className="max-h-56 overflow-y-auto overflow-x-hidden no-scrollbar space-y-1">
                      {getYears().map((year) => {
                        const isSelected = currentDate.getFullYear() === year;
                        const isCurrentYear = year === new Date().getFullYear();

                        return (
                          <button
                            key={year}
                            onClick={() => {
                              const today = new Date();
                              const monthToUse = isCurrentYear
                                ? Math.max(currentDate.getMonth(), today.getMonth())
                                : currentDate.getMonth();
                              handleMonthYearSelect(year, monthToUse);
                            }}
                            className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all text-left cursor-pointer ${
                              isSelected
                                ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 font-semibold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-[#9EA0BB] text-xs text-center">
                    Only future dates are available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={navigatePrevious}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 rounded-lg hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={navigateToToday}
            className="text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-4 py-2 rounded-lg hover:bg-muted text-sm font-medium cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={navigateNext}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 rounded-lg hover:bg-muted cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex w-full border-b">
          {weekDays.map((day)=>(
            <div className="text-muted-foreground text-sm font-semibold text-center py-1 flex-1">
              {day}
            </div>
          ))}
      </div>

      {/* Scrollable Calendar Container */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-hidden overflow-y-auto no-scrollbar h-[calc(100vh-190px)]"
      >
        <div className="text-3xl text-white" ref={topRef}></div>
        <div className="">
          {visibleMonths.map((monthDate) => renderMonthCalender(monthDate))}
        </div>
        <div className="text-3xl text-white" ref={bottomRef}></div>
      </div>

      {/* View More Tasks Modal - same as before */}
      {isViewingMoreTasks && viewMoreDate && (
        <>
          <div
            className="fixed inset-0 bg-transparent z-50"
            onClick={() => {
              setIsViewingMoreTasks(false);
              setViewMoreTasks([]);
              setViewMoreDate(null);
              setViewMorePosition(null);
            }}
          />
          <div
            className="fixed z-80 w-full max-w-xs"
            style={viewMoreModalStyle}
          >
            <div className="relative w-full rounded-[32px] bg-card shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-border p-4">
              <button
                type="button"
                className="absolute right-5 top-5 text-muted-foreground hover:bg-options-hover p-2 rounded-sm cursor-pointer"
                onClick={() => {
                  setIsViewingMoreTasks(false);
                  setViewMoreTasks([]);
                  setViewMoreDate(null);
                  setViewMorePosition(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center text-xs font-semibold tracking-[0.2em] text-foreground mb-2 uppercase">
                {viewMoreDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
              </div>
              <div className="text-center text-5xl font-semibold text-foreground mb-5">
                {viewMoreDate.getDate()}
              </div>
              <div className="space-y-2 max-h-[260px] pr-1">
                {viewMoreTasks.map((todo) => (
                  <button
                    key={todo.id}
                    type="button"
                    className="w-full rounded-xl bg-[#3B82F6] text-left px-4 py-2 text-sm text-black font-medium hover:bg-[#60A5FA] transition-colors cursor-pointer"
                    onClick={() => {
                      onViewDetails(todo);
                      setIsViewingMoreTasks(false);
                      setViewMoreTasks([]);
                      setViewMoreDate(null);
                      setViewMorePosition(null);
                    }}
                  >
                    {todo.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  // return (
  //   <div className="flex-col relative overflow-auto no-scrollbar"
  //   ref={calendarRef}
  //   >
  //     {/* Header */}
  //     <div className="flex justify-between items-center overflow-hidden sticky top-0 z-10 bg-card">
  //       <div className="flex items-center gap-4">
  //         <div className="absolute left-0" ref={pickerRef}>
  //           <div
  //             className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted font-bold"
  //             onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
  //           >
  //             <span className="text-lg">{getCurrentMonthYear()}</span>
  //             <ChevronDown
  //               className={`w-5 h-5 transition-transform ${showMonthYearPicker ? "rotate-180" : ""}`}
  //             />
  //           </div>

  //           {/* Month/Year Picker Dropdown */}
  //           {showMonthYearPicker && (
  //             <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 min-w-[280px] max-w-[90vw] sm:min-w-[320px]">
  //               <div className="grid grid-cols-2 gap-6">
  //                 {/* Month Selector */}
  //                 <div>
  //                   <div className="text-white text-sm font-semibold mb-3 text-center">Month</div>
  //                   <div className="grid grid-cols-3 gap-2 overflow-hidden">
  //                     {getMonths(currentDate.getFullYear()).map((month) => {
  //                       const isSelected = currentDate.getMonth() === month.value;
  //                       const isDisabled = isPastDate(currentDate.getFullYear(), month.value);

  //                       return (
  //                         <button
  //                           key={month.value}
  //                           onClick={() => {
  //                             if (!isDisabled) {
  //                               handleMonthYearSelect(currentDate.getFullYear(), month.value);
  //                             }
  //                           }}
  //                           disabled={isDisabled}
  //                           className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center cursor-pointer ${
  //                             isSelected
  //                               ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 cursor-pointer"
  //                               : isDisabled
  //                               ? "text-[#4A4A4A] cursor-not-allowed opacity-40"
  //                               : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95"
  //                           }`}
  //                         >
  //                           {month.label.slice(0, 3)}
  //                         </button>
  //                       );
  //                     })}
  //                   </div>
  //                 </div>

  //                 {/* Year Selector */}
  //                 <div>
  //                   <div className="text-white text-sm font-semibold mb-3 text-center">Year</div>
  //                   <div className="max-h-56 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
  //                     {getYears().map((year) => {
  //                       const isSelected = currentDate.getFullYear() === year;
  //                       const isCurrentYear = year === new Date().getFullYear();

  //                       return (
  //                         <button
  //                           key={year}
  //                           onClick={() => {
  //                             const today = new Date();
  //                             const monthToUse = isCurrentYear
  //                               ? Math.max(currentDate.getMonth(), today.getMonth())
  //                               : currentDate.getMonth();
  //                             handleMonthYearSelect(year, monthToUse);
  //                           }}
  //                           className={`w-full px-4 py-2.5 text-sm rounded-lg transition-all text-left cursor-pointer ${
  //                             isSelected
  //                               ? "bg-purple-500 text-white shadow-md shadow-purple-500/30 font-semibold"
  //                               : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
  //                           }`}
  //                         >
  //                           {year}
  //                         </button>
  //                       );
  //                     })}
  //                   </div>
  //                 </div>
  //               </div>
  //               <div className="mt-4 pt-4 border-t border-border">
  //                 <div className="text-[#9EA0BB] text-xs text-center">
  //                   Only future dates are available
  //                 </div>
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //       <div className="flex items-center gap-1 sm:gap-2">
  //         <button
  //           onClick={navigatePrevious}
  //           className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 rounded-lg hover:bg-muted cursor-pointer"
  //         >
  //           <ChevronLeft className="w-5 h-5" />
  //         </button>
  //         <button
  //           onClick={navigateToToday}
  //           className="text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-4 py-2 rounded-lg hover:bg-muted text-sm font-medium cursor-pointer"
  //         >
  //           Today
  //         </button>
  //         <button
  //           onClick={navigateNext}
  //           className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2 rounded-lg hover:bg-muted cursor-pointer"
  //         >
  //           <ChevronRight className="w-5 h-5" />
  //         </button>
  //       </div>
  //     </div>
  //     {/* Week Day Headers */}
  //     <div className="flex w-full border-b sticky top-[36px] z-10 bg-card"
  //     >
  //         {weekDays.map((day) => (
  //           <div
  //             key={day}
  //             className='text-muted-foreground text-sm font-semibold text-center py-2 flex-1'
  //           >
  //             {day}
  //           </div>
  //         ))}
  //       </div>

  //     {/* Calendar Grid */}
  //     <div 
  //     className="relative bg-card/80 backdrop-blur-xl  rounded-2xl overflow-hiiden">
  //       {/* Backdrop - appears when form is open, covers the calendar */}
  //       {openFormDate && (
  //         <div
  //           className="absolute inset-0 bg-transparent  z-40 rounded-2xl"
  //           onClick={() => setOpenFormDate(null)}
  //         />
  //       )}
        

  //       {/* Calendar Days */}
  //       <div className="grid grid-cols-7">
  //         {calendarDays.map((date, index) => {
  //           const dayTasks = getTasksForDate(date);
  //           const isTodayDate = isToday(date);
  //           const isCurrentMonthDate = isCurrentMonth(date);
  //           const dateKey = date.toISOString();
  //           const isFormOpen = openFormDate === dateKey;
  //           const rowIndex = Math.floor(index / 7);
  //           const colIndex = index % 7;
  //           const isLastRow = rowIndex === Math.floor((calendarDays.length - 1) / 7);

  //           return (
  //             <div  
  //               key={index}
  //               className={`max-h-[170px] min-h-[170px] p-1 transition-all relative z-10 ${colIndex < 6 ? "border-r border-border" : ""} ${
  //                 !isLastRow ? "border-b border-border" : ""
  //               }`}
  //               onClick={(e) => {
  //                   e.stopPropagation();
  //                   setOpenFormDate(dateKey);
  //               }}
  //               ref={(el) => {
  //                 if (el) {
  //                   dayRefs.current.set(dateKey, el);
  //                 }
  //               }}

  //             >
  //               {/* Date Number */}
  //               <div className="flex items-center justify-end">
  //               <div
  //                 className={`text-sm font-semibold mt-1 mb-2 w-7 h-7  rounded-md flex items-center justify-center ${
  //                   isTodayDate
  //                     ? "bg-purple-500 text-white"
  //                     : isCurrentMonthDate
  //                     ? "text-white"
  //                     : "text-muted-foreground"
  //                 }`}
  //                 >
  //                   {date.getDate()}
  //                 </div>
  //               </div>
  //               {/* Tasks */}
  //               <div className="mb-5 ">
  //                 {dayTasks.slice(0, 3).map((todo) => (
  //                   <div
  //                     key={todo.id || `todo-${index}`}
  //                     onClick={(e) => {
  //                       e.stopPropagation();
  //                       onViewDetails(todo);
  //                     }}
  //                     className={`text-xs p-1 my-0.5 cursor-pointer rounded-xs transition-opacity line-clamp-1 text-white ${todo.color ?? 'bg-secondary/75'} hover:opacity-90`}
  //                     title={todo.title}
  //                   >
  //                     {todo.title}
  //                   </div>
  //                 ))}
                  
  //                 {dayTasks.length > 3 && (
  //                   <button
  //                     type="button"
  //                     className="text-xs text-muted-foreground my-0.5 px-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer p-1 w-full text-left "
  //                     onClick={(e) => {
  //                       e.stopPropagation();
  //                       const anchor = dayRefs.current.get(dateKey);
  //                       if (anchor) {
  //                         const rect = anchor.getBoundingClientRect();
  //                         setViewMorePosition({
  //                           top: rect.top + window.scrollY + rect.height / 2,
  //                           left: rect.left + window.scrollX + rect.width / 2,
  //                         });
  //                       } else {
  //                         setViewMorePosition(null);
  //                       }
  //                       setViewMoreTasks(dayTasks);
  //                       setViewMoreDate(date);
  //                       setIsViewingMoreTasks(true);
  //                     }}
  //                   >
  //                     {dayTasks.length - 3} more
  //                   </button>
  //                 )}
  //               </div>
  //               {/* Add Task Button */}
  //               {isCurrentMonthDate && (
  //                 <div>
  //                   {isFormOpen && (
  //                     <div 
  //                       className='z-50 bg-card '
  //                       style={{
  //                                 top: '0px',
  //                                 left: '50%',
  //                                 transform: 'translateX(-50%)',
  //                         }}
  //                       onClick={(e) => e.stopPropagation()}
  //                     >
  //                       <div className={`transition-all duration-3000 z-50 ${isFormOpen ? " translate-x-0" : "translate-x-full"}`}>
  //                       <AddTaskCalender
  //                         width="w-[500px]"
  //                         backgroundColor="bg-secondary"
  //                         index={dayTasks.length}
  //                         preselectedDate={date}
  //                         onCancel={() => setOpenFormDate(null)}
  //                         onSuccess={(todo) => {
  //                           if (onTaskCreated) {
  //                             onTaskCreated(todo);
  //                           }
  //                           setOpenFormDate(null);
  //                         }}
  //                         onUpdate={(todo) => {
  //                           if (onTaskUpdated) {
  //                             onTaskUpdated(todo);
  //                           }
  //                           setOpenFormDate(null);
  //                         }}
  //                       />
  //                       </div>
  //                     </div>
  //                   )}
  //                 </div>
  //               )}
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>

  //     {/* View More Tasks Modal */}
  //     {isViewingMoreTasks && viewMoreDate && (
  //       <>
  //         {/* Backdrop */}
  //         <div
  //           className="fixed inset-0 bg-transparent  z-40"
  //           onClick={() => {
  //             setIsViewingMoreTasks(false);
  //             setViewMoreTasks([]);
  //             setViewMoreDate(null);
  //             setViewMorePosition(null);
  //           }}
  //         />

  //         {/* Anchored Modal */}
  //         <div
  //           className="fixed z-50 w-full max-w-xs"
  //           style={viewMoreModalStyle}
  //         >
  //           <div className="relative w-full rounded-[32px] bg-card shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-border p-4 ">
  //             {/* Close button */}
  //             <button
  //               type="button"
  //               className="absolute right-5 top-5 text-muted-foreground hover:text-foreground cursor-pointer"
  //               onClick={() => {
  //                 setIsViewingMoreTasks(false);
  //                 setViewMoreTasks([]);
  //                 setViewMoreDate(null);
  //                 setViewMorePosition(null);
  //               }}
  //             >
  //               <X className="w-5 h-5" />
  //             </button>

  //             {/* Day label */}
  //             <div className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-2 uppercase">
  //               {viewMoreDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
  //             </div>

  //             {/* Date number */}
  //             <div className="text-center text-5xl font-semibold text-white mb-5">
  //               {viewMoreDate.getDate()}
  //             </div>

  //             {/* Tasks list */}
  //             <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
  //               {viewMoreTasks.map((todo) => (
  //                 <button
  //                   key={todo.id}
  //                   type="button"
  //                   className="w-full rounded-xl bg-[#3B82F6] text-left px-4 py-2 text-sm text-black font-medium hover:bg-[#60A5FA] transition-colors cursor-pointer"
  //                   onClick={() => {
  //                     onViewDetails(todo);
  //                     setIsViewingMoreTasks(false);
  //                     setViewMoreTasks([]);
  //                     setViewMoreDate(null);
  //                     setViewMorePosition(null);
  //                   }}
  //                 >
  //                   {todo.title}
  //                 </button>
  //               ))}
  //             </div>
  //           </div>
  //         </div>
  //       </>
  //     )}
  //   </div>
  // );
};

export default CalendarView;

