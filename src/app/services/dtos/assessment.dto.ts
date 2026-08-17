import { Instructor } from "./instructor.dto";
import { Student } from "./student.dto";

export enum AssessmentType {
  Speaking = 'Speaking',
  Grammar = 'Grammar',
  Writing = 'Writing',
  // Listening = 'Listening',
}

export interface AssessementI {
  id: number;
  type: AssessmentType;
  /** Omitted for student viewers (pass/fail only). */
  points?: number;
  /** Present for student viewers when points are redacted. */
  passed?: boolean;
  note?: any;
  studentId: number;
  stageId: number;
  instructorId: number;
  createdAt?: string;
  instructor?: Instructor;
  student?: Student;
  assessmentTypeId: number;
  assessmentType: {
    name: string;
    description: string;
  }
  updatedStage?: boolean;
   resources?: {
    id: number;
    title: string;
    link: string;
  }[];
}

export interface CreateAssessmentI {
  type: AssessmentType;
  points: number;
  note?: any;
  studentId: number;
  stageId: number;
  instructorId: number;
  assessmentTypeId: number;
  assessmentResourceIds: number[];
}

export interface UpdateAssessmentI {
  type?: AssessmentType;
  points?: number;
  note?: any;
  studentId?: number;
  stageId?: number;
  instructorId?: number;
  assessmentTypeId?: number;
}

export interface FilterAssessmentI {
  studentId?: string;
  instructorId?: string;
  stageId?: string;
  type?: AssessmentType;
  note?: any;
  assessmentTypeId?: number;
}

export interface AssessmentConfigI {
  id: number;
  minPointsAssessment: number;
  maxPointsAssessment: number;
  numberDaysNewStudent: number;
  minHoursScheduled: number;
}

export type AutomaticPromotionSource =
  | 'live'
  | 'backfill'
  | 'manual'
  | 'profile'
  | 'unknown';

export type StagePromotionReportCategory =
  | 'automatic'
  | 'live'
  | 'backfill'
  | 'manual'
  | 'profile';

export interface AutomaticPromotionRow {
  id: number;
  createdAt: string;
  studentId: number | null;
  studentFirstName: string | null;
  studentLastName: string | null;
  fromStage: string | null;
  toStage: string | null;
  source: AutomaticPromotionSource;
  processedById: number | null;
  processedByFirstName: string | null;
  processedByLastName: string | null;
  grammarPoints: number | null;
  grammarAssessedAt: string | null;
  speakingPoints: number | null;
  speakingAssessedAt: string | null;
}

export interface AutomaticPromotionsReport {
  data: AutomaticPromotionRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PromotionCronStatus {
  enabled: boolean;
}

export interface PromoteEligibleResult {
  scanned: number;
  promoted: number;
  promotedStudentIds: number[];
}

export interface EligiblePromotionPreview {
  studentId: number;
  firstName: string;
  lastName: string;
  currentStageId: number;
  currentStageNumber: string;
  nextStageId: number;
  nextStageNumber: string;
  grammarPoints: number;
  grammarAssessedAt: string;
  speakingPoints: number;
  speakingAssessedAt: string;
}
