import { Instructor } from "./instructor.dto";
import { Student } from "./student.dto";

export enum AssessmentType {
  Speaking = 'Speaking',
  Grammar = 'Grammar',
  // Listening = 'Listening',
  // Writing = 'Writing',
}

export interface AssessementI {
  id: number;
  type: AssessmentType;
  points: number;
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
}

export interface CreateAssessmentI {
  type: AssessmentType;
  points: number;
  note?: any;
  studentId: number;
  stageId: number;
  instructorId: number;
  assessmentTypeId: number;
}

export interface UpdateAssessmentI {
  type: AssessmentType;
  points: number;
  note?: any;
  studentId: number;
  stageId: number;
  instructorId: number;
  assessmentTypeId: number;
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
}
