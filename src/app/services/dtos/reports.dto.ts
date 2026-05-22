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