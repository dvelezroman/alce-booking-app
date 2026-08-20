import {
  CommonModule,
} from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  MeetingDTO,
} from '../../../services/dtos/booking.dto';

import {
  Mode,
} from '../../../services/dtos/student.dto';


@Component({
  selector: 'app-instructor-meeting-row',

  standalone: true,

  imports: [
    CommonModule,
  ],

  templateUrl:
    './instructor-meeting-row.component.html',

  styleUrl:
    './instructor-meeting-row.component.scss',
})
export class InstructorMeetingRowComponent {

  /* =====================================================
     INPUTS
  ===================================================== */

  @Input({
    required: true,
  })
  meeting!: MeetingDTO;


  @Input()
  isToday!:
    (
      date: Date | string,
    ) => boolean;


  @Input()
  hasMeetingPassed!:
    (
      localdate: string | Date,
      hour: number,
    ) => boolean;


  @Input()
  formatStudyContent!:
    (
      meeting: MeetingDTO,
    ) => string;


  /* =====================================================
     OUTPUTS
  ===================================================== */

  @Output()
  contentViewRequested =
    new EventEmitter<{
      content: string;
      title: string;
    }>();


  @Output()
  temporaryCommentRequested =
    new EventEmitter<{
      meeting: MeetingDTO;
      title: string;
    }>();


  @Output()
  commentViewRequested =
    new EventEmitter<{
      meeting: MeetingDTO;
      title: string;
    }>();


  @Output()
  studentContentHistoryRequested =
    new EventEmitter<MeetingDTO>();


  @Output()
  assistanceCheckboxClicked =
    new EventEmitter<{
      event: Event;
      meeting: MeetingDTO;
    }>();


  @Output()
  evaluationRequested =
    new EventEmitter<number>();


  @Output()
  noteSaved =
    new EventEmitter<{
      meetingId: number;
      note: string;
    }>();


  /* =====================================================
     ACTIONS
  ===================================================== */

  onContentView(): void {

    this.contentViewRequested.emit({
      content:
        this.formatStudyContent(
          this.meeting,
        ),

      title:
        'Contenido de la Clase',
    });
  }


  onTemporaryCommentView(): void {

    this.temporaryCommentRequested.emit({
      meeting:
        this.meeting,

      title:
        'Comentario temporal',
    });
  }


  onCommentView(): void {

    this.commentViewRequested.emit({
      meeting:
        this.meeting,

      title:
        'Evaluaciones y recursos',
    });
  }


  onStudentContentHistory(): void {

    this.studentContentHistoryRequested.emit(
      this.meeting,
    );
  }


  onAssistanceClick(
    event: Event,
  ): void {

    this.assistanceCheckboxClicked.emit({
      event,

      meeting:
        this.meeting,
    });
  }


  onEvaluation(): void {

    if (!this.meeting.studentId) {
      return;
    }

    this.evaluationRequested.emit(
      this.meeting.studentId,
    );
  }


  onNoteSaved(
    note: string,
  ): void {

    if (!this.meeting.id) {
      return;
    }

    this.noteSaved.emit({
      meetingId:
        this.meeting.id,

      note,
    });
  }


  /* =====================================================
     DATE / HOUR
  ===================================================== */

  get meetingHour(): number {

    return Number(
      this.meeting.hour ??
      this.meeting.localhour ??
      0,
    );
  }


  get meetingDate():
    string | Date | null {

    return (
      this.meeting.date ??
      this.meeting.localdate ??
      null
    );
  }


  get isMeetingToday(): boolean {

    if (
      !this.meetingDate ||
      !this.isToday
    ) {
      return false;
    }

    return this.isToday(
      this.meetingDate,
    );
  }


  get isMeetingPassed(): boolean {

    if (
      !this.meetingDate ||
      !this.hasMeetingPassed
    ) {
      return false;
    }

    return this.hasMeetingPassed(
      this.meetingDate,
      this.meetingHour,
    );
  }


  /* =====================================================
     STUDY CONTENT
  ===================================================== */

  get hasStudyContent(): boolean {

    return !!this.meeting
      .studyContent
      ?.length;
  }


  get visibleStudyContent(): any[] {

    return (
      this.meeting
        .studyContent
        ?.slice(
          0,
          2,
        ) ??
      []
    );
  }


  get firstStudyContentTitle(): string {
    const first =
      this.meeting
        .studyContent
        ?.[0];

    return (
      first?.title ??
      first?.description ??
      'Contenido'
    );
  }


  get remainingStudyContentCount(): number {

    const total =
      this.meeting
        .studyContent
        ?.length ??
      0;

    return Math.max(
      total - 1,
      0,
    );
  }


