import { MeetingDTO } from "./booking.dto";
import { Instructor } from "./instructor.dto";
import { Student } from "./student.dto";

export interface InstructorEvaluation {
  id: number;
  meetingId: number;
  studentId: number;
  instructorId: number;
  rating: number;
  observation?: string;
  createdAt: string;
  updatedAt: string;
  meeting?: MeetingDTO;
  student?: Student;
  instructor?: Instructor;
}

export interface CreateInstructorEvaluationDto {
  rating: number;
  observation?: string;
}

export interface PendingMeetingEvaluation {
  id: number;
  date: string;
  localdate: string;
  hour: number;
  localhour: number;
  status: string;
  present: boolean;
  mode: string;
  category: string;

  instructor: {
    id: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };

  stage?: {
    id: number;
    number: string;
    description: string;
  };

  meetingTheme?: {
    id: number;
    description: string;
  };
}