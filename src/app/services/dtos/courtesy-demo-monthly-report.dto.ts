export type CourtesyDemoOutcomeBucket =
  | 'attended'
  | 'not_attended'
  | 'breached'
  | 'pending'
  | 'sin_fecha_alce';

export type CourtesyDemoMonthlyReportRow = {
  id: number;
  externalReferenceId: string | null;
  firstName: string;
  lastName: string;
  idNumber: string | null;
  email: string;
  courtesyClassHours: number | null;
  mode: string | null;
  status: string;
  scheduledDateYmd: string | null;
  scheduledHour: number | null;
  instructorId: number | null;
  instructorName: string | null;
  attendancePresent: boolean | null;
  hasInstructorReport: boolean;
  outcome: CourtesyDemoOutcomeBucket;
  requestingAdvisorName: string | null;
  requestingAdvisorEmail: string | null;
  requestingAdvisorOfficeLabel: string | null;
};

export type CourtesyDemoMonthlyInstructorTotals = {
  instructorId: number | null;
  instructorName: string | null;
  total: number;
  attended: number;
  notAttended: number;
  breached: number;
  pending: number;
};

export type CourtesyDemoMonthlyReportSummary = {
  periodLabel: string;
  startYmd: string;
  endYmd: string;
  total: number;
  attended: number;
  notAttended: number;
  breached: number;
  pending: number;
  attendanceRatePrimary: number | null;
  sinFechaAlceCount: number;
};

export type CourtesyDemoMonthlyReportResponse = {
  summary: CourtesyDemoMonthlyReportSummary;
  byInstructor: CourtesyDemoMonthlyInstructorTotals[];
  rows: CourtesyDemoMonthlyReportRow[];
};

export const COURTESY_DEMO_OUTCOME_LABEL: Record<
  CourtesyDemoOutcomeBucket,
  string
> = {
  attended: 'Asistió',
  not_attended: 'No asistió',
  breached: 'Incumplida',
  pending: 'Pendiente',
  sin_fecha_alce: 'Sin fecha',
};
