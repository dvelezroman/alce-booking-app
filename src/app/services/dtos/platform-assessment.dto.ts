export type PlatformAssessmentStatus = 'pending' | 'expired' | 'completed';
export type PlatformAssessmentOutcome = 'PASSED' | 'FAILED';

/** Student-safe row from GET /platform-assessments */
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
}
