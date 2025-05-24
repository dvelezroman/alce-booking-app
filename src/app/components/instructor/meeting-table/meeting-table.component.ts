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
  @Input() hasMeetingPassed!: (localdate: string | Date, hour: number) => boolean;
  @Input() formatStudyContent!: (meeting: MeetingDTO) => string;
  
  @Output() studentContentHistoryRequested = new EventEmitter<MeetingDTO>();
  @Output() contentViewRequested = new EventEmitter<string>();
  @Output() assistanceCheckboxClicked = new EventEmitter<{ event: Event; meeting: MeetingDTO }>();

  onHistoryClick(meeting: MeetingDTO) {
    this.studentContentHistoryRequested.emit(meeting);
  }

  onAssistanceClick(event: Event, meeting: MeetingDTO) {
    this.assistanceCheckboxClicked.emit({ event, meeting });
  }

  showContent(meeting: MeetingDTO) {
    const content = this.formatStudyContent(meeting);
    this.contentViewRequested.emit(content);
  }

  getStudentDisplayName(meeting: MeetingDTO): string {
    const firstName = meeting.student?.user?.firstName || 'Nombre no disponible';
    const lastName = meeting.student?.user?.lastName || '';
    return `${firstName} ${lastName}`;
  }

  isNewUser(meeting: MeetingDTO): boolean {
    return !!meeting.isNewUser;
  }
}
