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
