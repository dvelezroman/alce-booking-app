export type EarlyWarningAlertTypeFilter =
  | 'low_scheduling'
  | 'long_stage'
  | 'both'
  | 'any';

export type EarlyWarningClassification = 'KIDS' | 'TEENS' | 'ADULTS';
export type EarlyWarningMode = 'ONLINE' | 'PRESENCIAL' | 'SEMIPRESENCIAL';

export type EarlyWarningFollowUpStatus = 'PENDING' | 'DONE';

export type EarlyWarningFollowUpChannel =
  | 'PHONE'
  | 'EMAIL'
  | 'MESSAGE'
  | 'WARNING_CALL';

export type EarlyWarningFollowUpFilter = 'all' | 'pending' | 'done';
export type EarlyWarningNoveltyFilter = 'all' | 'new';

export interface StageTenureStintDto {
  stageId: number;
  stageNumber: string | null;
  stageDescription: string | null;
  enteredAt: string;
  leftAt: string | null;
  days: number;
}

export interface StageTenureTotalDto {
  stageId: number;
  stageNumber: string | null;
  stageDescription: string | null;
  totalDays: number;
}

export interface EarlyWarningAlertNoveltyDto {
  alertType: 'low_scheduling' | 'long_stage';
  snapshotAt: string;
  firstSeen: boolean;
}

export type EarlyWarningIneligibleReason =
  | 'new_student'
  | 'suspended'
  | 'inactive'
  | null;

export interface EarlyWarningFollowUpDto {
  status: EarlyWarningFollowUpStatus;
  channel: EarlyWarningFollowUpChannel | null;
  notes: string | null;
  contactedAt: string | null;
  updatedAt: string;
  updatedBy: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export type EarlyWarningAttentionChannel = 'EMAIL' | 'WHATSAPP' | 'IN_APP';

export interface SendEarlyWarningAttentionCallDto {
  studentIds: number[];
  channels: EarlyWarningAttentionChannel[];
  title?: string;
  message: string;
  markFollowUpDone?: boolean;
}

export interface SendEarlyWarningAttentionCallResultDto {
  requested: number;
  inApp: { sent: number; failed: number; notificationId?: number };
  email: { sent: number; skipped: number; failed: number };
  whatsapp: {
    enqueued: number;
    skipped: number;
    failed: number;
    jobIds: string[];
  };
  followUpUpdated: number;
  errors: string[];
}

export interface UpsertEarlyWarningFollowUpDto {
  status: EarlyWarningFollowUpStatus;
  channel?: EarlyWarningFollowUpChannel | null;
  notes?: string | null;
  contactedAt?: string | null;
}

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
  followUp: EarlyWarningFollowUpDto | null;
  followUpPending: boolean;
  isNewAlert: boolean;
  stageTenureHistory?: StageTenureStintDto[];
  stageTenureTotals?: StageTenureTotalDto[];
}

export interface EarlyWarningStudentReportDto {
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
  userStatus: string;
  atRisk: boolean;
  ineligibleReason: EarlyWarningIneligibleReason;
  meetingsInWindow: number;
  minHoursScheduled: number;
  daysInStage: number;
  maxDaysInCurrentStage: number;
  stageEntryDate: string;
  lowScheduling: boolean;
  longTimeInStage: boolean;
  windowDays: number;
  stageTenureHistory: StageTenureStintDto[];
  stageTenureTotals: StageTenureTotalDto[];
  followUp: EarlyWarningFollowUpDto | null;
  followUpPending: boolean;
  isNewAlert: boolean;
  alertNovelties: EarlyWarningAlertNoveltyDto[];
  config: EarlyWarningConfigDto;
  daysUntilStageThreshold: number | null;
}

export interface EarlyWarningFilteredSummaryDto {
  lowSchedulingCount: number;
  longStageCount: number;
  bothCount: number;
  totalAtRisk: number;
  pendingFollowUpCount?: number;
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
  pendingFollowUpCount?: number;
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
  studentId?: number | null;
  search?: string;
  classification?: EarlyWarningClassification;
  mode?: EarlyWarningMode;
  city?: string;
  minDaysInStage?: number | null;
  maxDaysInStage?: number | null;
  minMeetingsInWindow?: number | null;
  maxMeetingsInWindow?: number | null;
  followUp?: EarlyWarningFollowUpFilter;
  novelty?: EarlyWarningNoveltyFilter;
}
