import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingDTO } from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-meeting-evaluations-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-evaluations-table.component.html',
  styleUrl: './meeting-evaluations-table.component.scss'
})
export class MeetingEvaluationsTableComponent {

  @Input() meetings: MeetingDTO[] = [];
  @Input() loading = false;
  @Input() searchAttempted = false;

  @Input() showInstructor = true;
  @Input() showStudent = true;

  @Output() meetingSelected = new EventEmitter<number>();

  selectMeeting(meeting: MeetingDTO): void {
    if (!meeting.id) {
      return;
    }

    this.meetingSelected.emit(meeting.id);
  }
}