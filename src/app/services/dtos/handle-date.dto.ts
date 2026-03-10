import { Mode, StudentClassification } from "./student.dto";

export interface DisabledDays extends Record<string, number[]> {}

export interface DisabledDateAndHours {
  date: string;
  hours: number[];
  studentClassification?: StudentClassification;
  mode?: Mode;
  city?: City;
}

export interface DisabledDatesAndHours extends Record<string, { day: number, hours: number[] }[]> {}

export interface SelectedDay {
  day: number,
  isDisabled: boolean,
  isHoursDisabled: boolean,
  hours: number[],
}

export type City = 'PORTOVIEJO' | 'CUENCA';