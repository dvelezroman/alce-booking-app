import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MeetingDTO } from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-meeting-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-table.component.html',
  styleUrls: ['./meeting-table.component.scss']
})
export class MeetingTableComponent {
  @Input() meetings: MeetingDTO[] = [];
  @Input() isToday!: (date: Date | string) => boolean;
  @Input() formatStudyContent!: (meeting: MeetingDTO) => string;
  @Input() hasMeetingPassed!: (localdate: string | Date, hour: number) => boolean;
  
  @Output() contentViewRequested = new EventEmitter<{ content: string; title: string }>();
  @Output() commentViewRequested = new EventEmitter<{ note: string; title: string; meeting: MeetingDTO }>();
  @Output() studentContentHistoryRequested = new EventEmitter<MeetingDTO>();
  @Output() assistanceCheckboxClicked = new EventEmitter<{ event: Event; meeting: MeetingDTO }>();

  onHistoryClick(meeting: MeetingDTO) {
    this.studentContentHistoryRequested.emit(meeting);
  }

  onAssistanceClick(event: Event, meeting: MeetingDTO) {
    this.assistanceCheckboxClicked.emit({ event, meeting });
  }

  showContent(meeting: MeetingDTO) {
    const content = this.formatStudyContent(meeting);
    this.contentViewRequested.emit({
      content,
      title: 'Contenido de la Clase'
    });
  }

  showComment(meeting: MeetingDTO): void {
    const note = meeting.assessments && meeting.assessments.length > 0
      ? meeting.assessments[0].note || 'Sin observación registrada.'
      : 'Sin observación registrada.';

    this.commentViewRequested.emit({
      note,
      title: 'Observación del Instructor',
      meeting
    });
  }

  getStudentDisplayName(meeting: MeetingDTO): string {
    const firstName = meeting.student?.user?.firstName || 'Nombre no disponible';
    const lastName = meeting.student?.user?.lastName || '';
    return `${firstName} ${lastName}`;
  }

  isNewUser(meeting: MeetingDTO): boolean {
    return !!meeting.isNewUser;
  }

  hasObservation(meeting: MeetingDTO): boolean {
    return !!(
      (meeting.assessments && meeting.assessments.some(a => !!a.note)) ||
      meeting.student?.user?.comment
    );
  }

  getObservationTooltip(meeting: MeetingDTO): string {
    return meeting.student?.user?.comment || 'Sin observación';
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  didOpenLink(meeting: MeetingDTO): string {
    if (!this.hasMeetingPassed(meeting.localdate, meeting.localhour)) return '-';
    return meeting.linkOpened ? '✔️' : '❌';
  }

  hasReinforcement(meeting: MeetingDTO): boolean {
    return meeting.hasReinforcement === true;
  }
}
