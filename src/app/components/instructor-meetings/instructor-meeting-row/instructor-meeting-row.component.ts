import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MeetingDTO } from '../../../services/dtos/booking.dto';
import { Mode } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-instructor-meeting-row',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './instructor-meeting-row.component.html',
  styleUrl: './instructor-meeting-row.component.scss',
})
export class InstructorMeetingRowComponent {
  @Input({ required: true }) meeting!: MeetingDTO;

  @Input() isToday!: (date: Date | string) => boolean;

  @Input() hasMeetingPassed!: (localdate: string | Date, hour: number) => boolean;

  @Input() formatStudyContent!: (meeting: MeetingDTO) => string;

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

  onContentView(): void {
    this.contentViewRequested.emit({
      content: this.formatStudyContent(this.meeting),
      title: 'Contenido de la Clase',
    });
  }

  onTemporaryCommentView(): void {
    this.temporaryCommentRequested.emit({
      meeting: this.meeting,
      title: 'Comentario temporal',
    });
  }

  onCommentView(): void {
    this.commentViewRequested.emit({
      meeting: this.meeting,
      title: 'Evaluaciones y recursos',
    });
  }

  onStudentContentHistory(): void {
    this.studentContentHistoryRequested.emit(this.meeting);
  }

  onAssistanceClick(event: Event): void {
    this.assistanceCheckboxClicked.emit({
      event,
      meeting: this.meeting,
    });
  }

  onEvaluation(): void {
    if (!this.meeting.studentId) return;

    this.evaluationRequested.emit(this.meeting.studentId);
  }

  onNoteSaved(note: string): void {
    if (!this.meeting.id) return;

    this.noteSaved.emit({
      meetingId: this.meeting.id,
      note,
    });
  }

  get meetingHour(): number {
    return Number(this.meeting.hour ?? 0);
  }

  get isMeetingToday(): boolean {
    if (!this.meeting.date || !this.isToday) return false;

    return this.isToday(this.meeting.date);
  }

  get isMeetingPassed(): boolean {
    if (!this.meeting.date || !this.hasMeetingPassed) return false;

    return this.hasMeetingPassed(
      this.meeting.date,
      this.meetingHour,
    );
  }

  get hasStudyContent(): boolean {
    return !!this.meeting.studyContent?.length;
  }

  get visibleStudyContent(): any[] {
    return this.meeting.studyContent?.slice(0, 2) ?? [];
  }

  get remainingStudyContentCount(): number {
    const total = this.meeting.studyContent?.length ?? 0;

    return Math.max(total - 2, 0);
  }

  get hasReinforcement(): boolean {
    return !!this.meeting.hasReinforcement;
  }

  get hasInstructorNote(): boolean {
    return !!this.meeting.instructorNote?.trim();
  }

  get hasTemporaryComment(): boolean {
    return !!this.meeting.user?.temporaryComment?.trim();
  }

  get studentName(): string {
    const user = this.meeting.user;

    if (!user) return 'Estudiante';

    const firstName = user.firstName?.trim() ?? '';
    const lastName = user.lastName?.trim() ?? '';

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || 'Estudiante';
  }

  get studentInitials(): string {
    const user = this.meeting.user;

    if (!user) return 'ES';

    const firstName = user.firstName?.trim()?.charAt(0) ?? '';
    const lastName = user.lastName?.trim()?.charAt(0) ?? '';

    const initials = `${firstName}${lastName}`.toUpperCase();

    return initials || 'ES';
  }

  get studentCategory(): string {
    return this.meeting.category || '';
  }

  get stageNumber(): string {
    const stage = this.meeting.stage;

    if (!stage?.number) return '';

    return stage.number;
  }

  get stageDescription(): string {
    return this.meeting.stage?.description || '';
  }

  get modalityLabel(): string {
    const mode = this.meeting.mode;

    if (mode === Mode.ONLINE) return 'ONLINE';

    if (mode === Mode.PRESENCIAL) return 'PRESENCIAL';

    return 'Sin modalidad';
  }

  get isOnline(): boolean {
    return this.meeting.mode === Mode.ONLINE;
  }

  get isPresential(): boolean {
    return this.meeting.mode === Mode.PRESENCIAL;
  }

  get assistanceLabel(): string {
    if (this.meeting.present === true) return 'Presente';

    if (this.meeting.present === false && this.isMeetingPassed) {
      return 'Ausente';
    }

    return 'Sin marcar';
  }

  get assistanceState(): 'present' | 'absent' | 'pending' {
    if (this.meeting.present === true) {
      return 'present';
    }

    if (
      this.meeting.present === false &&
      this.isMeetingPassed
    ) {
      return 'absent';
    }

    return 'pending';
  }

  get canMarkAssistance(): boolean {
    return this.isMeetingToday;
  }

  get formattedHour(): string {
    const hour = this.meetingHour;

    if (Number.isNaN(hour)) {
      return '';
    }

    const period = hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${normalizedHour.toString().padStart(2, '0')}:00 ${period}`;
  }

  get formattedDate(): string {
    if (!this.meeting.date) {
      return '';
    }

    const date = new Date(this.meeting.date);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Guayaquil',
    }).format(date);
  }

  get formattedWeekday(): string {
    if (!this.meeting.date) {
      return '';
    }

    const date = new Date(this.meeting.date);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const weekday = new Intl.DateTimeFormat('es-EC', {
      weekday: 'short',
      timeZone: 'America/Guayaquil',
    }).format(date);

    return this.capitalize(weekday.replace('.', ''));
  }

  get studentProgress(): number {
    return this.meeting.student?.progressPercentage ?? 0;
  }

  get formattedStudentProgress(): string {
    return `${Math.round(this.studentProgress)}%`;
  }

  get studentProgressClass(): string {
    const progress = this.studentProgress;

    if (progress <= 25) return 'meeting-row__progress--low';
    if (progress <= 50) return 'meeting-row__progress--medium';
    if (progress <= 75) return 'meeting-row__progress--good';

    return 'meeting-row__progress--high';
  }

  private capitalize(value: string): string {
    if (!value) return '';

    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}