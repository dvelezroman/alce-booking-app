export type EarlyWarningAlertTypeFilter =
  | 'low_scheduling'
  | 'long_stage'
  | 'both'
  | 'any';

export type EarlyWarningClassification = 'KIDS' | 'TEENS' | 'ADULTS';
export type EarlyWarningMode = 'ONLINE' | 'PRESENCIAL' | 'SEMIPRESENCIAL';

export interface EarlyWarningConfigDto {
  numberDaysNewStudent: number;
  minHoursScheduled: number;
  maxDaysInCurrentStage: number;
}

export interface EarlyWarningRowDto {
  studentId: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  emailAddress: string | null;
  contact: string | null;
  city: string | null;
  mode: EarlyWarningMode | null;
  studentClassification: EarlyWarningClassification | null;
  stageId: number | null;
  stageNumber: string | null;
  stageDescription: string | null;
  meetingsInWindow: number;
  minHoursScheduled: number;
  daysInStage: number;
  maxDaysInCurrentStage: number;
  stageEntryDate: string;
  lowScheduling: boolean;
  longTimeInStage: boolean;
  windowDays: number;
}

export interface EarlyWarningFilteredSummaryDto {
  lowSchedulingCount: number;
  longStageCount: number;
  bothCount: number;
  totalAtRisk: number;
}

export interface EarlyWarningListResponseDto {
  page: number;
  limit: number;
  totalCount: number;
  config: EarlyWarningConfigDto;
  items: EarlyWarningRowDto[];
  filteredSummary?: EarlyWarningFilteredSummaryDto;
}

export interface EarlyWarningSummaryDto {
  lowSchedulingCount: number;
  longStageCount: number;
  bothCount: number;
  totalAtRisk: number;
  config: EarlyWarningConfigDto;
  top: EarlyWarningRowDto[];
}

export interface EarlyWarningFilterOptionsDto {
  cities: string[];
  classifications: EarlyWarningClassification[];
  modes: EarlyWarningMode[];
}

export interface EarlyWarningListParams {
  page?: number;
  limit?: number;
  alertType?: EarlyWarningAlertTypeFilter;
  stageId?: number;
  search?: string;
  classification?: EarlyWarningClassification;
  mode?: EarlyWarningMode;
  city?: string;
  minDaysInStage?: number | null;
  maxDaysInStage?: number | null;
  minMeetingsInWindow?: number | null;
  maxMeetingsInWindow?: number | null;
}
