import {UserDto} from "./user.dto";

export interface RegisterStudentDto {
  id?: number;
  stageId?: number;
  mode: Mode;
  userId: number | null | undefined;
}

export interface Student {
  id: number;
  name?: string;
  email?: string;
  stageId: number;
  mode: Mode;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: UserDto;
  stage?: Stage;
  studentClassification?: StudentClassification;
}

export enum StudentClassification {
  ADULTS = "ADULTS",
  TEENS = "TEENS",
  KIDS = "KIDS",
}

export enum Mode {
  PRESENCIAL = 'PRESENCIAL',
  ONLINE = 'ONLINE'
}

export interface RegisterStudentResponseDto {
  id: number;
  mode: Mode;
  stageId: number;
  userId: number;
  stage: Stage;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Stage {
  id: number;
  number: string;
  description: string;
}

export interface CreateStageDto {
  number: string;
  description: string;
}

export interface UpdateStageDto {
  number?: string;
  description?: string;
}

export interface CreateLinkDto {
  description: string;
  link: string;
  password?: string;
}

export interface UpdateLinkDto {
  description?: string;
  link?: string;
  password?: string;
}
