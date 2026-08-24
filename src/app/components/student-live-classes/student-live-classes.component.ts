import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { BookingService } from '../../services/booking.service';
import {
  MeetingDTO,
  MeetingStatusEnum,
} from '../../services/dtos/booking.dto';
import { UserDto } from '../../services/dtos/user.dto';
import { selectUserData } from '../../store/user.selector';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-live-classes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-live-classes.component.html',
  styleUrls: ['./student-live-classes.component.scss'],
})
export class StudentLiveClassesComponent implements OnInit, OnDestroy {

  userData: UserDto | null = null;
  studentId: number | null = null;

  meetings: MeetingDTO[] = [];
  loading = false;

  isRefreshTooltipVisible = false;

  filterMode: 'today' | 'all' = 'all';

  @Output() meetingsCount = new EventEmitter<number>();
  @Output() scheduleClass = new EventEmitter<void>();
  @Output() viewMeetingDetails = new EventEmitter<MeetingDTO>();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly bookingService: BookingService,
    private readonly store: Store,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (!user?.student?.id) {
          this.studentId = null;
          this.userData = user ?? null;
          this.meetings = [];
          this.meetingsCount.emit(0);
          return;
        }

        this.studentId = user.student.id;
        this.userData = user;

        this.loadLiveClasses('all');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================================
  // Reuniones visibles en el dashboard
  // ================================
  get visibleMeetings(): MeetingDTO[] {
    return this.meetings
  }

  get hasOneMeeting(): boolean {
    return this.meetings.length === 1;
  }

  get hasMultipleMeetings(): boolean {
    return this.meetings.length > 1;
  }

  isPresentialPortoviejo(meeting: MeetingDTO): boolean {
    const modality = this.getMeetingModality(meeting);

    const city = (
      (meeting as any).city ??
      (meeting as any).student?.user?.city ??
      this.userData?.city ??
      ''
    )
      .toString()
      .trim()
      .toLowerCase();

    return (
      modality === 'Presencial' &&
      city === 'portoviejo'
    );
  }

  // ================================
  // Cargar TODAS las clases agendadas
  // ================================
  loadLiveClasses(filter: 'today' | 'all' = 'today'): void {
    if (!this.studentId) {
      this.meetings = [];
      this.meetingsCount.emit(0);
      return;
    }

    this.loading = true;
    this.filterMode = filter;

    const today = new Date();
    const toDate = new Date();

    toDate.setDate(today.getDate() + 15);

    const from = this.formatDateForRequest(today);
    const to = this.formatDateForRequest(toDate);

    this.bookingService
      .searchMeetings({
        from,
        to,
        hour: undefined,
        assigned: undefined,
        status: MeetingStatusEnum.ACTIVE,
        studentId: this.studentId,
      })
      .subscribe({
        next: (meetings: MeetingDTO[]) => {
          this.meetings = this.applyFilter(meetings)
            .slice()
            .sort((firstMeeting, secondMeeting) =>
              this.compareMeetings(
                firstMeeting,
                secondMeeting
              )
            );

          this.meetingsCount.emit(this.meetings.length);
          this.loading = false;
        },

        error: (error) => {
          console.error('Error cargando clases:', error);

          this.meetings = [];
          this.meetingsCount.emit(0);
          this.loading = false;
        },
      });
  }

  private compareMeetings(
    firstMeeting: MeetingDTO,
    secondMeeting: MeetingDTO
  ): number {
    const firstTimestamp =
      this.getMeetingTimestamp(firstMeeting);

    const secondTimestamp =
      this.getMeetingTimestamp(secondMeeting);

    const firstIsFinished =
      this.isPastMeeting(firstMeeting);

    const secondIsFinished =
      this.isPastMeeting(secondMeeting);

    if (
      firstIsFinished &&
      !secondIsFinished
    ) {
      return 1;
    }

    if (
      !firstIsFinished &&
      secondIsFinished
    ) {
      return -1;
    }

    if (
      !firstIsFinished &&
      !secondIsFinished
    ) {
      return (
        firstTimestamp -
        secondTimestamp
      );
    }

    return (
      secondTimestamp -
      firstTimestamp
    );
  }

