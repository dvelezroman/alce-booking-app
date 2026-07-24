import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'

import { UserDto } from '../../../services/dtos/user.dto'

@Component({
  selector: 'app-scheduled-meetings-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduled-meetings-header.component.html',
  styleUrl: './scheduled-meetings-header.component.scss',
})
export class ScheduledMeetingsHeaderComponent {
  @Input()
  userData: UserDto | null = null

  constructor(
    private readonly router: Router
  ) {}

  get userFullName(): string {
    const firstName =
      this.userData?.firstName?.trim() ?? ''

    const lastName =
      this.userData?.lastName?.trim() ?? ''

    return (
      `${firstName} ${lastName}`.trim() ||
      'Estudiante'
    )
  }

  get userInitials(): string {
    const firstName =
      this.userData?.firstName?.trim() ?? ''

    const lastName =
      this.userData?.lastName?.trim() ?? ''

    const firstInitial =
      firstName.charAt(0)

    const lastInitial =
      lastName.charAt(0)

    return (
      `${firstInitial}${lastInitial}`.toUpperCase() ||
      'E'
    )
  }

  get userRoleLabel(): string {
    return 'Estudiante'
  }

  navigateToMeetingBooking(): void {
    this.router.navigate([
      '/dashboard/booking',
    ])
  }
}