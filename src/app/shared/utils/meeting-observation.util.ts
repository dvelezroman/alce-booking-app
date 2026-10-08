import { MeetingDTO } from '../../services/dtos/booking.dto';

/**
 * Texto mostrado en columna «Observación» (Agenda instructor y vistas alineadas).
 */
export function getMeetingObservationText(
  meeting: MeetingDTO | null | undefined,
): string {
  if (!meeting) {
    return '';
  }

  const assessmentNote =
    meeting.assessments?.[0]?.note?.trim() ?? '';

  const userComment =
    meeting.student?.user?.comment?.trim() ?? '';

  return assessmentNote || userComment;
}
