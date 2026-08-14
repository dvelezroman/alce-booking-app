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
  selector: 'app-attendance-instructor-info',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-instructor-info.component.html',
  styleUrl: './attendance-instructor-info.component.scss',
})
export class AttendanceInstructorInfoComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() instructorId: number | undefined;

  @Input() instructorName: string = '';

  @Input() meetings: InstructorAttendanceDto[] = [];


  /* =========================
     BASE DATA
  ========================= */

  get hasInstructorSelected(): boolean {
    return !!this.instructorId;
  }

  get displayInstructorName(): string {
    return (
      this.instructorName ||
      'Instructor no seleccionado'
    );
  }


  /* =========================
     FLATTEN MEETINGS
  ========================= */

  get allMeetings(): MeetingDTO[] {
    return this.meetings.flatMap(
      item => item.meetings || [],
    );
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  get instructorEmail(): string {
    const meetingWithInstructor =
      this.allMeetings.find(
        meeting =>
          !!meeting.instructor?.user,
      );

    const user =
      meetingWithInstructor
        ?.instructor
        ?.user;

    return (
      user?.emailAddress ||
      user?.email ||
      '—'
    );
  }


  get instructorInitials(): string {
    const name =
      this.displayInstructorName
        .trim();

    if (!name) {
      return 'IN';
    }

    const parts =
      name.split(/\s+/);

    const first =
      parts[0]?.charAt(0) || '';

    const last =
      parts.length > 1
        ? parts[parts.length - 1]
            ?.charAt(0) || ''
        : '';

    return `${first}${last}`
      .toUpperCase() || 'IN';
  }


  /* =========================
     UNIQUE STUDENTS
  ========================= */

  get uniqueStudentsCount(): number {
    const studentIds =
      this.allMeetings
        .map(
          meeting =>
            meeting.studentId,
        )
        .filter(
          id =>
            id !== undefined &&
            id !== null,
        );

    return new Set(
      studentIds,
    ).size;
  }


  /* =========================
     MOST FREQUENT STAGE
  ========================= */

  get mostFrequentStage(): string {
    if (
      this.allMeetings.length === 0
    ) {
      return '—';
    }

    const stageCounter =
      new Map<
        string,
        number
      >();

    this.allMeetings.forEach(
      meeting => {
        const stage =
          meeting.stage?.description ||
          meeting.stage?.number ||
          (
            meeting.stageId
              ? `Stage ${meeting.stageId}`
              : ''
          );

        if (!stage) {
          return;
        }

        stageCounter.set(
          stage,
          (
            stageCounter.get(stage) || 0
          ) + 1,
        );
      },
    );

    if (
      stageCounter.size === 0
    ) {
      return '—';
    }

    return [
      ...stageCounter.entries(),
    ]
      .sort(
        (a, b) =>
          b[1] - a[1],
      )[0][0];
  }


  /* =========================
     LAST CLASS
  ========================= */

  get lastClass(): InstructorAttendanceDto | null {
    if (
      this.meetings.length === 0
    ) {
      return null;
    }

    return [
      ...this.meetings,
    ]
      .sort(
        (a, b) => {
          const dateA =
            this.getMeetingTimestamp(a);

          const dateB =
            this.getMeetingTimestamp(b);

          return dateB - dateA;
        },
      )[0];
  }


  get lastClassDate(): string {
    if (!this.lastClass?.date) {
      return '—';
    }

    const date =
      new Date(
        this.lastClass.date,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
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


  get lastClassHour(): string {
    const item =
      this.lastClass;

    if (!item) {
      return '—';
    }

    const hour =
      item.localhour ??
      item.hour;

    if (
      hour === undefined ||
      hour === null
    ) {
      return '—';
    }

    const numericHour =
      Number(hour);

    if (
      Number.isNaN(
        numericHour,
      )
    ) {
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
     ASSESSMENTS
  ========================= */

  get assessmentsCount(): number {
    return this.allMeetings.reduce(
      (
        total,
        meeting,
      ) =>
        total +
        (
          meeting.assessments
            ?.length || 0
        ),
      0,
    );
  }


  /* =========================
     HELPERS
  ========================= */

  private getMeetingTimestamp(
    item: InstructorAttendanceDto,
  ): number {
    const date =
      new Date(item.date);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return 0;
    }

    const hour =
      Number(
        item.localhour ??
        item.hour ??
        0,
      );

    date.setHours(
      Number.isNaN(hour)
        ? 0
        : hour,
      0,
      0,
      0,
    );

    return date.getTime();
  }
}