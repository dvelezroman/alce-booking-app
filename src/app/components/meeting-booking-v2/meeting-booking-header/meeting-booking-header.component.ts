import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-meeting-booking-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-booking-header.component.html',
  styleUrl: './meeting-booking-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingBookingHeaderComponent {
  constructor(
    private readonly router: Router
  ) {}

  navigateToScheduledMeetings(): void {
    this.router.navigate([
      '/dashboard/scheduled-meetings',
    ])
  }
}