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
}

export interface StageAssessment {
  id: number;

  stageId: number;
  studentIds: number[];
  stageAssessmentResourceId: number;
  dueDate: string;

  createdAt: string;
  updatedAt: string;

  stage?: any;
  resource?: any;
  students?: any[];
  createdBy?: any;
}

export interface StudentAssessmentStatus {
  hasActive: boolean;
  count: number;
}