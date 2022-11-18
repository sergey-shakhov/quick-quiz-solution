import { format, parseISO, formatDuration as formatDurationFns, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDateAndTime(isoDateTime: string): string {
  return format(parseISO(isoDateTime), 'd MMMM yyyy, HH:mm', {
    locale: ru,
  });
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) {
    throw new Error('Have no support for negative second number');
  }
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  return formatDurationFns(duration, {
    locale: ru,
  });
}

export function formatDurationAsTimer(seconds: number): string {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

  const zeroPad = (n: number | undefined) => String(n).padStart(2, '0');

  const formatted = [
    duration.hours,
    duration.minutes,
    duration.seconds,
  ]
    .filter(Boolean)
    .map(zeroPad)
    .join(':');
  return formatted;
}
