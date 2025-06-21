import {Mode, Stage, Student, StudentClassification} from "./student.dto";
import {Instructor} from "./instructor.dto";
import {MeetingThemeDto} from "./meeting-theme.dto";
import { StudyContentDto } from "./study-content.dto";
import { AssessementI } from "./assessment.dto";

export interface MeetingDTO {
  id?: number;            // Optional for create; required for update
  studentId: number;     // ID of the student
  instructorId?: number; // Optional ID of the instructor
  date: Date;            // Date of the meeting
  hour: number;          // Hour of the meeting (24-hour format)
  localdate: Date;
  localhour: number;
  stageId: number;       // ID of the stage
  link?: string;         // Optional link for the meeting
  password?: string;    // Optional password for meeting
  present?: boolean;     // Optional attendance status
  student?: Student;
  instructor?: Instructor;
  stage?: Stage;
  mode: Mode
  category: StudentClassification;
  meetingThemeId: number;
  meetingTheme: MeetingThemeDto;
  status: string;
  meetings?: MeetingDTO[];
  assignedBy?: AssignedByDTO;
  assignedAt?: Date;
  markAssistanceByUser?: MarkedAssistanceByDTO;
  markAssistanceAt?: Date;
  markAssistanceById?: number;
  linkOpened?: boolean;
  studyContentId?: number[];
  studyContent?: StudyContentDto[];
  isNewUser?: boolean;
  assessment?: AssessementI;
  hasReinforcement?: boolean;
}

export interface AssignedByDTO {
  lastName: string;
  firstName: string;
}

export interface MarkedAssistanceByDTO {
  lastName: string;
  firstName: string;
}

export interface CreateMeetingDto {
  studentId: number;
  instructorId?: number;
  stageId?: number;
  date: string;
  localdate: string;
  hour: number;
  localhour: number;
  mode: Mode;
  category?: StudentClassification;
  link?: string;
  password?: string;
  assignedBy?: number;
  createdByInstructor?: boolean;
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
  present?: string;
  category?: StudentClassification;
  status?: MeetingStatusEnum;
  mode?: Mode;
}

export enum MeetingStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  DELETED = 'DELETED',
}

export class FilterInstructorMeetingDto {
  date?: string;
  instructorId?: string;
  from?: string;
  to?: string;
  present?: string;
}

export interface UpdateMeetingLinkDto {
  date?: string;  // ISO date string format
  hour?: number;  // Hour in 24-hour format
  stageId?: number;
  link: string;  // The link to be updated
  meetingIds: number[]; // Ids of meetings to be updated
  instructorId?: number; // Id of the instructor to be added to meetings
  password?: string;
}

export interface MeetingLinkDto {
  id: number;
  link: string;
  description?: string;
  password?: string;
}

export interface InstructorAttendanceDto {
  date: string,
  localdate: string,
  hour: number,
  localhour: number,
  instructorId: number,
  meetings: MeetingDTO[],
}
