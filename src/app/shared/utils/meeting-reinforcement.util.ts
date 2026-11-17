import { MeetingDTO } from '../../services/dtos/booking.dto';
import { AssessementI } from '../../services/dtos/assessment.dto';

/** Same truthiness as agenda modal (`!!a.note`). */
function assessmentHasNote(note: AssessementI['note']): boolean {
  if (note == null) {
    return false;
  }
  if (typeof note === 'string') {
    return note.trim().length > 0;
  }
  return true;
}

function assessmentsIndicateReinforcement(
  assessments: AssessementI[] | undefined,
): boolean {
  if (!assessments?.length) {
    return false;
  }
  return assessments.some(
    a =>
      assessmentHasNote(a.note) ||
      (a.resources != null && a.resources.length > 0),
  );
}

/**
 * Whether the Observación column should show the Refuerzo state
 * (notes or resources on any student assessment, or API-provided flag).
 */
export function meetingHasReinforcement(
  meeting: MeetingDTO | null | undefined,
): boolean {
  if (!meeting) {
    return false;
  }
  if (meeting.hasReinforcement === true) {
    return true;
  }
  return assessmentsIndicateReinforcement(meeting.assessments);
}