  /* =====================================================
     CATEGORY
  ===================================================== */

  get categoryLabel(): string {

    return (
      this.meeting.category ||
      'Sin categoría'
    );
  }


  /* =====================================================
     COMMENT
  ===================================================== */

  get temporaryComment(): string {

    return (
      this.studentUser
        ?.temporaryComment
        ?.trim() ??
      ''
    );
  }


  get hasTemporaryComment(): boolean {

    return !!this.temporaryComment;
  }


  /* =====================================================
     OBSERVATION
  ===================================================== */

  get observationText(): string {

    const meeting =
      this.meeting as MeetingDTO & {
        assessments?: Array<{
          note?: string | null;
        }>;
      };

    const assessmentNote =
      meeting
        .assessments
        ?.[0]
        ?.note
        ?.trim();

    const userComment =
      this.studentUser
        ?.comment
        ?.trim();

    return (
      assessmentNote ||
      userComment ||
      'Sin observación'
    );
  }


  /* =====================================================
     REINFORCEMENT
  ===================================================== */

  get hasReinforcement(): boolean {

    const meeting =
      this.meeting as MeetingDTO & {
        hasReinforcement?: boolean;
        assessments?: Array<{
          note?: string | null;
          resources?: unknown[];
        }>;
      };

    if (
      meeting.hasReinforcement
    ) {
      return true;
    }

    const assessment =
      meeting
        .assessments
        ?.[0];

    const hasNote =
      !!assessment
        ?.note
        ?.trim();

    const hasResources =
      !!assessment
        ?.resources
        ?.length;

    return (
      hasNote ||
      hasResources
    );
  }


  /* =====================================================
     OPENED LINK
  ===================================================== */

  get didOpenMeetingLink(): boolean {

    const meeting =
      this.meeting as MeetingDTO & {
        openedLink?: boolean;
        openLink?: boolean;
        linkOpened?: boolean;
        studentOpenedLink?: boolean;
        openedMeetingLink?: boolean;
      };

    return Boolean(
      meeting.openedLink ??
      meeting.openLink ??
      meeting.linkOpened ??
      meeting.studentOpenedLink ??
      meeting.openedMeetingLink ??
      false
    );
  }


  /* =====================================================
     BEHAVIOR NOTE
  ===================================================== */

  get behaviorNote(): string {

    const meeting =
      this.meeting as MeetingDTO & {
        studentBehaviorComment?:
          string | null;
      };

    return (
      meeting
        .studentBehaviorComment
        ?.trim() ??
      ''
    );
  }


  /* =====================================================
     INSTRUCTOR NOTE
  ===================================================== */

  get hasInstructorNote(): boolean {

    return !!this.meeting
      .instructorNote
      ?.trim();
  }


  /* =====================================================
     STUDENT
  ===================================================== */

  get studentName(): string {

    const user =
      this.studentUser;

    const firstName =
      user
        ?.firstName
        ?.trim() ??
      '';

    const lastName =
      user
        ?.lastName
        ?.trim() ??
      '';

    const fullName =
      `${firstName} ${lastName}`
        .trim();

    if (fullName) {
      return fullName;
    }

    const fallbackName =
      this.meeting
        .student
        ?.name
        ?.trim();

    return (
      fallbackName ||
      'Estudiante'
    );
  }


  get studentInitials(): string {

    const user =
      this.studentUser;

    const firstName =
      user
        ?.firstName
        ?.trim()
        ?.charAt(0) ??
      '';

    const lastName =
      user
        ?.lastName
        ?.trim()
        ?.charAt(0) ??
      '';

    const initials =
      `${firstName}${lastName}`
        .toUpperCase();

    if (initials) {
      return initials;
    }

    const fallbackName =
      this.studentName;

    if (
      !fallbackName ||
      fallbackName ===
        'Estudiante'
    ) {
      return 'ES';
    }

    return (
      fallbackName
        .split(/\s+/)
        .slice(
          0,
          2,
        )
        .map(
          part =>
            part.charAt(0),
        )
        .join('')
        .toUpperCase() ||
      'ES'
    );
  }


  get studentCategory(): string {

    return (
      this.meeting.category ||
      ''
    );
  }


  /* =====================================================
     STAGE
  ===================================================== */

  get stageNumber(): string {

    const stage =
      this.meeting.stage;

    if (!stage?.number) {
      return '';
    }

    return String(
      stage.number,
    );
  }


  get stageDescription(): string {

    return (
      this.meeting
        .stage
        ?.description ||
      ''
    );
  }


  /* =====================================================
     MODALITY
  ===================================================== */

