import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MeetingDTO } from '../../../services/dtos/booking.dto';

import { InstructorMeetingRowComponent } from '../instructor-meeting-row/instructor-meeting-row.component';

@Component({
  selector: 'app-instructor-meetings-list',
  standalone: true,
  imports: [
    CommonModule,
    InstructorMeetingRowComponent,
  ],
  templateUrl: './instructor-meetings-list.component.html',
  styleUrl: './instructor-meetings-list.component.scss',
})
export class InstructorMeetingsListComponent {
  @Input() meetings: MeetingDTO[] = [];

  @Input() totalMeetings: number = 0;

  @Input() isLoading: boolean = false;

  @Input() isToday!: (date: Date | string) => boolean;

  @Input() hasMeetingPassed!: (localdate: string | Date, hour: number) => boolean;

  @Input() formatStudyContent!: (meeting: MeetingDTO) => string;

  @Output() refreshRequested = new EventEmitter<void>();

  @Output() contentViewRequested = new EventEmitter<{
    content: string;
    title: string;
  }>();

  @Output() temporaryCommentRequested = new EventEmitter<{
    meeting: MeetingDTO;
    title: string;
  }>();

  @Output() commentViewRequested = new EventEmitter<{
    meeting: MeetingDTO;
    title: string;
  }>();

  @Output() studentContentHistoryRequested = new EventEmitter<MeetingDTO>();

  @Output() assistanceCheckboxClicked = new EventEmitter<{
    event: Event;
    meeting: MeetingDTO;
  }>();

  @Output() evaluationRequested = new EventEmitter<number>();

  @Output() noteSaved = new EventEmitter<{
    meetingId: number;
    note: string;
  }>();

  onRefresh(): void {
    if (this.isLoading) return;

    this.refreshRequested.emit();
  }

  onContentViewRequested(event: { content: string; title: string }): void {
    this.contentViewRequested.emit(event);
  }

  onTemporaryCommentRequested(event: { meeting: MeetingDTO; title: string }): void {
    this.temporaryCommentRequested.emit(event);
  }

  onCommentViewRequested(event: { meeting: MeetingDTO; title: string }): void {
    this.commentViewRequested.emit(event);
  }

  onStudentContentHistoryRequested(meeting: MeetingDTO): void {
    this.studentContentHistoryRequested.emit(meeting);
  }

  onAssistanceCheckboxClicked(event: { event: Event; meeting: MeetingDTO }): void {
    this.assistanceCheckboxClicked.emit(event);
  }

  onEvaluationRequested(studentId: number): void {
    this.evaluationRequested.emit(studentId);
  }

  onNoteSaved(event: { meetingId: number; note: string }): void {
    this.noteSaved.emit(event);
  }

  trackByMeetingId(index: number, meeting: MeetingDTO): number {
    return meeting.id ?? index;
  }

  get hasMeetings(): boolean {
    return this.meetings.length > 0;
  }

  get meetingsCountLabel(): string {
    if (this.totalMeetings === 1) {
      return '1 clase';
    }

    return `${this.totalMeetings} clases`;
  }
}