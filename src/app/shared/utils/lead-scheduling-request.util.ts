import {
  LeadSchedulingRequestKind,
  LeadSchedulingRequestRow,
  PlacementExamType,
} from '../../services/dtos/lead-scheduling-request.dto';

/** Legacy rows without placementExamType follow the speaking-test flow. */
export function isSpeakingPlacementExam(
  kind: LeadSchedulingRequestKind,
  placementExamType: PlacementExamType | null | undefined,
): boolean {
  return (
    kind === 'PLACEMENT_EXAM' && placementExamType !== 'PLACEMENT_TEST'
  );
}

export function isPlacementTestExam(
  kind: LeadSchedulingRequestKind,
  placementExamType: PlacementExamType | null | undefined,
): boolean {
  return kind === 'PLACEMENT_EXAM' && placementExamType === 'PLACEMENT_TEST';
}

export function leadSchedulingKindLabel(row: {
  kind: LeadSchedulingRequestKind;
  placementExamType?: PlacementExamType | null;
}): string {
  if (row.kind === 'DEMO_CLASS') return 'Demo / cortesía';
  if (isPlacementTestExam(row.kind, row.placementExamType)) {
    return 'Placement test';
  }
  if (isSpeakingPlacementExam(row.kind, row.placementExamType)) {
    return 'Speaking';
  }
  return 'Examen de ubicación';
}

export function normalizeExamLink(
  raw: string | null | undefined,
): string | null {
  if (raw === undefined || raw === null) return null;
  const t = String(raw).trim();
  return t.length ? t : null;
}

export function isSchedulingComplete(row: {
  kind: LeadSchedulingRequestKind;
  placementExamType?: PlacementExamType | null;
  instructorId?: number | null;
  scheduledDate?: string | null;
  scheduledHour?: number | null;
  examLink?: string | null;
}): boolean {
  const instructorId = row.instructorId ?? null;
  if (isPlacementTestExam(row.kind, row.placementExamType)) {
    return instructorId != null && normalizeExamLink(row.examLink) != null;
  }
  const d = row.scheduledDate;
  const h = row.scheduledHour;
  return (
    instructorId != null &&
    d != null &&
    String(d).trim() !== '' &&
    h != null &&
    h >= 0 &&
    h <= 23
  );
}

export function leadSchedulingScheduleSummary(
  row: LeadSchedulingRequestRow,
): string {
  if (isPlacementTestExam(row.kind, row.placementExamType)) {
    const link = row.examLink?.trim();
    return link ? 'Enlace de examen asignado' : 'Sin enlace de examen';
  }
  const d = row.scheduledDate;
  const h = row.scheduledHour;
  if (!d && h == null) return '—';
  const datePart = d
    ? new Date(
        d.includes('T') || d.endsWith('Z') ? d : `${d}T12:00:00`,
      ).toLocaleDateString('es')
    : '—';
  const hourPart = h != null ? `${h}:00` : '—';
  return `${datePart} · ${hourPart}`;
}
