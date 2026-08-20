import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  InstructorAttendanceDto,
  MeetingDTO,
} from '../../../services/dtos/booking.dto';


interface AttendanceDayGroup {
  key: string;
  date: string;
  items: InstructorAttendanceDto[];
}


@Component({
  selector: 'app-attendance-instructor-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-instructor-table.component.html',
  styleUrl: './attendance-instructor-table.component.scss',
})
export class AttendanceInstructorTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() meetings: InstructorAttendanceDto[] = [];

  @Input() searchAttempted = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() contentRequested =
    new EventEmitter<InstructorAttendanceDto>();


  /* =========================
     GROUP STATE
  ========================= */

  collapsedGroups = new Set<string>();


  /* =========================
     GROUPED MEETINGS
  ========================= */

  get groupedMeetings(): AttendanceDayGroup[] {
    const groups = new Map<string, AttendanceDayGroup>();

    this.meetings.forEach((item) => {
      const key = this.getDateKey(item.localdate || item.date);

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          date: item.localdate || item.date,
          items: [],
        });
      }

      groups.get(key)!.items.push(item);
    });

    return Array
      .from(groups.values())
      .map(group => ({
        ...group,
        items: [...group.items].sort(
          (a, b) =>
            Number(b.localhour ?? b.hour) -
            Number(a.localhour ?? a.hour),
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      );
  }


  /* =========================
     GROUP STATE
  ========================= */

  toggleGroup(
    groupKey: string,
  ): void {
    if (
      this.collapsedGroups.has(
        groupKey,
      )
    ) {
      this.collapsedGroups.delete(
        groupKey,
      );

      return;
    }

    this.collapsedGroups.add(
      groupKey,
    );
  }


  isGroupExpanded(
    groupKey: string,
  ): boolean {
    return !this.collapsedGroups.has(
      groupKey,
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByAttendance(
    index: number,
    item: InstructorAttendanceDto,
  ): string {
    return `${item.date}-${item.hour}-${item.instructorId}`;
  }


  /* =========================
     ACTIONS
  ========================= */

  onViewContent(
    meeting: InstructorAttendanceDto,
  ): void {
    this.contentRequested.emit(
      meeting,
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


  /* =========================
     GROUP DATE
  ========================= */

  getGroupDate(
    group: AttendanceDayGroup,
  ): string {
    const date =
      new Date(group.date);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—';
    }

    const formatted =
      new Intl.DateTimeFormat(
        'es-EC',
        {
          weekday: 'long',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      ).format(date);

    return this.capitalize(
      formatted,
    );
  }


  getGroupClassesLabel(
    group: AttendanceDayGroup,
  ): string {
    const total =
      group.items.length;

    return total === 1
      ? '1 clase'
      : `${total} clases`;
  }


  /* =========================
     DATE
  ========================= */

  getMeetingDate(
    item: InstructorAttendanceDto,
  ): string {
    if (!item.date) {
      return '—';
    }

    const date =
      new Date(item.date);

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


  /* =========================
     HOUR
  ========================= */

  getMeetingHour(
    item: InstructorAttendanceDto,
  ): string {
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
     STAGE
  ========================= */

  getStage(
    item: InstructorAttendanceDto,
  ): string {
    const firstMeeting =
      item.meetings?.[0];

    if (!firstMeeting) {
      return '—';
    }

    return (
      firstMeeting.stage?.number ||
      firstMeeting.stage?.description ||
      (
        firstMeeting.stageId
          ? `Stage ${firstMeeting.stageId}`
          : '—'
      )
    );
  }


  getStageDescription(
    item: InstructorAttendanceDto,
  ): string {
    const firstMeeting =
      item.meetings?.[0];

    if (!firstMeeting) {
      return '';
    }

    return (
      firstMeeting.stage?.description ||
      ''
    );
  }


  getStageId(
    item: InstructorAttendanceDto,
  ): number | null {
    const firstMeeting =
      item.meetings?.[0];

    return (
      firstMeeting?.stageId ??
      null
    );
  }


  /* =========================
     STUDENTS
  ========================= */

  getStudentsCount(
    item: InstructorAttendanceDto,
  ): number {
    return (
      item.meetings?.length ??
      0
    );
  }


  getUniqueStudentsCount(
    item: InstructorAttendanceDto,
  ): number {
    if (
      !item.meetings ||
      item.meetings.length === 0
    ) {
      return 0;
    }

    const studentIds =
      item.meetings
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
     ATTENDANCE
  ========================= */

  getPresentCount(
    item: InstructorAttendanceDto,
  ): number {
    return (
      item.meetings
        ?.filter(
          meeting =>
            meeting.present === true,
        )
        .length ??
      0
    );
  }


  getAbsentCount(
    item: InstructorAttendanceDto,
  ): number {
    return (
      item.meetings
        ?.filter(
          meeting =>
            meeting.present === false,
        )
        .length ??
      0
    );
  }


  getTotalAttendanceCount(
    item: InstructorAttendanceDto,
  ): number {
    return (
      item.meetings?.length ??
      0
    );
  }


  getAttendanceLabel(
    item: InstructorAttendanceDto,
  ): string {
    const present =
      this.getPresentCount(item);

    const total =
      this.getTotalAttendanceCount(
        item,
      );

    if (total === 0) {
      return '—';
    }

    return `${present} / ${total}`;
  }


  getAttendanceStatus(
    item: InstructorAttendanceDto,
  ): string {
    const present =
      this.getPresentCount(item);

    const total =
      this.getTotalAttendanceCount(
        item,
      );

    if (total === 0) {
      return 'Sin registros';
    }

    if (present === total) {
      return 'Presentes';
    }

    if (present === 0) {
      return 'Ausentes';
    }

    return 'Asistencia parcial';
  }


  getAttendanceClass(
    item: InstructorAttendanceDto,
  ): string {
    const present =
      this.getPresentCount(item);

    const total =
      this.getTotalAttendanceCount(
        item,
      );

    if (total === 0) {
      return 'attendance-instructor-table__attendance--pending';
    }

    if (present === total) {
      return 'attendance-instructor-table__attendance--present';
    }

    if (present === 0) {
      return 'attendance-instructor-table__attendance--absent';
    }

    return 'attendance-instructor-table__attendance--partial';
  }


  /* =========================
     CONTENT
  ========================= */

  hasStudyContent(
    item: InstructorAttendanceDto,
  ): boolean {
    const firstMeeting =
      item.meetings?.[0];

    return !!(
      firstMeeting?.studyContent &&
      firstMeeting.studyContent.length > 0
    );
  }


  getStudyContentCount(
    item: InstructorAttendanceDto,
  ): number {
    const firstMeeting =
      item.meetings?.[0];

    return (
      firstMeeting
        ?.studyContent
        ?.length ??
      0
    );
  }


  /* =========================
     MODE
  ========================= */

  getMode(
    item: InstructorAttendanceDto,
  ): string {
    const firstMeeting =
      item.meetings?.[0];

    return (
      firstMeeting?.mode ||
      '—'
    );
  }


  /* =========================
     STUDENT
  ========================= */

  getStudentName(
    meeting: MeetingDTO,
  ): string {
    const studentAny =
      meeting.student as any;

    const user =
      studentAny?.user ||
      meeting.user;

    const firstName =
      user?.firstName || '';

    const lastName =
      user?.lastName || '';

    const fullName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return (
      fullName ||
      'Estudiante'
    );
  }


  getStudentInitials(
    meeting: MeetingDTO,
  ): string {
    const name =
      this.getStudentName(
        meeting,
      );

    if (
      !name ||
      name === 'Estudiante'
    ) {
      return 'E';
    }

    const parts =
      name
        .trim()
        .split(/\s+/);

    const first =
      parts[0]
        ?.charAt(0) ||
      '';

    const last =
      parts.length > 1
        ? parts[
            parts.length - 1
          ]?.charAt(0) || ''
        : '';

    return `${first}${last}`
      .toUpperCase();
  }


  /* =========================
     HELPERS
  ========================= */

  private getDateKey(
    value: string | Date,
  ): string {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return String(value);
    }

    return [
      date.getFullYear(),

      String(
        date.getMonth() + 1,
      ).padStart(2, '0'),

      String(
        date.getDate(),
      ).padStart(2, '0'),
    ].join('-');
  }


  private capitalize(
    value: string,
  ): string {
    if (!value) {
      return value;
    }

    return (
      value
        .charAt(0)
        .toUpperCase() +
      value.slice(1)
    );
  }
}