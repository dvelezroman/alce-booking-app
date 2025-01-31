import { DateTime } from "luxon";

export const convertToLocalTimeZone = (dateStr: string): Date => {
  const date = new Date(dateStr);

  // Get the local time zone offset in minutes and apply it
  const timeZoneOffset = date.getTimezoneOffset(); // Difference in minutes
  date.setMinutes(date.getMinutes() - timeZoneOffset);

  return date;
};

export const monthMap = (monthName: string) => {
  return ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',].findIndex(month => month === monthName.toLowerCase());
};

export const getTimezoneOffsetHours = (tz1: string = "America/Guayaquil"): number => {
  const now = DateTime.utc();

  // Get the computer's current timezone
  const tz2 = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get the offsets in hours
  const offset1 = now.setZone(tz1).offset / 60;
  const offset2 = now.setZone(tz2).offset / 60;

  return offset2 - offset1;
}

export const convertEcuadorHourToLocal = (hourInEcuador: number): number => {
  const ecuadorTz = "America/Guayaquil";
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Create a DateTime object for Ecuador with the given hour
  const ecuadorTime = DateTime.now().setZone(ecuadorTz).set({ hour: hourInEcuador, minute: 0, second: 0 });

  // Convert to local timezone and extract the hour
  return ecuadorTime.setZone(localTz).hour;
}

export const convertEcuadorDateToLocal = (dateStr: string): string =>{
  const ecuadorTz = "America/Guayaquil";
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Ensure the date string is correctly formatted
  const dateInEcuador = DateTime.fromISO(dateStr, { zone: ecuadorTz });

  // Check if parsing is valid
  if (!dateInEcuador.isValid) {
    throw new Error(`Invalid DateTime format: ${dateStr}`);
  }

  // Convert to local timezone
  return dateInEcuador.setZone(localTz).toFormat("yyyy-MM-dd HH:mm:ss");
}
