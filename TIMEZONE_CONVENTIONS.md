# Timezone Conventions

## Overview

This document outlines the timezone handling strategy for the personalTodoApp to ensure consistent behavior across all users regardless of their location or the server's location.

## Architecture Rules

### 1. **Database Storage** ✅
- All `DateTime` fields in PostgreSQL are stored as **UTC timestamps**
- Prisma automatically handles this conversion
- Never store timezone-specific timestamps

### 2. **API Communication** ✅
- All date strings transmitted over HTTP are in **ISO 8601 format with UTC timezone**
- Example: `2024-12-16T23:59:59.999Z`
- The `Z` suffix indicates UTC time

### 3. **Backend Business Logic** ✅
- **Always use UTC** for date calculations, comparisons, and queries
- This ensures consistent behavior regardless of server location (currently US East)
- Use UTC helper functions: `isTodayUTC()`, `getStartOfTodayUTC()`, etc.

### 4. **Frontend Display** ✅
- Convert UTC timestamps to **user's local timezone** for display
- JavaScript's `Date` object automatically handles this conversion
- Use display functions: `isToday()`, `formatCompleteAt()`, etc.

### 5. **User Input** ✅
- Accept user input in their local timezone
- Convert to UTC before sending to API
- Use `Date.UTC()` for conversions

## Why UTC?

### Problems with Local Time:
- ❌ Server location (US East) affects calculations
- ❌ Database location affects storage
- ❌ Users in different timezones see inconsistent data
- ❌ Daylight Saving Time causes bugs twice a year

### Benefits of UTC:
- ✅ Consistent worldwide
- ✅ No DST complications
- ✅ Server location doesn't matter
- ✅ Easy to convert to any local timezone for display

## Why Noon (12:00:00) Instead of End-of-Day?

When storing task due dates, we use **12:00:00 (noon) in the user's local timezone** instead of 23:59:59:

### Problem with End-of-Day:
```typescript
// User in India (UTC+5:30) selects Dec 19
new Date(2025, 11, 19, 23, 59, 59, 999) // Dec 19, 23:59 IST
→ Converts to: "2025-12-19T18:29:59.999Z" (Dec 19, 18:29 UTC)
→ When displayed back: Dec 20, 00:29 IST
→ Shows in Dec 20 column ❌
```

### Solution with Noon:
```typescript
// User in India (UTC+5:30) selects Dec 19
new Date(2025, 11, 19, 12, 0, 0, 0) // Dec 19, 12:00 IST
→ Converts to: "2025-12-19T06:30:00.000Z" (Dec 19, 06:30 UTC)
→ When displayed back: Dec 19, 12:00 IST
→ Shows in Dec 19 column ✅
```

### Benefits:
- ✅ ±12 hour buffer prevents date rollover for all timezones (UTC-12 to UTC+14)
- ✅ Date picker selection matches displayed date
- ✅ Consistent behavior worldwide

## Function Reference

### Backend Functions (Use UTC)

Located in: `common/src/index.ts`

#### `convertCompleteAtToDate(completeAt: string)`
Converts "Today"/"Tomorrow"/"This Week" to UTC Date object.
```typescript
// Used in backend routes
const completeAtDate = convertCompleteAtToDate(completeAt ?? undefined);
```

#### `isTodayUTC(dateString: string)`
Checks if a date is today in UTC timezone.
```typescript
if (isTodayUTC(task.completeAt)) {
  // Process today's task
}
```

#### `isTomorrowUTC(dateString: string)`
Checks if a date is tomorrow in UTC timezone.

#### `getStartOfTodayUTC()`
Returns start of today (00:00:00.000) in UTC.
```typescript
const today = getStartOfTodayUTC();
```

#### `getEndOfTodayUTC()`
Returns end of today (23:59:59.999) in UTC.
```typescript
const endOfDay = getEndOfTodayUTC();
```

#### `calculateNextOccurence(pattern, interval, lastOccurence)`
Calculates next recurring task date using UTC.

