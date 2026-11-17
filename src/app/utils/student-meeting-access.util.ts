import { MeetingDTO } from '../services/dtos/booking.dto';

export type StudentMeetingLinkStatus =
  | 'clickable'
  | 'not-clickable'
  | 'not-available';

/** Acceso desde 5 minutos antes del inicio. */
export const STUDENT_CLASS_ACCESS_BEFORE_MS = 5 * 60 * 1000;

/** Ventana inicial para el primer ingreso (hasta 6 min después del inicio). */
export const STUDENT_CLASS_ACCESS_INITIAL_AFTER_MS = 6 * 60 * 1000;

/** Duración estándar de la clase (1 hora). */
export const STUDENT_CLASS_DURATION_MS = 60 * 60 * 1000;

/**
 * Hora de inicio en UTC, alineada con Ecuador (misma lógica que live classes).
 */
export function getStudentMeetingStartUtcMs(
  meeting: MeetingDTO,
): number | null {
  const rawDate =
    meeting.localdate ?? meeting.date;

  const rawHour =
    meeting.localhour ?? meeting.hour;

  if (
    !rawDate ||
    rawHour === null ||
    rawHour === undefined
  ) {
    return null;
  }

  const datePart = String(rawDate).slice(0, 10);

  const [year, month, day] = datePart
    .split('-')
    .map(Number);

  const hour = Number(rawHour);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    hour < 0 ||
    hour > 23
  ) {
    return null;
  }

  return Date.UTC(
    year,
    month - 1,
    day,
    hour + 5,
    0,
    0,
    0,
  );
}

/**
 * Fin del acceso al enlace:
 * - Sin `linkOpened`: ventana inicial (inicio + 6 min).
 * - Con `linkOpened`: fin de la hora de clase (inicio + 1 h).
 */
export function getStudentMeetingAccessEndUtcMs(
  meeting: MeetingDTO,
): number | null {
  const meetingStart =
    getStudentMeetingStartUtcMs(meeting);

  if (meetingStart === null) {
    return null;
  }

  if (meeting.linkOpened) {
    return meetingStart + STUDENT_CLASS_DURATION_MS;
  }

  return (
    meetingStart +
    STUDENT_CLASS_ACCESS_INITIAL_AFTER_MS
  );
}

/**
 * El estudiante puede abrir el enlace si está en ventana y ya abrió una vez
 * dentro de la ventana permitida, o si aún no ha abierto pero está en ventana inicial.
 */
export function canStudentEnterMeeting(
  meeting: MeetingDTO,
  nowMs: number = Date.now(),
): boolean {
  const meetingStart =
    getStudentMeetingStartUtcMs(meeting);

  if (meetingStart === null) {
    return false;
  }

  const availableFrom =
    meetingStart - STUDENT_CLASS_ACCESS_BEFORE_MS;

  const accessEnd =
    getStudentMeetingAccessEndUtcMs(meeting);

  if (accessEnd === null) {
    return false;
  }

  return nowMs >= availableFrom && nowMs <= accessEnd;
}

/** Estado del enlace en modales y vistas de agendamiento (estudiante). */
export function getStudentMeetingLinkStatus(
  meeting: MeetingDTO,
  nowMs: number = Date.now(),
): StudentMeetingLinkStatus {
  const link = meeting.link?.trim();

  if (!link) {
    return 'not-available';
  }

  if (canStudentEnterMeeting(meeting, nowMs)) {
    return 'clickable';
  }

  const meetingStart =
    getStudentMeetingStartUtcMs(meeting);

  if (meetingStart === null) {
    return 'not-available';
  }

  const availableFrom =
    meetingStart - STUDENT_CLASS_ACCESS_BEFORE_MS;

  if (nowMs < availableFrom) {
    return 'not-clickable';
  }

  return 'not-available';
}

/** Marca enlace abierto en reunión y en lista (misma referencia si aplica). */
export function markStudentMeetingLinkOpened(
  meeting: MeetingDTO,
  meetings?: MeetingDTO[],
): void {
  meeting.linkOpened = true;

  if (!meeting.id || !meetings?.length) {
    return;
  }

  const inList = meetings.find(
    (item) => item.id === meeting.id,
  );

  if (inList && inList !== meeting) {
    inList.linkOpened = true;
  }
}