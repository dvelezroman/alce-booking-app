import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'
import { MeetingDTO } from '../../../services/dtos/booking.dto'


@Component({
  selector: 'app-scheduled-meeting-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduled-meeting-card.component.html',
  styleUrls: ['./scheduled-meeting-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduledMeetingCardComponent {
  @Input({ required: true })
  meeting!: MeetingDTO

  @Output()
  viewDetails = new EventEmitter<MeetingDTO>()

  @Output()
  openOptions = new EventEmitter<MeetingDTO>()

  @Output()
  deleteMeeting = new EventEmitter<MeetingDTO>()  

  isOptionsMenuOpen = false

  toggleOptionsMenu(event: Event): void {
    event.stopPropagation()

    this.isOptionsMenuOpen =
      !this.isOptionsMenuOpen
  }

  closeOptionsMenu(): void {
    this.isOptionsMenuOpen = false
  }

  get meetingDate(): Date | null {
    const rawDate =
      this.meeting?.localdate ??
      this.meeting?.date

    if (!rawDate) {
      return null
    }

    const date = new Date(rawDate)

    return Number.isNaN(date.getTime())
      ? null
      : date
  }

  get weekday(): string {
    if (!this.meetingDate) {
      return '—'
    }

    return new Intl.DateTimeFormat('es-EC', {
      weekday: 'long',
    })
      .format(this.meetingDate)
      .replace('.', '')
      .toUpperCase()
  }

  get day(): string {
    if (!this.meetingDate) {
      return '—'
    }

    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
    }).format(this.meetingDate)
  }

  get monthAndYear(): string {
    if (!this.meetingDate) {
      return '—'
    }

    return new Intl.DateTimeFormat('es-EC', {
      month: 'short',
      year: 'numeric',
    })
      .format(this.meetingDate)
      .replace('.', '')
      .toUpperCase()
  }

  get formattedHour(): string {
    return this.formatHour(
      this.meeting?.hour ??
      this.meeting?.localhour,
    )
  }

  get formattedEcuadorHour(): string {
    return this.formatHour(
      this.meeting?.localhour ??
      this.meeting?.hour,
    )
  }

  get hasDifferentMeetingHours(): boolean {
    const studentHour = Number(
      this.meeting?.hour,
    )

    const ecuadorHour = Number(
      this.meeting?.localhour,
    )

    if (
      Number.isNaN(studentHour) ||
      Number.isNaN(ecuadorHour)
    ) {
      return false
    }

    return studentHour !== ecuadorHour
  }

  private formatHour(
    rawHour: number | string | null | undefined,
  ): string {
    if (
      rawHour === null ||
      rawHour === undefined
    ) {
      return 'Horario no disponible'
    }

    const hour = Number(rawHour)

    if (
      Number.isNaN(hour) ||
      hour < 0 ||
      hour > 23
    ) {
      return String(rawHour)
    }

    const date = new Date()

    date.setHours(
      hour,
      0,
      0,
      0,
    )

    return new Intl.DateTimeFormat('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  get meetingTitle(): string {
    const theme = this.meeting?.meetingTheme as {
      name?: string
      title?: string
      description?: string
    } | null

    if (theme) {
      return (
        theme.name ??
        theme.title ??
        theme.description ??
        'Clase programada'
      )
    }

    const firstStudyContent =
      this.meeting?.studyContent?.[0] as {
        name?: string
        title?: string
        description?: string
      } | undefined

    if (firstStudyContent) {
      return (
        firstStudyContent.name ??
        firstStudyContent.title ??
        firstStudyContent.description ??
        'Clase programada'
      )
    }

    const stageDescription =
      this.meeting?.stage?.description

    return stageDescription
      ? `Clase de ${stageDescription}`
      : 'Clase programada'
  }

  get instructorName(): string {
    const firstName =
      this.meeting?.instructor?.user?.firstName ??
      ''

    const lastName =
      this.meeting?.instructor?.user?.lastName ??
      ''

    const fullName =
      `${firstName} ${lastName}`.trim()

    return fullName || 'Instructor por asignar'
  }

  get instructorInitials(): string {
    const names = this.instructorName
      .split(' ')
      .filter(Boolean)

    if (!names.length) {
      return 'IN'
    }

    if (names.length === 1) {
      return names[0]
        .slice(0, 2)
        .toUpperCase()
    }

    return (
      names[0][0] +
      names[names.length - 1][0]
    ).toUpperCase()
  }

  get normalizedMode(): string {
    return String(this.meeting?.mode ?? '')
      .trim()
      .toUpperCase()
  }

  get isOnline(): boolean {
    return [
      'ONLINE',
      'VIRTUAL',
      'REMOTE',
      'EN_LINEA',
      'EN LÍNEA',
    ].includes(this.normalizedMode)
  }

  get modeLabel(): string {
    if (this.isOnline) {
      return 'Online'
    }

    if (
      [
        'PRESENTIAL',
        'PRESENCIAL',
        'IN_PERSON',
      ].includes(this.normalizedMode)
    ) {
      return 'Presencial'
    }

    return String(this.meeting?.mode ?? 'Sin modalidad')
  }

  get normalizedStatus(): string {
    return String(this.meeting?.status ?? '')
      .trim()
      .toUpperCase()
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Confirmada',
      ASSIGNED: 'Confirmada',
      CONFIRMED: 'Confirmada',
      SCHEDULED: 'Programada',
      COMPLETED: 'Completada',
      FINISHED: 'Completada',
      CANCELLED: 'Cancelada',
      CANCELED: 'Cancelada',
      INACTIVE: 'Cancelada',
      PENDING: 'Pendiente',
      PENDING_APPROVAL: 'Pendiente',
      NO_SHOW: 'No asistió',
    }

    return (
      labels[this.normalizedStatus] ??
      this.formatEnumValue(this.normalizedStatus)
    )
  }

  get statusClass(): string {
    if (
      [
        'ACTIVE',
        'ASSIGNED',
        'CONFIRMED',
      ].includes(this.normalizedStatus)
    ) {
      return 'status-confirmed'
    }

    if (
      [
        'COMPLETED',
        'FINISHED',
      ].includes(this.normalizedStatus)
    ) {
      return 'status-completed'
    }

    if (
      [
        'CANCELLED',
        'CANCELED',
        'INACTIVE',
      ].includes(this.normalizedStatus)
    ) {
      return 'status-cancelled'
    }

    if (
      [
        'PENDING',
        'PENDING_APPROVAL',
      ].includes(this.normalizedStatus)
    ) {
      return 'status-pending'
    }

    return 'status-default'
  }

  get cardClass(): string {
    if (
      [
        'CANCELLED',
        'CANCELED',
        'INACTIVE',
      ].includes(this.normalizedStatus)
    ) {
      return 'meeting-card-cancelled'
    }

    if (
      [
        'COMPLETED',
        'FINISHED',
      ].includes(this.normalizedStatus)
    ) {
      return 'meeting-card-completed'
    }

    return ''
  }

  private getMeetingTimestamp(): number | null {
    const rawDate =
      this.meeting?.localdate ??
      this.meeting?.date

    const rawHour =
      this.meeting?.localhour ??
      this.meeting?.hour

    if (
      !rawDate ||
      rawHour === null ||
      rawHour === undefined
    ) {
      return null
    }

    const datePart = String(rawDate)
      .slice(0, 10)

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
      return null
    }

    /*
    * Ecuador continental utiliza UTC-5.
    * Sumamos 5 horas para obtener el instante UTC.
    */
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

  get meetingTimeStatus():
    | 'started'
    | 'finished'
    | null {
    const start =
      this.getMeetingTimestamp()

    if (start === null) {
      return null
    }

    const end =
      start + 60 * 60 * 1000

    const now = Date.now()

    if (
      now >= start &&
      now < end
    ) {
      return 'started'
    }

    if (now >= end) {
      return 'finished'
    }

    return null
  }

  get meetingTimeStatusLabel(): string {
    if (
      this.meetingTimeStatus === 'started'
    ) {
      return 'Iniciada'
    }

    if (
      this.meetingTimeStatus === 'finished'
    ) {
      return 'Terminada'
    }

    return ''
  }

  get isUpcomingMeeting(): boolean {
    const rawDate =
      this.meeting?.date ??
      this.meeting?.localdate

    if (!rawDate) {
      return false
    }

    const meetingDate = new Date(rawDate)

    if (Number.isNaN(meetingDate.getTime())) {
      return false
    }

    const today = new Date()

    meetingDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    return meetingDate.getTime() >= today.getTime()
  }

  get canDeleteMeeting(): boolean {
    const hasInstructor =
      Boolean(this.meeting?.instructor)

    return (
      !hasInstructor &&
      this.isUpcomingMeeting &&
      !this.meeting?.linkOpened &&
      !this.meeting?.markAssistanceById
    )
  }

  onDeleteMeeting(event: Event): void {
    event.stopPropagation()

    if (!this.canDeleteMeeting) {
      return
    }

    this.isOptionsMenuOpen = false
    this.deleteMeeting.emit(this.meeting)
  }

  onViewDetails(): void {
    if (this.isPastMeeting) {
      return
    }

    this.viewDetails.emit(this.meeting)
  }

  onOpenOptions(): void {
    this.openOptions.emit(this.meeting)
  }

  private formatEnumValue(
    value: string
  ): string {
    if (!value) {
      return 'Sin estado'
    }

    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(
        /^\w/,
        (letter) => letter.toUpperCase()
      )
  }

  get isPastMeeting(): boolean {
  return (
    this.meetingTimeStatus ===
    'finished'
  )
}

  get isTodayMeeting(): boolean {
    const rawDate =
      this.meeting?.localdate ??
      this.meeting?.date

    if (!rawDate) {
      return false
    }

    const meetingDateKey =
      String(rawDate).slice(0, 10)

    const todayDateKey =
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())

    return meetingDateKey === todayDateKey
  }
}