### Frontend Functions (Use Local Time for Display)

Located in: `common/src/index.ts`

#### `isToday(dateString: string)` 
Checks if a date is today **in user's local timezone**.
```typescript
// Use ONLY for display logic
if (isToday(task.completeAt)) {
  taskElement.classList.add('today-task');
}
```

#### `isTomorrow(dateString: string)`
Checks if a date is tomorrow in user's local timezone.

#### `formatCompleteAt(dateString: string)`
Formats date for display: "Today", "Tomorrow", day name, or full date.

#### `isTaskOnDate(taskDateString, targetDate)`
Checks if task falls on specific date in user's local timezone.

## Code Examples

### ✅ Correct: Backend Date Query
```typescript
// backend/src/routes/todo.ts
const now = new Date();
const today = new Date(Date.UTC(
  now.getUTCFullYear(),
  now.getUTCMonth(),
  now.getUTCDate(),
  0, 0, 0, 0
));

const todos = await prisma.todo.findMany({
  where: {
    userId,
    completeAt: { gte: today }
  }
});
```

### ✅ Correct: Frontend Date Input
```typescript
// frontend/src/Components/InlineTaskForm.tsx
const dateInputToIso = (dateInput: string): string => {
  // Use noon (12:00) in user's local timezone to avoid rollover issues
  const [year, month, day] = dateInput.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.toISOString(); // Converts local noon to UTC string
};
```

### ✅ Correct: Frontend Display
```typescript
// frontend/src/Components/TaskCard.tsx
const displayDate = formatCompleteAt(task.completeAt);
// Shows "Today" if it's today in user's timezone
```

### ❌ Wrong: Using UTC Date with End-of-Day Time
```typescript
// DON'T DO THIS - causes timezone rollover issues
const [year, month, day] = dateInput.split('-').map(Number);
const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
// When displayed in a timezone ahead of UTC, this rolls over to next day
```

### ❌ Wrong: Using UTC for Display Logic
```typescript
// DON'T DO THIS
if (task.getUTCDate() === now.getUTCDate()) {
  // User in Japan will see wrong date
}
```

## Testing Checklist

When testing timezone functionality:

1. **User in California (UTC-8) creates "Today" task**
   - [ ] Should appear under "Today" for them
   - [ ] Should store as correct UTC date in database
   - [ ] User in Japan should see same logical day

2. **User in Japan (UTC+9) views task created by California user**
   - [ ] Should see correct date relative to their timezone
   - [ ] Should be able to edit without changing the date

3. **Recurring task created on US East server**
   - [ ] Should repeat at correct intervals
   - [ ] Next occurrence should be correct for all users

4. **Server moved to different timezone**
   - [ ] All functionality should remain unchanged
   - [ ] No migration needed

## Migration Notes

### Changes Made (December 2024)

1. Updated `convertCompleteAtToDate()` to use UTC methods
2. Added UTC helper functions: `isTodayUTC()`, `getStartOfTodayUTC()`, etc.
3. Fixed frontend `dateInputToIso()` to always use UTC
4. Updated backend date queries to use UTC
5. Added documentation comments to clarify function purposes

### No Database Migration Required

The database was already storing UTC timestamps. This update only fixed the **application logic** to consistently use UTC, matching what was already in the database.

## Troubleshooting

### Issue: Task shows on wrong day
**Cause:** Using local time comparison in frontend  
**Fix:** Use `isToday()` which accounts for user's timezone

### Issue: Recurring task creates at wrong time
**Cause:** Using local time in backend calculation  
**Fix:** Use `calculateNextOccurence()` which uses UTC

### Issue: Query returns wrong tasks
**Cause:** Using `setHours()` instead of `setUTCHours()`  
**Fix:** Use `getStartOfTodayUTC()` helper function

## Resources

- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)
- [JavaScript Date and Time](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Why you should always use UTC](https://stackoverflow.com/questions/6841333/why-is-subtracting-these-two-times-in-1927-giving-a-strange-result)

