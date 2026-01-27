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
  accepted?: boolean;
  createdAt: string;
  updatedAt: string;
  meeting?: MeetingDTO;
  student?: Student;
  instructor?: Instructor;
}

export interface UpdateEvaluationAcceptanceDto {
  accepted: boolean;
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

export interface FilterEvaluationsDto {
  studentId?: number;
  instructorId?: number;
  from?: string;
  to?: string;
  accepted?: boolean;
  limit?: number;
  offset?: number;
}

// ----------------------------------------
// FILTER DTO (STATISTICS)
// ----------------------------------------
export interface EvaluationStatisticsFilterDto {
  instructorId?: number;
  from?: string;
  to?: string;
  minAverageRating?: number;
}

// ----------------------------------------
// RATING DISTRIBUTION
// ----------------------------------------
export interface RatingDistribution {
  [rating: number]: number;
}

// ----------------------------------------
// INSTRUCTOR STATISTICS
// ----------------------------------------
export interface InstructorEvaluationStatistics {
  instructorId: number;

  averageRating: number;
  totalEvaluations: number;
  observationsCount: number;

  ratingDistribution: RatingDistribution;

  recentEvaluations: InstructorEvaluation[];

  instructor?: Instructor;
}

// ----------------------------------------
// GLOBAL STATISTICS RESPONSE
// ----------------------------------------
export interface EvaluationStatisticsResponse {
  instructors: InstructorEvaluationStatistics[];
  overall: {
    averageRating?: number;
    totalEvaluations?: number;
    observationsCount?: number;
  };
}