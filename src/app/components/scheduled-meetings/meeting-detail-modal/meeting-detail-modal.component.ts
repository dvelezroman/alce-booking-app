import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core'
import { MeetingDTO } from '../../../services/dtos/booking.dto'
import { BookingService } from '../../../services/booking.service'

type MeetingLinkStatus =
  | 'clickable'
  | 'not-clickable'
  | 'not-available'

@Component({
  selector: 'app-meeting-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-detail-modal.component.html',
  styleUrls: ['./meeting-detail-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingDetailModalComponent
  implements OnChanges, OnDestroy
{
  /**
   * Reunión que se mostrará en el modal.
   */
  @Input()
  selectedMeeting: MeetingDTO | null = null

  @Input()
  studentCity: string | null | undefined = null

  /**
   * Determina si el modal está abierto.
   */
  @Input()
  isActive = false

  /**
   * Avisa al padre que debe cerrar el modal.
   */
  @Output()
  modalClose = new EventEmitter<void>()

  /**
   * Se utiliza desde el HTML para comparar el modo.
   */
  readonly onlineMode = 'ONLINE'

  linkStatus: MeetingLinkStatus = 'not-available'

  private linkInterval: ReturnType<
    typeof setInterval
  > | null = null

  constructor(
    private readonly bookingService: BookingService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const meetingChanged =
      changes['selectedMeeting']

    const activeStateChanged =
      changes['isActive']

    if (
      meetingChanged ||
      activeStateChanged
    ) {
      this.handleModalState()
    }
  }

  ngOnDestroy(): void {
    this.clearLinkInterval()
    this.enableBodyScroll()
  }

  closeModal(): void {
    this.clearLinkInterval()
    this.enableBodyScroll()

    this.modalClose.emit()
  }

  getFormattedLink(
    link: string | null | undefined
  ): string {
    const normalizedLink = link?.trim()

    if (!normalizedLink) {
      return ''
    }

    const formattedLink =
      this.hasHttpProtocol(normalizedLink)
        ? normalizedLink
        : `https://${normalizedLink}`

    return this.isValidUrl(formattedLink)
      ? formattedLink
      : ''
  }

  getMeetingLinkMessage(): string {
    const hasInstructor =
      Boolean(this.selectedMeeting?.instructor)

    const hasLink = Boolean(
      this.selectedMeeting?.link?.trim()
    )

    if (!hasInstructor) {
      return 'Enlace aún no asignado'
    }

    if (!hasLink) {
      return 'El instructor no tiene un enlace asignado'
    }

    return 'El enlace estará disponible 5 minutos antes de la clase'
  }

  handleMeetingAssistanceClick(
    meetingId?: number
  ): void {
    if (!meetingId) {
      return
    }

    if (this.linkStatus !== 'clickable') {
      return
    }

    this.bookingService
      .clickAssistanceByStudent(meetingId)
      .subscribe({
        next: () => {
          // La asistencia se registró correctamente.
        },
        error: (error: unknown) => {
          console.error(
            'No se pudo registrar la asistencia:',
            error
          )
        },
      })
  }

  private handleModalState(): void {
    this.clearLinkInterval()

    if (
      !this.isActive ||
      !this.selectedMeeting
    ) {
      this.linkStatus = 'not-available'
      this.enableBodyScroll()
      return
    }

    this.disableBodyScroll()
    this.updateLinkStatus()
  }

  private updateLinkStatus(): void {
    if (!this.selectedMeeting) {
      return
    }

    this.calculateLinkStatus()

    const oneMinute = 60 * 1000

    this.linkInterval = setInterval(() => {
      this.calculateLinkStatus()
      this.changeDetectorRef.markForCheck()
    }, oneMinute)
  }

 private calculateLinkStatus(): void {
  const meeting = this.selectedMeeting

  if (!meeting) {
    this.linkStatus = 'not-available'
    return
  }

  const link = this.getFormattedLink(
    meeting.link
  )

  if (!link) {
    this.linkStatus = 'not-available'
    return
  }

  const meetingStart =
    this.getMeetingStartTimestamp(meeting)

  if (meetingStart === null) {
    this.linkStatus = 'not-available'
    return
  }

  const fiveMinutesBefore =
    5 * 60 * 1000

  const sixMinutesAfter =
    6 * 60 * 1000

  const now = Date.now()

  const availableFrom =
    meetingStart - fiveMinutesBefore

  const availableUntil =
    meetingStart + sixMinutesAfter

  if (now < availableFrom) {
    this.linkStatus = 'not-clickable'
    return
  }

  if (
    now >= availableFrom &&
    now <= availableUntil
  ) {
    this.linkStatus = 'clickable'
    return
  }

  this.linkStatus = 'not-available'
}

 private getMeetingStartTimestamp(
  meeting: MeetingDTO
): number | null {
  const rawDate =
    meeting.localdate ??
    meeting.date;

  const rawHour =
    meeting.localhour ??
    meeting.hour;

  if (
    !rawDate ||
    rawHour === null ||
    rawHour === undefined
  ) {
    return null;
  }

  const datePart =
    String(rawDate).slice(0, 10);

  const [
    year,
    month,
    day,
  ] = datePart
    .split('-')
    .map(Number);

  const hour = Number(rawHour);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    hour < 0 ||
    hour > 23
  ) {
    return null;
  }

  return Date.UTC(
    year,
    month - 1,
    day,
    hour + 5,
    0,
    0,
    0
  );
}

  private hasHttpProtocol(
    link: string
  ): boolean {
    return /^https?:\/\//i.test(link)
  }

  private isValidUrl(
    link: string
  ): boolean {
    try {
      const url = new URL(link)

      return (
        url.protocol === 'http:' ||
        url.protocol === 'https:'
      )
    } catch {
      return false
    }
  }

  private clearLinkInterval(): void {
    if (!this.linkInterval) {
      return
    }

    clearInterval(this.linkInterval)
    this.linkInterval = null
  }

  private disableBodyScroll(): void {
    document.body.classList.add('no-scroll')
  }

  private enableBodyScroll(): void {
    document.body.classList.remove('no-scroll')
  }

  shouldShowInstructor(
    meeting: MeetingDTO
  ): boolean {
    const mode = String(
      meeting.mode ?? ''
    )
      .trim()
      .toUpperCase()

    const city = String(
      this.studentCity ?? ''
    )
      .trim()
      .toUpperCase()

    const isPortoviejo =
      city === 'PORTOVIEJO'

    const isPresential =
      mode === 'PRESENCIAL'

    return !(
      isPortoviejo &&
      isPresential
    )
  }
}