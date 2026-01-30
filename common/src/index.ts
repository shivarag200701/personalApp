import { z } from "zod";

export const signUpSchema = z.object({
  username: z.string().min(3, "less than 3 letters"),
  password: z.string(),
  email: z.email(),
});

export const signInSchema = z.object({
  username: z.string().min(3, "less than 3 letters"),
  password: z.string(),
});

export const todoSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.string().nullish(),
  completeAt: z.string().nullish(),
  isAllDay: z.boolean(),
  category: z.string(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(["daily", "weekly", "monthly", "yearly"]).nullish(),
  recurrenceInterval: z.number().int().positive().nullish(),
  recurrenceEndDate: z.string().nullish(),
  nextOccurrence: z.string().nullish(),
  color: z.string().nullish(),
  order: z.number().int().nullish(),
});

export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type Todo = z.infer<typeof todoSchema>;

export type TimeSelection = "Today" | "Tomorrow" | "This Week";


/**
 * Converts "Today"/"Tomorrow"/"This Week" to actual Date object (end of period)
 * Used in backend to convert user selection to database DateTime
 * Always uses UTC to ensure consistent behavior regardless of server location
 */
export function convertCompleteAtToDate(completeAt: string| undefined): Date | null {
  if(!completeAt) {
    return null;
  }
  
  // Get current date in UTC to ensure consistent behavior regardless of server location
  const now = new Date();
  const today = new Date(Date.UTC(
    now.getUTCFullYear(), 
    now.getUTCMonth(), 
    now.getUTCDate(), 
    0, 0, 0, 0
  ));

  switch(completeAt){
    case "Today":
      const endToday = new Date(today);
      endToday.setUTCHours(23, 59, 59, 999);
      return endToday;

    case "Tomorrow":
      const endTomorrow = new Date(today);
      endTomorrow.setUTCDate(endTomorrow.getUTCDate() + 1);
      endTomorrow.setUTCHours(23, 59, 59, 999);
      return endTomorrow;

    case "This Week":
      const thisWeek = new Date(today);
      const dayOfWeek = thisWeek.getUTCDay(); // 0 = Sunday, 6 = Saturday
      const daysUntilSunday = 7 - dayOfWeek;
      thisWeek.setUTCDate(thisWeek.getUTCDate() + daysUntilSunday);
      thisWeek.setUTCHours(23, 59, 59, 999);
      return thisWeek;

    default:
      const parsed = new Date(completeAt);
      return isNaN(parsed.getTime()) ? null : parsed;
  }
}


/**
 * Gets start of today in UTC
 * Use this for backend business logic to ensure consistent behavior
 */
export function getStartOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
}

/**
 * Gets end of today in UTC
 * Use this for backend business logic to ensure consistent behavior
 */
export function getEndOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23, 59, 59, 999
  ));
}

/**
 * Checks if a UTC date string represents today in UTC
 * Use this for backend business logic
 */
export function isTodayUTC(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const taskDate = new Date(dateString);
  const now = new Date();
  
  return (
    taskDate.getUTCFullYear() === now.getUTCFullYear() &&
    taskDate.getUTCMonth() === now.getUTCMonth() &&
    taskDate.getUTCDate() === now.getUTCDate()
  );
}

/**
 * Checks if a UTC date string represents tomorrow in UTC
 * Use this for backend business logic
 */
export function isTomorrowUTC(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const taskDate = new Date(dateString);
  const now = new Date();
  
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  
  return (
    taskDate.getUTCFullYear() === tomorrow.getUTCFullYear() &&
    taskDate.getUTCMonth() === tomorrow.getUTCMonth() &&
    taskDate.getUTCDate() === tomorrow.getUTCDate()
  );
}

/**
 * Calculates the next occurrence of a recurring task
 * Used in backend to calculate the next occurrence of a recurring task and also in frontend to calculate the next occurrence of a recurring task to display in the upcoming view
 */
export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";

export const calculateNextOccurence = (
    pattern: RecurrencePattern,
    interval: number,
    lastOccurence: Date
): Date => {
    const next = new Date(lastOccurence);
    switch (pattern){
        case "daily":
            next.setUTCDate(next.getUTCDate() + interval);
            break;
        case "weekly":
            next.setUTCDate(next.getUTCDate() + interval * 7);
            break;
        case "monthly":
            next.setUTCMonth(next.getUTCMonth() + interval);
            break;
        case "yearly":
            next.setUTCFullYear(next.getUTCFullYear() + interval);
            break;
        default:
            throw new Error(`Invalid recurrence pattern: ${pattern}`);
    }
    return next;
}


/**
 * Converts date string (ISO) to "Today"/"Tomorrow"/"This Week"
 * Used in frontend to convert database DateTime to user-friendly selection
 */
export function dateToTimeSelection(date: string | null | undefined): TimeSelection {
  if (!date) return "Today";
  
  const taskDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);
  
  const endTomorrow = new Date(tomorrow);
  endTomorrow.setHours(23, 59, 59, 999);
  
  // Get end of current week (Sunday)
  const endOfWeek = new Date(today);
  const dayOfWeek = endOfWeek.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  
  if (taskDate >= today && taskDate <= endToday) {
    return "Today";
  } else if (taskDate >= tomorrow && taskDate <= endTomorrow) {
    return "Tomorrow";
  } else if (taskDate <= endOfWeek) {
    return "This Week";
  } else {
    // If beyond this week, default to "This Week"
    return "This Week";
  }
}

