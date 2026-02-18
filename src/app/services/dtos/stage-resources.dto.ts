import { Stage } from "./student.dto";

export interface StageAssessmentResourceStudent {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  stageEntryDate: string;
  lastPassedAssessmentDates?: Record<number, string>;
}

export interface StageAssessmentResource {
  id: number;
  stageId: number;
  students?: StageAssessmentResourceStudent[];
  stage?: Stage;
  description: string;
  url: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStageAssessmentResourceDto {
  stageId: number;
  description: string;
  url: string;
  active: boolean;
}

export interface UpdateStageAssessmentResourceDto {
  stageId?: number;
  description?: string;
  url?: string;
  active?: boolean;
}