  changeFilter(mode: 'today' | 'all'): void {
    this.filterMode = mode;
    this.loadLiveClasses(this.filterMode);
  }

  applyFilter(meetings: MeetingDTO[]): MeetingDTO[] {
    if (this.filterMode === 'all') {
      return meetings;
    }

    const today = this.formatDateForRequest(new Date());

    return meetings.filter((meeting) => {
      const meetingDate = this.formatDateForRequest(
        new Date(meeting.date)
      );

      return meetingDate === today;
    });
  }

  // ================================
  // Acciones visuales nuevas
  // ================================

  toggleRefreshTooltip(): void {
    this.isRefreshTooltipVisible =
      !this.isRefreshTooltipVisible;
  }

  showRefreshTooltip(): void {
    this.isRefreshTooltipVisible = true;
  }

  hideRefreshTooltip(): void {
    this.isRefreshTooltipVisible = false;
  }

  handleRefreshClasses(): void {
    if (this.loading) {
      return;
    }
    this.loadLiveClasses(this.filterMode);
  }

  showAllClasses(): void {
    this.router.navigate([
      '/dashboard/scheduled-meetings',
    ]);
  }

  handleScheduleClass(): void {
    this.scheduleClass.emit();
  }

  handleViewDetails(
    meeting: MeetingDTO
  ): void {
    if (
      this.isPastMeeting(meeting) ===
      'finished'
    ) {
      return;
    }

    this.viewMeetingDetails.emit(meeting);
  }

  // ================================
  // Información visual de la clase
  // ================================

 isPastMeeting(
    meeting: MeetingDTO
  ): 'started' | 'finished' | null {
    const meetingStart =
      this.getMeetingTimestamp(meeting);

    const meetingEnd =
      meetingStart + 60 * 60 * 1000;

    const now = Date.now();

    if (
      now >= meetingStart &&
      now < meetingEnd
    ) {
      return 'started';
    }

    if (now >= meetingEnd) {
      return 'finished';
    }

    return null;
  }
  
  getMeetingTitle(_meeting: MeetingDTO): string {
    return 'Clase de inglés';
  }

  getInstructorName(meeting: MeetingDTO): string {
    const firstName =
      meeting.instructor?.user?.firstName?.trim() ?? '';

    const lastName =
      meeting.instructor?.user?.lastName?.trim() ?? '';

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || 'Instructor por asignar';
  }

  getMeetingModality( meeting: MeetingDTO ): 'Online' | 'Presencial' {
    const mode = meeting.mode
      ?.toString()
      .trim()
      .toUpperCase();

    return mode === 'ONLINE'
      ? 'Online'
      : 'Presencial';
  }

  getMonthAbbreviation(date: unknown): string {
    const parsedDate = new Date(date as string);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate
      .toLocaleDateString('es-ES', {
        month: 'short',
      })
      .replace('.', '')
      .toUpperCase();
  }

  getDayNumber(date: unknown): string {
    const parsedDate = new Date(date as string);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate
      .toLocaleDateString('es-ES', {
        day: '2-digit',
      });
  }

  getFullMeetingDate(date: unknown): string {
    const parsedDate = new Date(date as string);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Fecha por confirmar';
    }

