import { StageAssessmentResource } from "./stage-resources.dto";

export interface CreateStageAssessmentDto {
  stageId: number;
  studentIds: number[];
  stageAssessmentResourceId: number;
  dueDate: string;
}

export interface StageAssessmentFilters {
  stageId?: number;
  createdBy?: number;
  stageAssessmentResourceId?: number;
  studentId?: number;
}

export interface StageAssessment {
  id: number;
  stageId: number;
  studentIds: number[];
  stageAssessmentResourceId: number;
  dueDate: string;
  finished: number[];
  createdBy: number;
  stage?: any;
  creator?: any;
  stageAssessmentResource?: StageAssessmentResource;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentAssessmentStatus {
  hasActive: boolean;
  count: number;
  assessments: StageAssessment[];
}