export type EarlyWarningAlertTypeFilter =
  | 'low_scheduling'
  | 'long_stage'
  | 'any';

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

export interface EarlyWarningListResponseDto {
  page: number;
  limit: number;
  totalCount: number;
  config: EarlyWarningConfigDto;
  items: EarlyWarningRowDto[];
}

export interface EarlyWarningSummaryDto {
  lowSchedulingCount: number;
  longStageCount: number;
  bothCount: number;
  totalAtRisk: number;
  config: EarlyWarningConfigDto;
  top: EarlyWarningRowDto[];
}

export interface EarlyWarningListParams {
  page?: number;
  limit?: number;
  alertType?: EarlyWarningAlertTypeFilter;
  stageId?: number;
  search?: string;
}
