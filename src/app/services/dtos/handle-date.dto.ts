export interface DisabledDays extends Record<string, number[]> {}

export interface DisabledDateAndHours {
  day: number;
  hours: number[];
}

export interface DisabledDatesAndHours extends Record<string, DisabledDateAndHours[]> {}
