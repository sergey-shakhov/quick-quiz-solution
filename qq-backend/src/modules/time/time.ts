import { DateTime } from './models';
import { 
  differenceInSeconds as differenceInSecondsFns,
  add,
  format,
  intervalToDuration,
  formatDuration as formatDurationFns,
} from 'date-fns';
import { ru } from 'date-fns/locale';

function currentDateTime(): DateTime {
  return new Date();
}

function formatAsISODateTime(dateTime: DateTime): string {
  return dateTime.toISOString();
}

function formatForDisplaying(dateTime: DateTime): string {
  return format(dateTime, 'dd.MM.yyyy hh:mm:ss', {
    locale: ru, 
  });
}

function differenceInSeconds(laterDateTime: DateTime, earlierDateTime: DateTime) {
  return differenceInSecondsFns(laterDateTime, earlierDateTime);
}

function addSeconds(initialDateTime: DateTime, seconds: number): DateTime {
  return add(initialDateTime, { seconds });
}

function formatDuration(seconds: number): string {
  if (seconds < 0) {
    throw new Error('Have no support for negative second number');
  }
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  return formatDurationFns(duration, {
    locale: ru,
  });
}

export {
  currentDateTime,
  formatAsISODateTime,
  formatForDisplaying,
  differenceInSeconds,
  addSeconds,
  formatDuration,
};
