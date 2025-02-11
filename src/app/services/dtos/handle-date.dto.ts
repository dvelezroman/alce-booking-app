export interface DisabledDays extends Record<string, number[]> {}

export interface DisabledDateAndHours {
  day: number;
  hours: number[];
}

export interface DisabledDatesAndHours extends Record<string, DisabledDateAndHours[]> {}

export interface SelectedDay {
  day: number,
  isDisabled: boolean,
  isHoursDisabled: boolean,
  hours: number[],
}
