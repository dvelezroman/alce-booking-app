import { UserRole, UserStatus } from "./user.dto";

/**
 * Filtros para descargar el Excel general de usuarios
 * Endpoint: GET /v0/reports/users/excel
 */
export interface UsersExcelFilterDto {
  role?: UserRole;
  status?: UserStatus;
  stageId?: number;
  noClasses?: boolean;
}

/**
 * Filtros para descargar el Excel de estudiantes ausentes
 * Endpoint: GET /v0/reports/instructor/{instructorId}/absent-students/excel
 */
export interface AbsentStudentsExcelFilterDto {
  instructorId: number;
  from: string;
  to: string;
  stageId?: number;
}