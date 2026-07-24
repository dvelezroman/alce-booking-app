import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'

import { ScheduledMeetingCardComponent } from '../scheduled-meeting-card/scheduled-meeting-card.component'
import { MeetingDTO } from '../../../services/dtos/booking.dto'

@Component({
  selector: 'app-scheduled-meetings-list',
  standalone: true,
  imports: [
    CommonModule,
    ScheduledMeetingCardComponent,
  ],
  templateUrl: './scheduled-meetings-list.component.html',
  styleUrls: ['./scheduled-meetings-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduledMeetingsListComponent {
  @Input()
  meetings: MeetingDTO[] = []

  @Input()
  view: 'list' | 'grid' = 'list'

  @Input()
  isLoading = false

  @Output()
  viewDetails = new EventEmitter<MeetingDTO>()

  @Output()
  openOptions = new EventEmitter<MeetingDTO>()

  @Output()
  deleteMeeting = new EventEmitter<MeetingDTO>()

  trackByMeetingId(
    index: number,
    meeting: MeetingDTO
  ): number | string {
    return meeting.id ?? index
  }

  onViewDetails(meeting: MeetingDTO): void {
    this.viewDetails.emit(meeting)
  }

  onOpenOptions(meeting: MeetingDTO): void {
    this.openOptions.emit(meeting)
  }

  onDeleteMeeting(meeting: MeetingDTO): void {
    this.deleteMeeting.emit(meeting)
  }
}