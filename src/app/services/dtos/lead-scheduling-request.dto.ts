export type LeadSchedulingRequestKind = 'DEMO_CLASS' | 'PLACEMENT_EXAM';

export type PlacementExamType = 'PLACEMENT_TEST' | 'SPEAKING_TEST';

export type LeadSchedulingRequestStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface LeadSchedulingStageRef {
  id: number;
  number: string;
  description: string | null;
}

export interface LeadSchedulingInstructorUserRef {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface LeadSchedulingInstructorRef {
  id: number;
  userId: number;
  user: LeadSchedulingInstructorUserRef;
}

export interface LeadSchedulingAssignedByRef {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface LeadSchedulingRequestRow {
  id: number;
  kind: LeadSchedulingRequestKind;
  /** Present when kind is PLACEMENT_EXAM; null on legacy rows (speaking flow). */
  placementExamType?: PlacementExamType | null;
  status: LeadSchedulingRequestStatus;
  externalReferenceId?: string | null;
  firstName: string;
  lastName: string;
  idNumber?: string | null;
  email: string;
  contactPhone: string;
  requestingAdvisorName?: string | null;
  requestingAdvisorEmail?: string | null;
  requestingAdvisorPhone?: string | null;
  requestingAdvisorOfficeLabel?: string | null;
  stageId?: number | null;
  stage?: LeadSchedulingStageRef | null;
  courtesyClassHours?: number | null;
  requestNotes?: string | null;
  instructorId?: number | null;
  instructor?: LeadSchedulingInstructorRef | null;
  assignedBy?: LeadSchedulingAssignedByRef | null;
  scheduledDate?: string | null;
  scheduledHour?: number | null;
  /** Placement test exam URL (admin PATCH). */
  examLink?: string | null;
  adminNotes?: string | null;
  attendancePresent?: boolean | null;
  instructorReportNotes?: string | null;
  instructorReportSubmittedAt?: string | null;
  reportSubmittedByInstructorId?: number | null;
  reportSubmittedByInstructor?: LeadSchedulingInstructorRef | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface LeadSchedulingListResponse {
  items: LeadSchedulingRequestRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface SubmitLeadSchedulingInstructorReportDto {
  /** Required for demo class and speaking; omit for placement test. */
  attendancePresent?: boolean;
  instructorReportNotes: string;
}

/** Cuerpo de `PATCH /lead-scheduling-requests/:id` (admin). Campos opcionales; `null` limpia según API. */
export interface UpdateLeadSchedulingAdminDto {
  instructorId?: number | null;
  scheduledDate?: string | null;
  scheduledHour?: number | null;
  examLink?: string | null;
  status?: LeadSchedulingRequestStatus;
  adminNotes?: string | null;
}
