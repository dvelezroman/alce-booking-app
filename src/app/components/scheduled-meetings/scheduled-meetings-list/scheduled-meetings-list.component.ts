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

  trackByMeetingId( index: number, meeting: MeetingDTO ): number | string {
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

  get sortedMeetings(): MeetingDTO[] {
    const now = Date.now()
    const meetingDuration =
      60 * 60 * 1000

    return [...this.meetings].sort(
      (
        firstMeeting,
        secondMeeting
      ) => {
        const firstTimestamp =
          this.getMeetingTimestamp(
            firstMeeting
          )

        const secondTimestamp =
          this.getMeetingTimestamp(
            secondMeeting
          )

        const firstIsFinished =
          firstTimestamp +
            meetingDuration <=
          now

        const secondIsFinished =
          secondTimestamp +
            meetingDuration <=
          now

        if (
          firstIsFinished &&
          !secondIsFinished
        ) {
          return 1
        }

        if (
          !firstIsFinished &&
          secondIsFinished
        ) {
          return -1
        }

        if (
          !firstIsFinished &&
          !secondIsFinished
        ) {
          return (
            firstTimestamp -
            secondTimestamp
          )
        }

        return (
          secondTimestamp -
          firstTimestamp
        )
      }
    )
  }

  private getMeetingTimestamp(
    meeting: MeetingDTO
  ): number {
    const rawDate =
      meeting.localdate ??
      meeting.date

    const rawHour =
      meeting.localhour ??
      meeting.hour

    if (
      !rawDate ||
      rawHour === null ||
      rawHour === undefined
    ) {
      return Number.MAX_SAFE_INTEGER
    }

    const datePart =
      String(rawDate).slice(0, 10)

    const [
      year,
      month,
      day,
    ] = datePart
      .split('-')
      .map(Number)

    const hour = Number(rawHour)

    if (
      !year ||
      !month ||
      !day ||
      Number.isNaN(hour) ||
      hour < 0 ||
      hour > 23
    ) {
      return Number.MAX_SAFE_INTEGER
    }

    return Date.UTC(
      year,
      month - 1,
      day,
      hour + 5,
      0,
      0,
      0
    )
  }
}