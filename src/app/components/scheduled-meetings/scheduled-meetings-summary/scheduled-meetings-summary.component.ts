import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core'
import { MeetingDTO } from '../../../services/dtos/booking.dto'

interface SummaryItem {
  label: string
  value: number
  icon: string
  variant: 'upcoming' | 'completed' | 'cancelled' | 'total'
}

@Component({
  selector: 'app-scheduled-meetings-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './scheduled-meetings-summary.component.html',
  styleUrls: [
    './scheduled-meetings-summary.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduledMeetingsSummaryComponent {
  @Input()
  meetings: MeetingDTO[] = []

  get summaryItems(): SummaryItem[] {
    return [
      {
        label: 'Próximas clases',
        value: this.upcomingMeetings,
        icon: 'event',
        variant: 'upcoming',
      },
      {
        label: 'Clases completadas',
        value: this.completedMeetings,
        icon: 'check_circle',
        variant: 'completed',
      },
      {
        label: 'Clases canceladas',
        value: this.cancelledMeetings,
        icon: 'cancel',
        variant: 'cancelled',
      },
      {
        label: 'Total de clases',
        value: this.totalMeetings,
        icon: 'calendar_month',
        variant: 'total',
      },
    ]
  }

  get totalMeetings(): number {
    return this.meetings.length
  }

  get completedMeetings(): number {
    return this.meetings.filter((meeting) => {
      return meeting.present === true
    }).length
  }

  get absentMeetings(): number {
    return this.meetings.filter((meeting) => {
      return (
        meeting.present === false &&
        Boolean(meeting.markAssistanceAt)
      )
    }).length
  }

  get cancelledMeetings(): number {
    return this.meetings.filter((meeting) => {
      const status = this.normalizeStatus(
        meeting.status
      )

      return [
        'CANCELLED',
        'CANCELED',
      ].includes(status)
    }).length
  }

  get upcomingMeetings(): number {
    const now = Date.now() - 5 * 60 * 60 * 1000

    return this.meetings.filter((meeting) => {
      const meetingDate =
        this.getMeetingTimestamp(meeting)

      const status = this.normalizeStatus(
        meeting.status
      )

      return (
        meetingDate >= now &&
        meeting.present !== true &&
        !['CANCELLED', 'CANCELED'].includes(status)
      )
    }).length
  }

  private getMeetingTimestamp(
    meeting: MeetingDTO
  ): number {
    const rawDate =
      meeting.localdate ??
      meeting.date

    const timestamp = new Date(rawDate).getTime()

    return Number.isNaN(timestamp)
      ? 0
      : timestamp
  }

  private normalizeStatus(
    status: unknown
  ): string {
    return String(status ?? '')
      .trim()
      .toUpperCase()
  }

  private isCompletedStatus(
    status: string
  ): boolean {
    return [
      'COMPLETED',
      'FINISHED',
      'DONE',
    ].includes(status)
  }

  private isCancelledStatus(
    status: string
  ): boolean {
    return [
      'CANCELLED',
      'CANCELED',
    ].includes(status)
  }
}