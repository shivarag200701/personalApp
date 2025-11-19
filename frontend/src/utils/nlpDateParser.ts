// frontend/src/utils/nlpDateParser.ts

export interface ParsedDateResult {
    date: string | null; // YYYY-MM-DD format
    isRecurring: boolean;
    recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurrenceInterval?: number;
    recurrenceEndDate?: string | null;
    confidence: "high" | "medium" | "low";
    error?: string;
    displayText?: string; // Human-readable description
  }
  const weekdayMap: Record<string, string> = {
    sun: 'sunday',
    mon: 'monday',
    tue: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    fri: 'friday',
    sat: 'saturday'
};
  
  // Helper function to format date as YYYY-MM-DD
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Helper function to get today's date (normalized)
  function getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  
  
  // Helper function to find next occurrence of a weekday
  // allowToday: if true, return today if today matches the target day (for recurring tasks)
  function getNextWeekday(dayName: string, allowToday: boolean = false): Date {
    const today = getToday();
    const dayIndex = today.getDay();
    const targetDays: { [key: string]: number } = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6,
      'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
    };
    
    // Extract just the weekday name from the input string
    const weekdayMatch = dayName.match(/(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|wed|thu|fri|sat)/i);
    const weekdayKey = weekdayMatch ? weekdayMatch[1].toLowerCase() : dayName.toLowerCase();
    
    const targetDay = targetDays[weekdayKey];
    if (targetDay === undefined) return today;
    
    // If today is the target day and we allow it, return today
    if (allowToday && dayIndex === targetDay) {
      return today;
    }
    
    // Otherwise, calculate next occurrence
    const daysUntil = (targetDay - dayIndex + 7) % 7 || 7;
    const result = new Date(today);
    result.setDate(result.getDate() + daysUntil);
    return result;
  }
  
  // Parse relative date expressions
  function parseRelativeDate(input: string, allowToday: boolean = false): Date | null {
    const normalized = input.toLowerCase().trim();
    const today = getToday();

    // Extract weekday name properly
    const weekdayMatch = normalized.match(/(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|wed|thu|fri|sat)/i);
    if (weekdayMatch) {
      return getNextWeekday(weekdayMatch[1], allowToday);
    }
    
    // Today
    if (normalized === 'today' || normalized === 'tdy') {
      return today;
    }
    
    // Tomorrow
    if (normalized === 'tomorrow' || normalized === 'tmr' || normalized === 'tmrw') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    // Day after tomorrow
    if (normalized === 'day after tomorrow' || normalized === 'dat') {
      const dat = new Date(today);
      dat.setDate(dat.getDate() + 2);
      return dat;
    }
    
    // Next week
    if (normalized === 'next week' || normalized === 'nxt week') {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    
    // This weekend (next Saturday)
    if (normalized.includes('weekend')) {
      return getNextWeekday('saturday');
    }
    
    // Next [weekday]
    const nextDayMatch = normalized.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|wed|thu|fri|sat)/i);
    if (nextDayMatch) {
      return getNextWeekday(nextDayMatch[1]);
    }
    
    // This [weekday]
    const thisDayMatch = normalized.match(/this\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|wed|thu|fri|sat)/i);
    if (thisDayMatch) {
      const day = getNextWeekday(thisDayMatch[1]);
      // If it's already past this weekday, get next week's
      if (day < today) {
        const nextWeek = new Date(day);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek;
      }
      return day;
    }
    
    // In X days
    const inDaysMatch = normalized.match(/in\s+(\d+)\s+days?/i);
    if (inDaysMatch) {
      const days = parseInt(inDaysMatch[1]);
      const result = new Date(today);
      result.setDate(result.getDate() + days);
      return result;
    }
    
    // X days from now
    const daysFromNowMatch = normalized.match(/(\d+)\s+days?\s+from\s+now/i);
    if (daysFromNowMatch) {
      const days = parseInt(daysFromNowMatch[1]);
      const result = new Date(today);
      result.setDate(result.getDate() + days);
      return result;
    }
    
    // Next month
    if (normalized === 'next month') {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    }
    
    // Next year
    if (normalized === 'next year') {
      const nextYear = new Date(today);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      return nextYear;
    }
    
    return null;
  }
  
  // Parse absolute date formats
  function parseAbsoluteDate(input: string): Date | null {
    const normalized = input.trim();
    
    // YYYY-MM-DD format
    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        date.setHours(0, 0, 0, 0);
        return date;
      }
    }
    
    // MM/DD/YYYY or MM-DD-YYYY
    const usDateMatch = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (usDateMatch) {
      const [, month, day, year] = usDateMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        date.setHours(0, 0, 0, 0);
        return date;
      }
    }
    
    // Month DD, YYYY or Month DD YYYY
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'];
    const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    for (let i = 0; i < monthNames.length; i++) {
      const monthPattern = `(${monthNames[i]}|${monthAbbr[i]})`;
      const regex = new RegExp(`${monthPattern}\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})`, 'i');
      const match = normalized.match(regex);
      if (match) {
        const date = new Date(parseInt(match[3]), i, parseInt(match[2]));
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0);
          return date;
        }
      }
    }
    
    return null;
  }
  
  // Parse recurring patterns
  function parseRecurringPattern(input: string): {
    isRecurring: boolean;
    pattern?: "daily" | "weekly" | "monthly" | "yearly";
    interval?: number;
    endDate?: Date | null;
    weekdayName?: string; // Store weekday name for "every monday" patterns
  } {
    const normalized = input.toLowerCase().trim();
    
    
    // Extract interval number
    const intervalMatch = normalized.match(/(\d+)/);
    const interval = intervalMatch ? parseInt(intervalMatch[1]) : 1;

    
    // Daily patterns
    if (normalized.match(/(every|each)\s+(\d+\s+)?day(s)?|daily/i)) {
      return {
        isRecurring: true,
        pattern: "daily",
        interval: interval || 1
      };
    }
    
    // Weekly patterns
    if (normalized.match(/(every\s+)?(\d+\s+)?weeks?|weekly|each\s+week/i)) {
      return {
        isRecurring: true,
        pattern: "weekly",
        interval: interval || 1
      };
    }
    
    // Every [weekday]
    const weekdayMatch = normalized.match(/every\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|wed|thu|fri|sat)/i);
    if (weekdayMatch) {
        const abbreviation = weekdayMatch[1].toLowerCase();
        const weekdayName = weekdayMap[abbreviation] || abbreviation;
      return {
        isRecurring: true,
        pattern: "weekly",
        interval: 1,
        weekdayName: weekdayName // Store the weekday name
      };
    }
    
    // Monthly patterns
    if (normalized.match(/(every\s+)?(\d+\s+)?months?|monthly|each\s+month/i)) {
      return {
        isRecurring: true,
        pattern: "monthly",
        interval: interval || 1
      };
    }
    
    // Yearly patterns
    if (normalized.match(/(every\s+)?(\d+\s+)?years?|yearly|annually|each\s+year/i)) {
      return {
        isRecurring: true,
        pattern: "yearly",
        interval: interval || 1
      };
    }
    
    // Parse end date for recurring tasks
    const forMatch = normalized.match(/for\s+(\d+)\s+(days?|weeks?|months?|years?)/i);
    const untilMatch = normalized.match(/until\s+([^,]+)/i);
    console.log("forMatch", forMatch);
    console.log("untilMatch", untilMatch);
    
    let endDate: Date | null = null;
    if (forMatch) {
      const amount = parseInt(forMatch[1]);
      const unit = forMatch[2].toLowerCase();
      const startDate = getToday();
      endDate = new Date(startDate);
      
      if (unit.startsWith('day')) {
        endDate.setDate(endDate.getDate() + amount);
      } else if (unit.startsWith('week')) {
        endDate.setDate(endDate.getDate() + (amount * 7));
      } else if (unit.startsWith('month')) {
        endDate.setMonth(endDate.getMonth() + amount);
      } else if (unit.startsWith('year')) {
        endDate.setFullYear(endDate.getFullYear() + amount);
      }
    } else if (untilMatch) {
      const untilDateStr = untilMatch[1].trim();
      const parsedUntilDate = parseAbsoluteDate(untilDateStr) || parseRelativeDate(untilDateStr);
      if (parsedUntilDate) {
        endDate = parsedUntilDate;
      }
    }
    
    return {
      isRecurring: false,
      endDate: endDate || undefined
    };
  }
  
  // Main parsing function
  export function parseNaturalLanguageDate(input: string): ParsedDateResult {
    if (!input || input.trim().length === 0) {
      return {
        date: null,
        isRecurring: false,
        confidence: "low",
        error: "Empty input"
      };
    }
    
    const normalized = input.toLowerCase().trim();
    const today = getToday();
    
    // Check for "no date" or clear
    if (normalized.match(/^(no\s+date|clear|none|remove)$/i)) {
      return {
        date: null,
        isRecurring: false,
        confidence: "high",
        displayText: "No date"
      };
    }
    
    // Try to parse recurring pattern first
    const recurringInfo = parseRecurringPattern(normalized);
    
    // Extract base date from input (remove recurring keywords)
    let dateInput = normalized
      .replace(/every\s+/gi, '')
      .replace(/\d+\s*(days?|weeks?|months?|years?)/gi, '')
      .replace(/daily|weekly|monthly|yearly/gi, '')
      .replace(/for\s+\d+\s+(days?|weeks?|months?|years?)/gi, '')
      .replace(/until\s+[^,]+/gi, '')
      .trim();
    
    let parsedDate: Date | null = null;
    
    // Special handling for "every [weekday]" patterns
    if (recurringInfo.isRecurring && recurringInfo.weekdayName) {
      // Use the extracted weekday name and allow today if it matches
      parsedDate = getNextWeekday(recurringInfo.weekdayName, true);
    } else if (dateInput.length > 0) {
      // Try absolute date first
      parsedDate = parseAbsoluteDate(dateInput);
      
      // Then try relative date (allow today for recurring patterns)
      if (!parsedDate) {
        parsedDate = parseRelativeDate(dateInput, recurringInfo.isRecurring);
      }
    }
    
    // If recurring but no date specified, start from today
    if (recurringInfo.isRecurring && !parsedDate) {
      parsedDate = today;
    }
    
    // If no date found and not recurring, try parsing the original input
    if (!parsedDate && !recurringInfo.isRecurring) {
      parsedDate = parseAbsoluteDate(normalized) || parseRelativeDate(normalized);
    }
    
    // Validate date is not in the past
    if (parsedDate && parsedDate < today) {
      return {
        date: null,
        isRecurring: false,
        confidence: "low",
        error: "Date cannot be in the past"
      };
    }
    
    // Build result
    const result: ParsedDateResult = {
      date: parsedDate ? formatDate(parsedDate) : null,
      isRecurring: recurringInfo.isRecurring,
      confidence: parsedDate ? "high" : "low",
    };
    
    if (recurringInfo.isRecurring) {
      result.recurrencePattern = recurringInfo.pattern;
      result.recurrenceInterval = recurringInfo.interval || 1;
      result.recurrenceEndDate = recurringInfo.endDate ? formatDate(recurringInfo.endDate) : null;
      
      // Generate display text
      const patternText = result.recurrencePattern === 'daily' ? 'day' :
                         result.recurrencePattern === 'weekly' ? 'week' :
                         result.recurrencePattern === 'monthly' ? 'month' : 'year';
      
      // Special handling for "every [weekday]" patterns
      if (recurringInfo.weekdayName && result.recurrencePattern === 'weekly' && result.recurrenceInterval === 1) {
        const weekdayDisplay = recurringInfo.weekdayName.charAt(0).toUpperCase() + recurringInfo.weekdayName.slice(1);
        result.displayText = `Every ${weekdayDisplay}`;
      } else {
        result.displayText = `Every ${result.recurrenceInterval} ${patternText}${result.recurrenceInterval > 1 ? 's' : ''}`;
      }
      
      if (result.recurrenceEndDate) {
        result.displayText += ` until ${result.recurrenceEndDate}`;
      }
    } else if (parsedDate) {
      // Generate display text for single date
      const dayName = parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (parsedDate.getTime() === today.getTime()) {
        result.displayText = "Today";
      } else if (parsedDate.getTime() === today.getTime() + 86400000) {
        result.displayText = "Tomorrow";
      } else {
        result.displayText = `${dayName}, ${dateStr}`;
      }
    }
    
    if (!parsedDate && !recurringInfo.isRecurring) {
      result.error = "Could not parse date";
      result.confidence = "low";
    }
    
    return result;
  }