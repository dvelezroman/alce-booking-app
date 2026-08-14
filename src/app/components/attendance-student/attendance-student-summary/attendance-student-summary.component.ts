import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { MeetingDTO } from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-attendance-student-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-student-summary.component.html',
  styleUrl: './attendance-student-summary.component.scss',
})
export class AttendanceStudentSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() studentId: number | undefined;

  @Input() studentName: string = '';

  @Input() meetings: MeetingDTO[] = [];


  /* =========================
     SUMMARY
  ========================= */

  get totalMeetings(): number {
    return this.meetings.length;
  }

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

  get attendedPercentage(): number {
    if (this.totalMeetings === 0) {
      return 0;
    }

    return Math.round(
      (this.attendedMeetings / this.totalMeetings) * 100,
    );
  }

  get absentPercentage(): number {
    if (this.totalMeetings === 0) {
      return 0;
    }

    return Math.round(
      (this.absentMeetings / this.totalMeetings) * 100,
    );
  }


  /* =========================
     STUDENT
  ========================= */

  get displayStudentName(): string {
    return this.studentName || 'Estudiante no seleccionado';
  }

  get studentInitials(): string {
    if (!this.studentName) {
      return 'ES';
    }

    const names = this.studentName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (names.length === 1) {
      return names[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return `${names[0][0]}${names[names.length - 1][0]}`
      .toUpperCase();
  }

  get displayStudentId(): string {
    return this.studentId
      ? String(this.studentId)
      : '—';
  }


  /* =========================
     HOURS
  ========================= */

  get totalRegisteredHours(): string {
    if (this.meetings.length === 0) {
      return '0h 00m';
    }

    const totalMinutes = this.meetings.reduce(
      (accumulator, meeting) => {
        const minutes = this.getMeetingDurationMinutes(meeting);

        return accumulator + minutes;
      },
      0,
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }

  private getMeetingDurationMinutes(
    meeting: MeetingDTO,
  ): number {
    const meetingAny = meeting as any;

    if (
      typeof meetingAny.duration === 'number' &&
      meetingAny.duration > 0
    ) {
      return meetingAny.duration;
    }

    return 60;
  }
}