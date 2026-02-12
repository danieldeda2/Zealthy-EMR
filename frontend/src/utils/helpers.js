import {
  format,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';

export function formatDate(dateStr, fmt = 'MMM d, yyyy') {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, fmt);
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'MMM d, yyyy · h:mm a');
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'h:mm a');
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'MMM d');
}

export function generateOccurrences(startDate, schedule, monthsOut = 3, endDate = null) {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const now = startOfDay(new Date());
  const limit = addMonths(now, monthsOut);
  const end = endDate ? (typeof endDate === 'string' ? parseISO(endDate) : endDate) : null;
  const occurrences = [];
  let current = start;
  const advanceFn = schedule === 'weekly' ? addWeeks : addMonths;

  for (let i = 0; i < 500; i++) {
    if (isAfter(current, limit)) break;
    if (end && isAfter(current, end)) break;
    if (isAfter(current, now) || format(current, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      occurrences.push(current);
    }
    current = advanceFn(current, 1);
  }
  return occurrences;
}

export function getUpcomingWithinDays(startDate, schedule, days = 7, endDate = null) {
  const now = new Date();
  const windowEnd = endOfDay(addDays(now, days));
  const occurrences = generateOccurrences(startDate, schedule, 1, endDate);
  return occurrences.filter((d) =>
    isWithinInterval(d, { start: startOfDay(now), end: windowEnd })
  );
}

export function getRelativeLabel(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);

  if (isBefore(d, tomorrow) && isAfter(d, today)) return 'Today';
  if (isBefore(d, dayAfter) && isAfter(d, tomorrow)) return 'Tomorrow';

  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7 && diffDays > 0) return `In ${diffDays} days`;
  return formatDate(d);
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
