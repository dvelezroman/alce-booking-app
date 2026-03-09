import { StageAssessmentResource } from "./stage-resources.dto";
import { Stage } from "./student.dto";

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
  creator?: StageAssessmentCreator;
  stage?: Stage;
  isPastDue?: boolean;
  stageAssessmentResource?: StageAssessmentResource;
  statusForStudent?: 'active' | 'completed' | 'agedOut';
  createdAt?: string;
  updatedAt?: string;
}

export interface StageAssessmentCreator {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
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
  pastDueCount?: number;
  assessments: StageAssessment[];
}