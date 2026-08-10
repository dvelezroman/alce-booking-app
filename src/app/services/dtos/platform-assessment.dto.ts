export type PlatformAssessmentStatus = 'pending' | 'expired' | 'completed';
export type PlatformAssessmentOutcome = 'PASSED' | 'FAILED';

/** Row from GET /platform-assessments (points only for admin/instructor). */
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
  /** Admin / instructor only. */
  points?: number | null;
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
  mirrorId: number | null;
}

export interface RemotePlatformAssessmentListResponse {
  data: RemotePlatformAssessmentItem[];
  total: number;
  page: number;
  limit: number;
}
