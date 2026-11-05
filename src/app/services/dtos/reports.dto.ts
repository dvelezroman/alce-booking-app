import { UserRole, UserStatus } from "./user.dto";

/**
 * Filtros para descargar el Excel general de usuarios
 * Endpoint: GET /v0/reports/users/excel
 */
export interface UsersExcelFilterDto {
  role?: UserRole;
  status?: UserStatus;
  stageId?: number;
  noClasses?: boolean | null;
}

/**
 * Filtros para descargar el Excel de estudiantes ausentes
 * Endpoint: GET /v0/reports/instructor/{instructorId}/absent-students/excel
 */
export interface AbsentStudentsExcelFilterDto {
  // instructorId: number;
  from: string;
  to: string;
  stageId?: number;
}

/** Filtros para POST /reports/active-students/jobs */
export interface ActiveStudentsReportFiltersDto {
  stageId?: number;
  noClasses?: boolean;
}

export interface ActiveStudentsReportJobCreatedDto {
  jobId: string;
  status: string;
  createdAt: string;
}

export interface ActiveStudentsReportJobStatusDto {
  jobId: string;
  status: string;
  fileName?: string;
  rowCount?: number;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

export type DistractedGroupBy = 'meeting' | 'student';
export type DistractedDatePreset = 'today' | '7' | '30' | 'custom';

export interface DistractedStudentsFilterDto {
  from: string;
  to: string;
  groupBy: DistractedGroupBy;
  page?: number;
  limit?: number;
  studentId?: number | null;
  meetingId?: number | null;
  classDate?: string | null;
  classHour?: number | null;
  stageId?: number | null;
  instructorId?: number | null;
  category?: 'KIDS' | 'TEENS' | 'ADULTS' | null;
  search?: string | null;
  hasBehaviorComment?: boolean;
}

export interface DistractedPersonDto {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  category?: string;
}

export interface DistractedStageDto {
  id: number;
  number: string;
  description: string | null;
}

export interface DistractedMeetingRowDto {
  meetingId: number;
  student: DistractedPersonDto;
  stage: DistractedStageDto | null;
  localdate: string | null;
  localhour: number | null;
  instructor: { id: number; firstName: string | null; lastName: string | null } | null;
  studentBehaviorComment: string | null;
  distractedMarkedAt: string | null;
  markedBy: { firstName: string | null; lastName: string | null } | null;
}

export interface DistractedStudentRowDto {
  student: DistractedPersonDto;
  stage: DistractedStageDto | null;
  distractedCount: number;
  attendedCount: number;
  distractionRate: number | null;
  lastDistractedAt: string | null;
  lastDistractedHour: number | null;
}

export interface DistractedStudentsListResponseDto {
  groupBy: DistractedGroupBy;
  items: DistractedMeetingRowDto[] | DistractedStudentRowDto[];
  total: number;
  page: number;
  limit: number;
  summary: {
    totalEvents: number;
    uniqueStudents: number;
    dateRange: { from: string; to: string };
  };
}