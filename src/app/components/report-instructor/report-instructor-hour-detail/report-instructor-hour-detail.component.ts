import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  InstructorGroupedData,
} from '../../../services/dtos/instructor-attendance-grouped.dto';

import {
  InstructorAttendanceDto,
} from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-report-instructor-hour-detail',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-instructor-hour-detail.component.html',
  styleUrl: './report-instructor-hour-detail.component.scss',
})
export class ReportInstructorHourDetailComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() instructor:
    InstructorGroupedData | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() contentRequested =
    new EventEmitter<InstructorAttendanceDto>();


  /* =========================
     HOURS
  ========================= */

  get sortedHours(): any[] {
    if (
      !this.instructor?.user?.hours
    ) {
      return [];
    }

    return [
      ...this.instructor.user.hours,
    ].sort(
      (a, b) =>
        Number(a.localhour ?? 0) -
        Number(b.localhour ?? 0),
    );
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  get instructorName(): string {
    if (!this.instructor) {
      return 'Instructor';
    }

    return [
      this.instructor.user.firstName,
      this.instructor.user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      'Instructor';
  }


  /* =========================
     HOUR
  ========================= */

  formatHour(
    hour: number | string,
  ): string {
    const value =
      Number(hour);

    if (
      !Number.isFinite(value)
    ) {
      return '—';
    }

    const period =
      value >= 12
        ? 'PM'
        : 'AM';

    const normalized =
      value === 0
        ? 12
        : value > 12
          ? value - 12
          : value;

    return `${normalized}:00 ${period}`;
  }


  /* =========================
     STAGES
  ========================= */

  getStages(
    hour: any,
  ): any[] {
    return (
      hour?.stages ??
      []
    );
  }


  getStageLabel(
    stage: any,
  ): string {
    return (
      stage?.description ||
      (
        stage?.stageId != null
          ? `Stage ${stage.stageId}`
          : 'Sin Stage'
      )
    );
  }


  /* =========================
     MEETINGS
  ========================= */

  getMeetings(
    hour: any,
  ): InstructorAttendanceDto[] {
    if (
      Array.isArray(
        hour?.meetings,
      )
    ) {
      return hour.meetings;
    }

    return [];
  }


  hasMeetings(
    hour: any,
  ): boolean {
    return (
      this.getMeetings(
        hour,
      ).length > 0
    );
  }


  /* =========================
     CONTENT
  ========================= */

  onContent(
    meeting: InstructorAttendanceDto,
  ): void {
    this.contentRequested.emit(
      meeting,
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByHour(
    index: number,
    hour: any,
  ): number | string {
    return (
      hour?.localhour ??
      hour?.hour ??
      index
    );
  }

  trackByStage(
    index: number,
    stage: any,
  ): number | string {
    return (
      stage?.stageId ??
      index
    );
  }

  trackByMeeting(
    index: number,
    meeting: InstructorAttendanceDto,
  ): number | string {
    return (
      meeting?.instructorId ??
      `${meeting?.localdate}-${meeting?.localhour}-${index}`
    );
  }
}