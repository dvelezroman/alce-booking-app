import { StudentAssessment } from "./stage-assessment.dto";
import { Student, Stage } from "./student.dto";

/**
 * Progreso de un estudiante en un Stage específico
 */
export interface StageProgressDto {
  id: number;
  studentId: number;
  stageId: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  student: Student;
  stage: Stage;
  assessments?: StudentAssessment[];
}

/**
 * Lista completa del progreso del estudiante (los 19 stages)
 */
export type StageProgressList = StageProgressDto[];

/**
 * Progreso de un estudiante para un stage específico
 */
export type StageProgressSingle = StageProgressDto;

/**
 * Progreso de todos los estudiantes para un stage
 */
export type StageProgressByStage = StageProgressDto[];

/**
 * Respuesta del recálculo manual
 */
export interface StageProgressRecalculateResponse {
  message: string;
  updatedCount?: number;
}