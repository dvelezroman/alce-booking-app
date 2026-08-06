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