  get modalityLabel(): string {

    const mode =
      this.meeting.mode;

    if (
      mode === Mode.ONLINE
    ) {
      return 'ONLINE';
    }

    if (
      mode === Mode.PRESENCIAL
    ) {
      return 'PRESENCIAL';
    }

    return 'Sin modalidad';
  }


  get isOnline(): boolean {

    return (
      this.meeting.mode ===
      Mode.ONLINE
    );
  }


  get isPresential(): boolean {

    return (
      this.meeting.mode ===
      Mode.PRESENCIAL
    );
  }


  /* =====================================================
     ASSISTANCE
  ===================================================== */

  get assistanceLabel(): string {

    if (
      this.meeting.present ===
      true
    ) {
      return 'Presente';
    }

    if (
      this.meeting.present ===
        false &&
      this.isMeetingPassed
    ) {
      return 'Ausente';
    }

    return 'Sin marcar';
  }


  get assistanceState():
    'present' |
    'absent' |
    'pending' {

    if (
      this.meeting.present ===
      true
    ) {
      return 'present';
    }

    if (
      this.meeting.present ===
        false &&
      this.isMeetingPassed
    ) {
      return 'absent';
    }

    return 'pending';
  }


  get canMarkAssistance(): boolean {

    return this.isMeetingToday;
  }


  /* =====================================================
     FORMAT HOUR
  ===================================================== */

  get formattedHour(): string {

    const hour =
      this.meetingHour;

    if (
      Number.isNaN(hour)
    ) {
      return '';
    }

    const period =
      hour >= 12
        ? 'PM'
        : 'AM';

    const normalizedHour =
      hour % 12 === 0
        ? 12
        : hour % 12;

    return (
      `${normalizedHour
        .toString()
        .padStart(
          2,
          '0',
        )}:00 ${period}`
    );
  }


  /* =====================================================
     FORMAT DATE
  ===================================================== */

  get formattedDate(): string {

    if (!this.meetingDate) {
      return '';
    }

    /*
     * Evitamos que YYYY-MM-DD se interprete
     * como UTC y retroceda un día.
     */
    if (
      typeof this.meetingDate ===
        'string' &&
      /^\d{4}-\d{2}-\d{2}$/
        .test(
          this.meetingDate,
        )
    ) {
      const [
        year,
        month,
        day,
      ] =
        this.meetingDate
          .split('-')
          .map(Number);

      return new Intl.DateTimeFormat(
        'es-EC',
        {
          day:
            '2-digit',

          month:
            '2-digit',

          year:
            'numeric',
        },
      ).format(
        new Date(
          year,
          month - 1,
          day,
        ),
      );
    }

    const date =
      new Date(
        this.meetingDate,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day:
          '2-digit',

        month:
          '2-digit',

        year:
          'numeric',

        timeZone:
          'America/Guayaquil',
      },
    ).format(
      date,
    );
  }


  get formattedWeekday(): string {

    if (!this.meetingDate) {
      return '';
    }

    let date: Date;


    if (
      typeof this.meetingDate ===
        'string' &&
      /^\d{4}-\d{2}-\d{2}$/
        .test(
          this.meetingDate,
        )
    ) {

      const [
        year,
        month,
        day,
      ] =
        this.meetingDate
          .split('-')
          .map(Number);

      date =
        new Date(
          year,
          month - 1,
          day,
        );

    } else {

      date =
        new Date(
          this.meetingDate,
        );
    }


    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }


    const weekday =
      new Intl.DateTimeFormat(
        'es-EC',
        {
          weekday:
            'short',
        },
      )
        .format(date)
        .replace(
          '.',
          '',
        );

    return this.capitalize(
      weekday,
    );
  }


  /* =====================================================
     PROGRESS
  ===================================================== */

  get studentProgress(): number {

    return (
      this.meeting
        .student
        ?.progressPercentage ??
      0
    );
  }


  get formattedStudentProgress(): string {

    return (
      `${Math.round(
        this.studentProgress,
      )}%`
    );
  }


  get studentProgressClass(): string {

    const progress =
      this.studentProgress;

    if (
      progress <= 25
    ) {
      return 'meeting-row__progress--low';
    }

    if (
      progress <= 50
    ) {
      return 'meeting-row__progress--medium';
    }

    if (
      progress <= 75
    ) {
      return 'meeting-row__progress--good';
    }

    return 'meeting-row__progress--high';
  }


  /* =====================================================
     PRIVATE HELPERS
  ===================================================== */

  private get studentUser() {

    return (
      this.meeting
        .student
        ?.user ??
      this.meeting.user
    );
  }


  private capitalize(
    value: string,
  ): string {

    if (!value) {
      return '';
    }

    return (
      value
        .charAt(0)
        .toUpperCase() +
      value.slice(1)
    );
  }
}