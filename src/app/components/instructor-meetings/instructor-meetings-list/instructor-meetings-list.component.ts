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
  InstructorMeetingRowComponent,
} from '../instructor-meeting-row/instructor-meeting-row.component';


@Component({
  selector: 'app-instructor-meetings-list',

  standalone: true,

  imports: [
    CommonModule,
    InstructorMeetingRowComponent,
  ],

  templateUrl:
    './instructor-meetings-list.component.html',

  styleUrl:
    './instructor-meetings-list.component.scss',
})
export class InstructorMeetingsListComponent {

  /* =====================================================
     INPUTS
  ===================================================== */

  @Input()
  meetings: MeetingDTO[] = [];


  @Input()
  totalMeetings: number = 0;


  @Input()
  isLoading: boolean = false;


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
  refreshRequested =
    new EventEmitter<void>();


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
     REFRESH
  ===================================================== */

  onRefresh(): void {

    if (this.isLoading) {
      return;
    }

    this.refreshRequested.emit();
  }


  /* =====================================================
     CONTENT
  ===================================================== */

  onContentViewRequested(
    event: {
      content: string;
      title: string;
    },
  ): void {

    this.contentViewRequested.emit(
      event,
    );
  }


  /* =====================================================
     TEMPORARY COMMENT
  ===================================================== */

  onTemporaryCommentRequested(
    event: {
      meeting: MeetingDTO;
      title: string;
    },
  ): void {

    this.temporaryCommentRequested.emit(
      event,
    );
  }


  /* =====================================================
     OBSERVATION / COMMENT
  ===================================================== */

  onCommentViewRequested(
    event: {
      meeting: MeetingDTO;
      title: string;
    },
  ): void {

    this.commentViewRequested.emit(
      event,
    );
  }


  /* =====================================================
     CONTENT HISTORY
  ===================================================== */

  onStudentContentHistoryRequested(
    meeting: MeetingDTO,
  ): void {

    this.studentContentHistoryRequested.emit(
      meeting,
    );
  }


  /* =====================================================
     ASSISTANCE
  ===================================================== */

  onAssistanceCheckboxClicked(
    event: {
      event: Event;
      meeting: MeetingDTO;
    },
  ): void {

    this.assistanceCheckboxClicked.emit(
      event,
    );
  }


  /* =====================================================
     EVALUATION
  ===================================================== */

  onEvaluationRequested(
    studentId: number,
  ): void {

    this.evaluationRequested.emit(
      studentId,
    );
  }


  /* =====================================================
     NOTE
  ===================================================== */

  onNoteSaved(
    event: {
      meetingId: number;
      note: string;
    },
  ): void {

    this.noteSaved.emit(
      event,
    );
  }


  /* =====================================================
     TRACK BY
  ===================================================== */

  trackByMeetingId(
    index: number,
    meeting: MeetingDTO,
  ): number {

    return (
      meeting.id ??
      index
    );
  }


  /* =====================================================
     STATE
  ===================================================== */

  get hasMeetings(): boolean {

    return (
      this.meetings.length >
      0
    );
  }


  /* =====================================================
     COUNT LABEL
  ===================================================== */

  get meetingsCountLabel(): string {

    if (
      this.totalMeetings === 1
    ) {
      return '1 clase';
    }

    return (
      `${this.totalMeetings} clases`
    );
  }
}

