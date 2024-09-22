export interface MeetingDTO {
  id?: number;            // Optional for create; required for update
  studentId: number;     // ID of the student
  instructorId?: number; // Optional ID of the instructor
  date: Date;            // Date of the meeting
  hour: number;          // Hour of the meeting (24-hour format)
  stageId: number;       // ID of the stage
  link?: string;         // Optional link for the meeting
  present?: boolean;     // Optional attendance status
}

export interface CreateMeetingDto {
  studentId: number;
  instructorId?: number;
  stageId?: number;
  date: Date;
  hour: number;
}

export interface FilterMeetingsDto {
  date?: string;
  hour?: string;
  stageId?: string;
  studentId?: number;
  instructorId?: string;
  from?: string;
  to?: string;
}
