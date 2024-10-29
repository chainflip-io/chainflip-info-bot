import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  intervalToDuration,
} from 'date-fns';

type Interval = {
  start: Date | number;
  end: Date | number;
};

const isNullish = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

const pluralize = (word: string, numb: number): string => (numb !== 1 ? `${word}s` : word);

export const differenceInTimeAgo = (
  time: string,
  ago = true,
  endTime = new Date().toISOString(),
): string => {
  const end = new Date(endTime);
  const timeNumber = Date.parse(time);
  const seconds = differenceInSeconds(end, timeNumber);

  if (seconds < 60) return `${seconds} sec${ago ? ' ago' : ''}`;

  const minutes = differenceInMinutes(end, timeNumber);
  if (minutes < 60) return `${minutes} min${ago ? ' ago' : ''}`;

  const hours = differenceInHours(end, timeNumber);
  if (hours < 48) return `${hours} ${pluralize('hour', hours)}${ago ? ' ago' : ''}`;

  const days = differenceInDays(end, timeNumber);
  return `${days} days${ago ? ' ago' : ''}`;
};

const pad = (number: number | undefined) => String(number ?? 0).padStart(2, '0');

// eg: "1h 2min 3s", "1day 2h 3min 4s"
export const intervalToDurationWords = (interval: Interval): string => {
  if (isNullish(interval.start) || isNullish(interval.end)) return '??';
  if (interval.end === 0) return '??';

  const duration = intervalToDuration(interval);

  if (duration.months) return '>1 month';
  if (duration.days) {
    return `${pad(duration.days)}${duration.days === 1 ? 'day' : 'days'} ${pad(
      duration.hours,
    )}h ${pad(duration.minutes)}min ${pad(duration.seconds)}s`;
  }
  if (duration.hours)
    return `${pad(duration.hours)}h ${pad(duration.minutes)}min ${pad(duration.seconds)}s`;
  if (duration.minutes) return `${pad(duration.minutes)}min ${pad(duration.seconds)}s`;
  if (duration.seconds) return `${pad(duration.seconds)}s`;
  return '??';
};
