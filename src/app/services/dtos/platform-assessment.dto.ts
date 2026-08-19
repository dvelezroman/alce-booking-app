export type PlatformAssessmentStatus =
  | 'pending'
  | 'expired'
  | 'completed'
  | 'focus_guard';
export type PlatformAssessmentOutcome = 'PASSED' | 'FAILED';
export type PlatformAssessmentSubmitReason =
  | 'MANUAL'
  | 'TIMEOUT'
  | 'FOCUS_GUARD';

/** Row from GET /platform-assessments (points only for ADMIN; students get resultsUrl). */
export interface PlatformAssessmentAssignment {
  id: number;
  assignmentId: string;
  templateId: string;
  templateTitle: string;
  directAccessUrl: string | null;
  shareUrl: string | null;
  expiresAt: string | null;
  maxAttempts: number | null;
  assignedAt: string | null;
  sessionId: string | null;
  resultsUrl: string | null;
  outcome: PlatformAssessmentOutcome | null;
  studentStage: number | null;
  completedAt: string | null;
  status: PlatformAssessmentStatus;
  submitReason?: PlatformAssessmentSubmitReason | null;
  /** Admin / instructor only. */
  points?: number | null;
  /** Admin / instructor: Writing already linked (S2S auto or prior apply). */
  writingApplied?: boolean;
  writingAccepted?: boolean;
  writingAssessmentId?: number | null;
  writingPoints?: number | null;
}

export interface ApplyWritingScoreResult {
  platformAssignmentId: number;
  assignmentId: string;
  points: number;
  assessmentId: number;
  updatedStage: boolean;
  created: boolean;
}

/** Filters for GET /platform-assessments/remote (admin live list). */
export interface RemotePlatformAssessmentFilters {
  page?: number;
  limit?: number;
  studentId?: number | string;
  externalStudentId?: string;
  status?: string;
  templateId?: string;
  templateTitle?: string;
  studentStage?: number;
  outcome?: 'PASSED' | 'FAILED' | 'NONE' | '';
  assignedFrom?: string;
  assignedTo?: string;
  completedFrom?: string;
  completedTo?: string;
}

/** Row from GET /platform-assessments/remote. */
export interface RemotePlatformAssessmentItem {
  assignmentId: string;
  templateId: string;
  templateTitle: string;
  studentId: number | null;
  externalStudentId: string;
  studentFirstName: string | null;
  studentLastName: string | null;
  studentDisplayName: string | null;
  studentStageSnapshot: number | null;
  status: string;
  expiresAt: string | null;
  maxAttempts: number;
  attemptCount: number;
  assignedAt: string;
  shareUrl: string | null;
  directAccessUrl: string | null;
  sessionId: string | null;
  resultsUrl: string | null;
  outcome: PlatformAssessmentOutcome | null;
  points: number | null;
  completedAt: string | null;
  submitReason?: PlatformAssessmentSubmitReason | null;
  mirrorId: number | null;
  writingApplied: boolean;
  writingAccepted: boolean;
  writingAssessmentId: number | null;
  writingPoints: number | null;
}

export interface RemoteTemplateItem {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number;
  passingScorePercent: number;
  isActive: boolean;
  resultReleasePolicy: string;
  targetStage: number;
  stages: number[];
}

export interface RemoteTemplateListResponse {
  data: RemoteTemplateItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AssignPlatformStudentPayload {
  studentId: number;
  name?: string;
  email?: string;
  stageNumber?: string;
}

export interface AssignPlatformAssessmentsPayload {
  students: AssignPlatformStudentPayload[];
  expiresAt: string;
  maxAttempts?: number;
}

export interface AssignPlatformAssessmentsResult {
  batchId: string;
  templateId: string;
  shareUrl: string;
  created: Array<{
    assignmentId: string;
    studentId: number;
    studentName: string | null;
    studentStage: number | null;
    accessCodeLast4: string;
    status: string;
  }>;
  failed: Array<{
    studentId: number | null;
    externalStudentId: string;
    reason: string;
  }>;
}

export interface PlatformAssignmentMutationResult {
  assignmentId: string;
  templateId: string;
  externalStudentId: string;
  studentId: number | null;
  status: string;
  expiresAt: string | null;
  maxAttempts: number;
  attemptCount: number;
  mirrorId: number | null;
}

export interface RemotePlatformAssessmentListResponse {
  data: RemotePlatformAssessmentItem[];
  total: number;
  page: number;
  limit: number;
}
