import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  MeetingDTO,
} from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-attendance-student-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-student-table.component.html',
  styleUrl: './attendance-student-table.component.scss',
})
export class AttendanceStudentTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() meetings: MeetingDTO[] = [];

  @Input() searchAttempted = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() themeRequested =
    new EventEmitter<MeetingDTO>();


  /* =========================
     TABLE
  ========================= */

  trackByMeetingId(
    index: number,
    meeting: MeetingDTO,
  ): number | string {
    return meeting.id ?? index;
  }


  /* =========================
     THEME
  ========================= */

  onViewTheme(meeting: MeetingDTO): void {
    this.themeRequested.emit(meeting);
  }


  /* =========================
     ATTENDANCE
  ========================= */

  isAttended(meeting: MeetingDTO): boolean {
    return meeting.present === true;
  }

  isAbsent(meeting: MeetingDTO): boolean {
    return meeting.present === false;
  }

  getAttendanceLabel(meeting: MeetingDTO): string {
    if (this.isAttended(meeting)) {
      return 'Asistió';
    }

    if (this.isAbsent(meeting)) {
      return 'Ausente';
    }

    return 'Pendiente';
  }

  getAttendanceClass(meeting: MeetingDTO): string {
    if (this.isAttended(meeting)) {
      return 'attendance-student-table__status--attended';
    }

    if (this.isAbsent(meeting)) {
      return 'attendance-student-table__status--absent';
    }

    return 'attendance-student-table__status--pending';
  }


  /* =========================
     DATE
  ========================= */

  getMeetingDate(meeting: MeetingDTO): string {
    if (!meeting.date) {
      return '—';
    }

    const date = new Date(meeting.date);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(date);
  }


  /* =========================
     HOUR
  ========================= */

  getMeetingHour(meeting: MeetingDTO): string {
    const rawHour = meeting.hour;

    if (
      rawHour === undefined ||
      rawHour === null
    ) {
      return '—';
    }

    const numericHour = Number(rawHour);

    if (Number.isNaN(numericHour)) {
      return '—';
    }

    const period = numericHour >= 12 ? 'PM' : 'AM';

    const normalizedHour =
      numericHour > 12
        ? numericHour - 12
        : numericHour === 0
          ? 12
          : numericHour;

    return `${normalizedHour}:00 ${period}`;
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  getInstructorName(meeting: MeetingDTO): string {
    const meetingAny = meeting as any;

    const instructor =
      meetingAny.instructor;

    if (!instructor) {
      return 'Sin instructor';
    }

    const firstName =
      instructor.user?.firstName ||
      instructor.firstName ||
      '';

    const lastName =
      instructor.user?.lastName ||
      instructor.lastName ||
      '';

    const fullName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || 'Sin instructor';
  }


  /* =========================
     STAGE
  ========================= */

  getStage(meeting: MeetingDTO): string {
    const meetingAny = meeting as any;

    return (
      meetingAny.stage?.number ||
      meetingAny.stage?.description ||
      meeting.stageId?.toString() ||
      '—'
    );
  }


  /* =========================
     THEME
  ========================= */

  getTheme(meeting: MeetingDTO): string {
    return (
      meeting.meetingTheme?.description ||
      'Sin tema registrado'
    );
  }


  /* =========================
     OBSERVATION
  ========================= */

  getObservation(meeting: MeetingDTO): string {
    const meetingAny = meeting as any;

    return (
      meetingAny.assistanceNote ||
      meetingAny.note ||
      meetingAny.comment ||
      '—'
    );
  }


  /* =========================
     RESULTS
  ========================= */

  get hasResults(): boolean {
    return this.meetings.length > 0;
  }

  get showEmptySearch(): boolean {
    return (
      this.searchAttempted &&
      this.meetings.length === 0
    );
  }
}