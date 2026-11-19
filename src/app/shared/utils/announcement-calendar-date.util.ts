import { DateTime } from 'luxon';

/** Calendar dates for announcements use Ecuador business time, not UTC day. */
export const ANNOUNCEMENT_CALENDAR_ZONE = 'America/Guayaquil';

export function announcementFormDateToApiStart(
  ymd: string,
): string {
  return DateTime.fromISO(ymd, {
    zone: ANNOUNCEMENT_CALENDAR_ZONE,
  })
    .startOf('day')
    .toUTC()
    .toISO()!;
}

export function announcementFormDateToApiEnd(
  ymd: string,
): string {
  return DateTime.fromISO(ymd, {
    zone: ANNOUNCEMENT_CALENDAR_ZONE,
  })
    .endOf('day')
    .toUTC()
    .toISO()!;
}

export function announcementApiDateToForm(
  iso: string,
): string {
  return DateTime.fromISO(iso, { setZone: true })
    .setZone(ANNOUNCEMENT_CALENDAR_ZONE)
    .toFormat('yyyy-MM-dd');
}

export function formatAnnouncementCalendarDate(
  value: string,
): string {
  const dt = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? DateTime.fromISO(value, {
        zone: ANNOUNCEMENT_CALENDAR_ZONE,
      })
    : DateTime.fromISO(value, { setZone: true }).setZone(
        ANNOUNCEMENT_CALENDAR_ZONE,
      );

  if (!dt.isValid) {
    return value;
  }

  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: ANNOUNCEMENT_CALENDAR_ZONE,
  }).format(dt.toJSDate());
}

export function announcementCalendarYmd(
  date: Date,
): string {
  return DateTime.fromJSDate(date)
    .setZone(ANNOUNCEMENT_CALENDAR_ZONE)
    .toFormat('yyyy-MM-dd');
}

export function isAnnouncementExpiredOnCalendar(
  endDateIso: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!endDateIso) {
    return false;
  }

  const endYmd = announcementApiDateToForm(endDateIso);
  const nowYmd = announcementCalendarYmd(now);

  return nowYmd > endYmd;
}

export function isAnnouncementBeforeStartOnCalendar(
  startDateIso: string,
  now: Date = new Date(),
): boolean {
  const startYmd = announcementApiDateToForm(startDateIso);
  const nowYmd = announcementCalendarYmd(now);

  return nowYmd < startYmd;
}