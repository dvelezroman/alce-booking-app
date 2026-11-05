import { DateTime } from 'luxon';
import {
  Announcement,
  AnnouncementShowSchedule,
} from '../../services/dtos/announcement.dto';

type ScheduleSource = Pick<
  Announcement,
  'showSchedule' | 'startDate' | 'endDate' | 'displayMode'
>;

function toLocalDateTime(
  value: string | null | undefined,
): DateTime | null {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = DateTime.fromISO(value);
    return parsed.isValid ? parsed : null;
  }

  const parsed = DateTime.fromISO(value, { setZone: true });
  if (!parsed.isValid) {
    return null;
  }

  return parsed.setZone('local');
}

/** Local calendar day index. Matches the API util. */
function localDayIndex(date: DateTime): number {
  return Math.floor(
    Date.UTC(date.year, date.month - 1, date.day) / 86_400_000,
  );
}

function isLocalDayWithinRange(
  year: number,
  month: number,
  day: number,
  start: DateTime | null,
  end: DateTime | null,
): boolean {
  const index = localDayIndex(
    DateTime.local(year, month, day),
  );
  if (start && index < localDayIndex(start)) {
    return false;
  }
  if (end && index > localDayIndex(end)) {
    return false;
  }
  return true;
}

/**
 * Whether the modal may appear on `date`'s local calendar day.
 * Banner-only announcements ignore the schedule.
 * Null / none / daily means every day inside the validity window.
 */
export function isAnnouncementScheduledForDate(
  announcement: ScheduleSource,
  date: DateTime,
): boolean {
  if (announcement.displayMode === 'banner') {
    return true;
  }

  const schedule: AnnouncementShowSchedule | null | undefined =
    announcement.showSchedule;
  if (
    !schedule ||
    schedule.kind === 'none' ||
    schedule.kind === 'daily'
  ) {
    return true;
  }

  const local = date.setZone('local');

  if (schedule.kind === 'every_n_days') {
    const anchor = toLocalDateTime(announcement.startDate);
    if (!anchor) {
      return false;
    }
    const diff = localDayIndex(local) - localDayIndex(anchor);
    if (diff < 0 || schedule.intervalDays < 1) {
      return false;
    }
    return diff % schedule.intervalDays === 0;
  }

  if (schedule.kind === 'weekly') {
    return local.weekday === schedule.weekday;
  }

  const start = toLocalDateTime(announcement.startDate);
  const end = toLocalDateTime(announcement.endDate);
  const daysInMonth = local.daysInMonth ?? 31;
  const eligible = [...new Set(schedule.daysOfMonth)]
    .filter((day) => day >= 1 && day <= daysInMonth)
    .sort((a, b) => a - b)
    .filter((day) =>
      isLocalDayWithinRange(
        local.year,
        local.month,
        day,
        start,
        end,
      ),
    );

  const limit = schedule.maxOccurrencesPerMonth;
  const allowed =
    limit && limit > 0 ? eligible.slice(0, limit) : eligible;

  return allowed.includes(local.day);
}
