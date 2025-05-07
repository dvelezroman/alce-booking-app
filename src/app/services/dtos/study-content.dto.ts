export interface StudyContentDto {
  id: number;
  stageId: number;
  stage: {
    id: number;
    description: string;
    number: string;
  };
  unit: number;
  title: string;
  description: string;
  content?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  disabledAt?: Date;
}

export interface StudyContentCreateDto {
  stageId: number;
  unit: number;
  title: string;
  description: string;
  content?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  disabledAt?: Date;
}

export interface StudyContentUpdateDto {
  id?: number;
  stageId?: number;
  unit?: number;
  title?: string;
  description?: string;
  content?: string;
  enabled?: boolean;
}
