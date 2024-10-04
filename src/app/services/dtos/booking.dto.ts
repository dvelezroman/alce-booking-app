import {Stage, Student} from "./student.dto";
import {Instructor} from "./instructor.dto";

export interface MeetingDTO {
  id?: number;            // Optional for create; required for update
  studentId: number;     // ID of the student
  instructorId?: number; // Optional ID of the instructor
  date: Date;            // Date of the meeting
  hour: number;          // Hour of the meeting (24-hour format)
  stageId: number;       // ID of the stage
  link?: string;         // Optional link for the meeting
  present?: boolean;     // Optional attendance status
  student?: Student;
  instructor?: Instructor;
  stage?: Stage;
}

export interface CreateMeetingDto {
  studentId: number;
  instructorId?: number;
  stageId?: number;
  date: string;
  hour: number;
}

export class FilterMeetingsDto {
  date?: string;
  hour?: string;
  stageId?: string;
  studentId?: number;
  instructorId?: string;
  from?: string;
  to?: string;
  assigned?: boolean = false;
}

export interface UpdateMeetingLinkDto {
  date?: string;  // ISO date string format
  hour?: number;  // Hour in 24-hour format
  stageId?: number;
  link: string;  // The link to be updated
  meetingIds: number[]; // Ids of meetings to be updated
  instructorId?: number; // Id of the instructor to be added to meetings
}
