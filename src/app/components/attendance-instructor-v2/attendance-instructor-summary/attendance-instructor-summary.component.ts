import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  InstructorAttendanceDto,
  MeetingDTO,
} from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-attendance-instructor-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-instructor-summary.component.html',
  styleUrl: './attendance-instructor-summary.component.scss',
})
export class AttendanceInstructorSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() meetings: InstructorAttendanceDto[] = [];


  /* =========================
     FLATTEN MEETINGS
  ========================= */

  get allMeetings(): MeetingDTO[] {
    return this.meetings.flatMap(
      item => item.meetings || [],
    );
  }


  /* =========================
     TOTAL CLASSES
  ========================= */

  get totalClasses(): number {
    return this.meetings.length;
  }


  /* =========================
     PRESENT CLASSES
  ========================= */

  get presentClasses(): number {
    return this.meetings.filter(
      item => this.isGroupPresent(item),
    ).length;
  }


  /* =========================
     ABSENT CLASSES
  ========================= */

  get absentClasses(): number {
    return this.meetings.filter(
      item => this.isGroupAbsent(item),
    ).length;
  }


  /* =========================
     PERCENTAGES
  ========================= */

  get presentPercentage(): number {
    if (this.totalClasses === 0) {
      return 0;
    }

    return Math.round(
      (this.presentClasses / this.totalClasses) * 100,
    );
  }

  get absentPercentage(): number {
    if (this.totalClasses === 0) {
      return 0;
    }

    return Math.round(
      (this.absentClasses / this.totalClasses) * 100,
    );
  }


  /* =========================
     HOURS
  ========================= */

  get totalHoursLabel(): string {
    if (this.totalClasses === 0) {
      return '0h 00m';
    }

    /*
     * Cada InstructorAttendanceDto representa
     * una clase agrupada por fecha/hora.
     *
     * Mientras no exista duración explícita,
     * contamos 1 hora por clase.
     */
    const totalMinutes =
      this.totalClasses * 60;

    const hours =
      Math.floor(totalMinutes / 60);

    const minutes =
      totalMinutes % 60;

    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }


  /* =========================
     ATTENDANCE HELPERS
  ========================= */

  private isGroupPresent(
    item: InstructorAttendanceDto,
  ): boolean {
    if (
      !item.meetings ||
      item.meetings.length === 0
    ) {
      return false;
    }

    return item.meetings.some(
      meeting => meeting.present === true,
    );
  }

  private isGroupAbsent(
    item: InstructorAttendanceDto,
  ): boolean {
    if (
      !item.meetings ||
      item.meetings.length === 0
    ) {
      return false;
    }

    return item.meetings.every(
      meeting => meeting.present === false,
    );
  }
}