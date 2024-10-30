export const convertToLocalTimeZone = (dateStr: string): Date => {
  const date = new Date(dateStr);

  // Get the local time zone offset in minutes and apply it
  const timeZoneOffset = date.getTimezoneOffset(); // Difference in minutes
  date.setMinutes(date.getMinutes() - timeZoneOffset);

  return date;
};