    const formattedDate = parsedDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return this.capitalize(formattedDate);
  }

  getMeetingTime(meeting: MeetingDTO): string {
    const startHour = Number(meeting.hour ?? meeting.localhour);

    if (Number.isNaN(startHour)) {
      return 'Horario por confirmar';
    }

    const endHour = startHour + 1;

    return `${this.formatHour(startHour)} - ${this.formatHour(endHour)}`;
  }

  // ================================
  // Validar link disponible
  // ================================
  hasValidLink(meeting: MeetingDTO): boolean {
    const link = meeting.link?.trim();

    if (!link) {
      return false;
    }

    try {
      new URL(
        link.startsWith('http')
          ? link
          : `https://${link}`
      );

      return true;
    } catch (_) {
      return false;
    }
  }

  isValidUrl(link: string): boolean {
    try {
      new URL(link);
      return true;
    } catch (_) {
      return false;
    }
  }

  getFormattedLink(link: string | undefined): string {
    if (!link) {
      return '';
    }

    const formattedLink = link.startsWith('http')
      ? link
      : `https://${link}`;

    if (!this.isValidUrl(formattedLink)) {
      return '';
    }

    return formattedLink;
  }

  // ================================
  // Registrar asistencia
  // ================================
  handleMeetingAssistanceClick(meetingId?: number): void {
    if (!meetingId) {
      return;
    }

    this.bookingService
      .clickAssistanceByStudent(meetingId)
      .subscribe({
        next: () => {
          console.log('Asistencia registrada');
        },

        error: () => {
          console.log(
            'Error al registrar la asistencia'
          );
        },
      });
  }

  // ================================
  // Entrar a clase
  // ================================
  enterClass(meeting: MeetingDTO): void {
    if (!this.canEnter(meeting)) {
      return;
    }

    if (!this.hasValidLink(meeting)) {
      return;
    }

    if (meeting.id) {
      this.handleMeetingAssistanceClick(meeting.id);
    }

    const finalUrl = this.getFormattedLink(meeting.link);

    if (finalUrl) {
      window.open(
        finalUrl,
        '_blank',
        'noopener,noreferrer'
      );
    }
  }

  // ================================
  // Fecha: HOY / MAÑANA / 5 diciembre
  // ================================
  isToday(date: unknown): boolean {
    const today = new Date();
    const parsedDate = new Date(date as string);

    return (
      parsedDate.toDateString() ===
      today.toDateString()
    );
  }

  isTomorrow(date: unknown): boolean {
    const today = new Date();

    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const parsedDate = new Date(date as string);

    return (
      parsedDate.toDateString() ===
      tomorrow.toDateString()
    );
  }

  formatDateTitle(date: unknown): string {
    if (this.isToday(date)) {
      return 'Hoy';
    }

    if (this.isTomorrow(date)) {
      return 'Mañana';
    }

    return new Date(date as string)
      .toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
      });
  }

  canEnter(meeting: MeetingDTO): boolean {
    if (!meeting?.link?.trim()) {
      return false;
    }

    const LINK_ACTIVE_BEFORE =
      5 * 60 * 1000;

    const LINK_ACTIVE_AFTER =
      6 * 60 * 1000;

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
      return false;
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
      return false;
    }

    const meetingStart =
      Date.UTC(
        year,
        month - 1,
        day,
        hour + 5,
        0,
        0,
        0
      );

    const now = Date.now();

    const availableFrom =
      meetingStart -
      LINK_ACTIVE_BEFORE;

    const availableUntil =
      meetingStart +
      LINK_ACTIVE_AFTER;

    return (
      now >= availableFrom &&
      now <= availableUntil
    );
  }

  // ================================
  // Helpers privados
  // ================================
  private getMeetingTimestamp(
  meeting: MeetingDTO
): number {
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
    return 0;
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
    Number.isNaN(hour)
  ) {
    return 0;
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

  private formatDateForRequest(date: Date): string {
    const year = date.getFullYear();

    const month = `${date.getMonth() + 1}`.padStart(
      2,
      '0'
    );

    const day = `${date.getDate()}`.padStart(
      2,
      '0'
    );

    return `${year}-${month}-${day}`;
  }

  private formatHour(hour: number): string {
    const normalizedHour =
      ((hour % 24) + 24) % 24;

    const period =
      normalizedHour >= 12 ? 'PM' : 'AM';

    const twelveHour = normalizedHour % 12 || 12;

    return `${twelveHour
      .toString()
      .padStart(2, '0')}:00 ${period}`;
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }
}