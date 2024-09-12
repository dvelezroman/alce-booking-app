export interface RegisterStudentDto {
  stageId: number;
  mode: Mode;
  userId: number | null | undefined;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  stageId: number;
  mode: Mode;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Stage {
  id: number;
  number: number;
  description: string;
}
