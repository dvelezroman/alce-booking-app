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
  students?: StageAssessmentStudent[];
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

export interface StudentAssessment {
  id: number;
  studentId: number;
  stageId: number;
  type: 'Grammar' | 'Speaking' | string;
  points: number;
  assessmentTypeId: number;
  assessmentType?: {
    id: number;
    name: string;
    description?: string | null;
  };
  
  assessmentResourceIds?: number[];
  note?: string;
  instructorId?: number;
  instructor?: {
    id: number;
    userId: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface StageAssessmentStudent {
  studentId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface StudentAssessmentStatus {
  hasActive: boolean;
  count: number;
  assessments: StageAssessment[];
}