/**
 * Converts "Today"/"Tomorrow"/"This Week" to ISO date string
 * Used in frontend to convert user selection to ISO string for API
 */
export function timeSelectionToDate(timeSelection: TimeSelection): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (timeSelection) {
    case "Today":
      const endToday = new Date(today);
      endToday.setHours(23, 59, 59, 999);
      return endToday.toISOString();
      
    case "Tomorrow":
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      return tomorrow.toISOString();
      
    case "This Week":
      // Set to end of current week (Sunday)
      const thisWeek = new Date(today);
      const dayOfWeek = thisWeek.getDay();
      const daysUntilSunday = 7 - dayOfWeek;
      thisWeek.setDate(thisWeek.getDate() + daysUntilSunday);
      thisWeek.setHours(23, 59, 59, 999);
      return thisWeek.toISOString();
  }
}

/**
 * Checks if a date string represents today in USER'S LOCAL TIMEZONE
 * Use this ONLY for frontend display purposes
 * For backend business logic, use isTodayUTC() instead
 * Compares by local date components to handle timezone differences correctly
 */
export function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const taskDate = new Date(dateString);
  const today = new Date();
  
  // Compare by local date components (year, month, day) instead of timestamps
  // This ensures it works correctly across all timezones
  return (
    taskDate.getFullYear() === today.getFullYear() &&
    taskDate.getMonth() === today.getMonth() &&
    taskDate.getDate() === today.getDate()
  );
}

/**
 * Checks if a date string represents tomorrow in USER'S LOCAL TIMEZONE
 * Use this ONLY for frontend display purposes
 * For backend business logic, use isTomorrowUTC() instead
 */
export function isTomorrow(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const taskDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endTomorrow = new Date(tomorrow);
  endTomorrow.setHours(23, 59, 59, 999);
  
  return taskDate >= tomorrow && taskDate <= endTomorrow;
}

/**
 * Checks if a date string is within this week (but not today or tomorrow)
 */
export function isThisWeek(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const taskDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // End of current week (Sunday)
  const endOfWeek = new Date(today);
  const dayOfWeek = endOfWeek.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return !isToday(dateString) && !isTomorrow(dateString) && taskDate <= endOfWeek;
}

/**
 * Formats a date string for display
 * Returns "Today", "Tomorrow", day name, or formatted date
 */
export function formatCompleteAt(dateString: string | null | undefined): string {
  if (!dateString) return "No date";
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);
  
  const endTomorrow = new Date(tomorrow);
  endTomorrow.setHours(23, 59, 59, 999);
  
  // Get end of current week (Sunday)
  const endOfWeek = new Date(today);
  const dayOfWeek = endOfWeek.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  
  if (date >= today && date <= endToday) {
    return "Today";
  } else if (date >= tomorrow && date <= endTomorrow) {
    return "Tomorrow";
  } else if (date <= endOfWeek) {
    // Show day name if within this week
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    // Show full date for future dates
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Gets an array of dates for the upcoming view (5-7 days starting from a given date)
 */
export function getUpcomingDateRange(startDate: Date, days: number = 5): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(current);
    date.setDate(current.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Formats a date for the upcoming view column header
 * Returns format like "Nov 11 • Today" or "Nov 12 • Tomorrow" or "Nov 13 • Thursday"
 */
export function formatUpcomingDateHeader(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);
  
  const endTomorrow = new Date(tomorrow);
  endTomorrow.setHours(23, 59, 59, 999);
  
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  
  if (date >= today && date <= endToday) {
    return `${dateStr} • Today`;
  } else if (date >= tomorrow && date <= endTomorrow) {
    return `${dateStr} • Tomorrow`;
  } else {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dateStr} • ${dayName}`;
  }
}

/**
 * Checks if a task's completeAt date falls on a specific date (ignoring time)
 * Uses local date components for both dates to ensure timezone consistency
 */
export function isTaskOnDate(taskDateString: string | null | undefined, targetDate: Date): boolean {
  if (!taskDateString) return false;
  
  const taskDate = new Date(taskDateString);
  const target = new Date(targetDate);
  
  // Compare date components using local timezone for both dates
  // This ensures consistency regardless of how the date was stored
  return (
    taskDate.getFullYear() === target.getFullYear() &&
    taskDate.getMonth() === target.getMonth() &&
    taskDate.getDate() === target.getDate()
  );
  
}

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8,"Password must be 8 characters long"),
  confirmNewPassword:z.string().min(8,"Password must be 8 characters long")
})

export const addPasswordSchema = z.object({
  newPassword: z.string().min(8,"Password must be 8 characters long"),
  confirmNewPassword:z.string().min(8,"Password must be 8 characters long")
})

export const changeEmailSchema = z.object({
  email: z.email("Invalid email")
})

export const ChangeUsernameSchema = z.object({
  username: z.string().min(3,"Atleast 3 characters")
})
