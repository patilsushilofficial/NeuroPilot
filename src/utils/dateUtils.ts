import { format, formatDistance, isToday, isYesterday, isTomorrow, isPast, differenceInDays } from 'date-fns';

/**
 * Format a Unix timestamp for task due dates.
 * ADHD-friendly: uses relative terms ("Today", "Tomorrow", "Yesterday")
 * rather than abstract dates.
 */
export const formatDueDate = (timestamp: number): { label: string; isOverdue: boolean; isUrgent: boolean } => {
  const date = new Date(timestamp);
  const now = new Date();
  const isOverdue = isPast(date) && !isToday(date);
  const daysUntil = differenceInDays(date, now);
  const isUrgent = daysUntil <= 1 && !isOverdue;

  let label: string;
  if (isToday(date)) label = 'Today';
  else if (isYesterday(date)) label = 'Yesterday';
  else if (isTomorrow(date)) label = 'Tomorrow';
  else if (isOverdue) label = `${Math.abs(differenceInDays(date, now))}d overdue`;
  else if (daysUntil <= 7) label = format(date, 'EEE, MMM d');
  else label = format(date, 'MMM d');

  return { label, isOverdue, isUrgent };
};

/**
 * Format seconds into MM:SS for the focus timer.
 */
export const formatTimerDisplay = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Format focus minutes for display.
 */
export const formatFocusTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Get greeting based on time of day.
 * ADHD-friendly: contextual, grounding to present moment.
 */
export const getTimeGreeting = (name?: string): string => {
  const hour = new Date().getHours();
  const firstName = name?.split(' ')[0];
  const nameStr = firstName ? `, ${firstName}` : '';

  if (hour < 6) return `Night owl${nameStr} 🦉`;
  if (hour < 12) return `Good morning${nameStr} ☀️`;
  if (hour < 17) return `Good afternoon${nameStr} 🌤️`;
  if (hour < 21) return `Good evening${nameStr} 🌆`;
  return `Good night${nameStr} 🌙`;
};

/**
 * Get an ADHD-aware "urgency label" for task priority.
 */
export const getPriorityConfig = (priority: 'high' | 'medium' | 'low') => {
  const configs = {
    high: { label: 'High', emoji: '🔴', colorKey: 'taskHighPriority' as const },
    medium: { label: 'Medium', emoji: '🟡', colorKey: 'taskMediumPriority' as const },
    low: { label: 'Low', emoji: '🟢', colorKey: 'taskLowPriority' as const },
  };
  return configs[priority];
};

/**
 * Returns the weekday labels starting from Monday for habit grid display.
 */
export const getWeekDayLabels = (): string[] => ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * Returns the last N days as YYYY-MM-DD strings (most recent last).
 */
export const getLastNDates = (n: number): string[] => {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return format(d, 'yyyy-MM-dd');
  });
};

/**
 * Estimate XP tier label.
 */
export const getLevelTitle = (level: number): string => {
  if (level < 3) return 'Spark';
  if (level < 5) return 'Learner';
  if (level < 8) return 'Focused';
  if (level < 12) return 'Pilot';
  if (level < 18) return 'Navigator';
  if (level < 25) return 'Co-Pilot';
  if (level < 35) return 'Ace';
  if (level < 50) return 'Expert';
  return 'Neuro Legend';
};
/**
 * Get today's date as YYYY-MM-DD string.
 */
export const getTodayStr = (): string => format(new Date(), 'yyyy-MM-dd');

/**
 * Format a date as the all-caps banner shown above the home greeting,
 * e.g. "SATURDAY, MAY 9". Pulled out of `HomeScreen` so the locale and
 * casing decisions live in one tested place.
 */
export const formatHomeHeaderDate = (date: Date = new Date()): string =>
  date
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();
