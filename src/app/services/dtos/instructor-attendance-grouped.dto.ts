import { UserDto } from './user.dto';

export interface InstructorHoursPerDay {
  localhour: number;
  stages: {
  description: string;
  stageId: number;
  }[];
}

export interface InstructorGroupedData {
  _count: number;
  user: UserDto & { hours: InstructorHoursPerDay[] };
}

export type InstructorsGroupedByDate = {
  [date: string]: InstructorGroupedData[];
};