import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { MeetingDTO } from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-attendance-student-info',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-student-info.component.html',
  styleUrl: './attendance-student-info.component.scss',
})
export class AttendanceStudentInfoComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() studentId: number | undefined;

  @Input() studentName: string = '';

  @Input() meetings: MeetingDTO[] = [];


  /* =========================
     STUDENT
  ========================= */

  get hasStudentSelected(): boolean {
    return !!this.studentId;
  }

  get displayStudentName(): string {
    return this.studentName || 'Estudiante no seleccionado';
  }


  /* =========================
     LAST MEETING
  ========================= */

  get lastMeeting(): MeetingDTO | null {
    if (this.meetings.length === 0) {
      return null;
    }

    return [...this.meetings]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      )[0];
  }


  get lastMeetingDate(): string {
    if (!this.lastMeeting?.date) {
      return '—';
    }

    const date = new Date(this.lastMeeting.date);

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


  get lastMeetingHour(): string {
    const hour = this.lastMeeting?.hour;

    if (
      hour === undefined ||
      hour === null
    ) {
      return '—';
    }

    const numericHour = Number(hour);

    if (Number.isNaN(numericHour)) {
      return '—';
    }

    const period =
      numericHour >= 12
        ? 'PM'
        : 'AM';

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

  get assignedInstructor(): string {
    const meeting = this.lastMeeting as any;

    if (!meeting?.instructor) {
      return '—';
    }

    const instructor = meeting.instructor;

    const firstName =
      instructor?.user?.firstName ||
      instructor?.firstName ||
      '';

    const lastName =
      instructor?.user?.lastName ||
      instructor?.lastName ||
      '';

    const fullName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || '—';
  }


  /* =========================
    STAGE
  ========================= */

  get currentStage(): string {
    const meeting = this.lastMeeting as any;

    if (!meeting) {
      return '—';
    }

    return (
      meeting.stage?.description ||
      meeting.stage?.number ||
      (meeting.stageId
        ? `Stage ${meeting.stageId}`
        : '—')
    );
  }


  /* =========================
     ATTENDANCE
  ========================= */

  get attendedMeetings(): number {
    return this.meetings.filter(
      meeting => meeting.present === true,
    ).length;
  }

  get absentMeetings(): number {
    return this.meetings.filter(
      meeting => meeting.present === false,
    ).length;
  }

  get attendancePercentage(): number {
    if (this.meetings.length === 0) {
      return 0;
    }

    return Math.round(
      (
        this.attendedMeetings /
        this.meetings.length
      ) * 100,
    );
  }
}