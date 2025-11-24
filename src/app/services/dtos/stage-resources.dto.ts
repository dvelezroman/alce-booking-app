import { Stage } from "./student.dto";

export interface StageAssessmentResource {
  id: number;
  stageId: number;
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