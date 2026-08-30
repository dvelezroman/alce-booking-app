import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  MeetingDTO,
} from '../../../../services/dtos/booking.dto';

import {
  Stage,
} from '../../../../services/dtos/student.dto';

import {
  BookingService,
} from '../../../../services/booking.service';


@Component({
  selector: 'app-student-progress-card',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './student-progress-card.component.html',
  styleUrl: './student-progress-card.component.scss',
})
export class StudentProgressCardComponent {

  @Input() meetings: MeetingDTO[] = [];
  @Input() isLoading = false;
  @Input() stage: Stage | null = null;


  /* =========================
     CLASS ACCESS
  ========================= */

  private readonly CLASS_ACCESS_BEFORE_MS =
    5 * 60 * 1000;

  private readonly CLASS_ACCESS_AFTER_MS =
    6 * 60 * 1000;


  constructor(
    private readonly bookingService: BookingService,
  ) {}


  /* =========================
     STAGE
  ========================= */

  get stageNumber(): string | null {
    const number =
      this.stage?.number?.trim();

    return number || null;
  }


  get stageDescription(): string | null {
    const description =
      this.stage?.description?.trim();

    return description || null;
  }


  get hasAssignedStage(): boolean {
    return !!(
      this.stageNumber ||
      this.stageDescription
    );
  }


  get stageAriaLabel(): string {
    if (!this.hasAssignedStage) {
      return 'Stage actual no asignado';
    }

    const parts = [
      this.stageNumber
        ? `Stage ${this.stageNumber}`
        : null,

      this.stageDescription,
    ].filter(Boolean);

    return `Stage actual: ${parts.join(' — ')}`;
  }


  /* =========================
     CLASS STATUS
  ========================= */

  get activeMeeting(): MeetingDTO | null {
    return (
      this.meetings.find(
        (meeting) =>
          this.isMeetingInAccessWindow(
            meeting
          )
      ) ?? null
    );
  }


  get hasActiveMeeting(): boolean {
    return !!this.activeMeeting;
  }


  get activeMeetingStatus():
    | 'upcoming'
    | 'started'
    | null {

    const meeting =
      this.activeMeeting;

    if (!meeting) {
      return null;
    }

    const meetingStart =
      this.getMeetingTimestamp(
        meeting
      );

    if (!meetingStart) {
      return null;
    }

    return Date.now() < meetingStart
      ? 'upcoming'
      : 'started';
  }


  get isMeetingUpcoming(): boolean {
    return (
      this.activeMeetingStatus ===
      'upcoming'
    );
  }


  get isMeetingStarted(): boolean {
    return (
      this.activeMeetingStatus ===
      'started'
    );
  }


  /* =========================
     MAIN MESSAGE
  ========================= */

  get mainTitle(): string {
    if (this.isMeetingUpcoming) {
      return 'Tu clase está por comenzar';
    }

    if (this.isMeetingStarted) {
      return 'Tienes una clase ahora';
    }

    return '¡Vas por buen camino!';
  }


  get mainDescription(): string {
    if (this.isMeetingUpcoming) {
      return (
        'Tu acceso ya está disponible. ' +
        'Puedes ingresar desde 5 minutos antes del inicio.'
      );
    }

    if (this.isMeetingStarted) {
      return (
        'Tu clase ya comenzó. ' +
        'Puedes ingresar hasta 6 minutos después de la hora programada.'
      );
    }

    return this.progressMessage;
  }


  get classStatusLabel(): string | null {
    if (this.isMeetingUpcoming) {
      return 'CLASE POR COMENZAR';
    }

    if (this.isMeetingStarted) {
      return 'CLASE INICIADA';
    }

    return null;
  }


  /* =========================
     ACTIVE MEETING INFO
  ========================= */

  get activeMeetingTime(): string | null {
    const meeting =
      this.activeMeeting;

    if (!meeting) {
      return null;
    }

    const rawHour =
      meeting.localhour ??
      meeting.hour;

    const hour =
      Number(rawHour);

    if (Number.isNaN(hour)) {
      return null;
    }

    return this.formatHour(hour);
  }


  get activeMeetingDate(): string | null {
    const meeting =
      this.activeMeeting;

    if (!meeting) {
      return null;
    }

    const rawDate =
      meeting.localdate ??
      meeting.date;

    if (!rawDate) {
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

    if (
      !year ||
      !month ||
      !day
    ) {
      return null;
    }

    const date =
      new Date(
        year,
        month - 1,
        day
      );

    return date.toLocaleDateString(
      'es-EC',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }
    );
  }


  get accessAvailableFrom(): string | null {
    const meeting =
      this.activeMeeting;

    if (!meeting) {
      return null;
    }

    const meetingStart =
      this.getMeetingTimestamp(
        meeting
      );

    if (!meetingStart) {
      return null;
    }

    const availableFrom =
      new Date(
        meetingStart -
        this.CLASS_ACCESS_BEFORE_MS
      );

    return this.formatTimeFromDate(
      availableFrom
    );
  }


  get accessClosesAt(): string | null {
    const meeting =
      this.activeMeeting;

    if (!meeting) {
      return null;
    }

    const meetingStart =
      this.getMeetingTimestamp(
        meeting
      );

    if (!meetingStart) {
      return null;
    }

    const closeTime =
      new Date(
        meetingStart +
        this.CLASS_ACCESS_AFTER_MS
      );

    return this.formatTimeFromDate(
      closeTime
    );
  }


  get accessWindowLabel(): string | null {
    if (
      !this.accessAvailableFrom ||
      !this.accessClosesAt
    ) {
      return null;
    }

    return (
      `${this.accessAvailableFrom} - ` +
      `${this.accessClosesAt}`
    );
  }


  /* =========================
     CLASS LINK
  ========================= */

  get canEnterActiveMeeting(): boolean {
    const meeting =
      this.activeMeeting;

    if (!meeting) {
      return false;
    }

    return (
      this.isMeetingInAccessWindow(
        meeting
      ) &&
      this.hasValidLink(
        meeting
      )
    );
  }


  enterActiveClass(): void {
    const meeting =
      this.activeMeeting;

    if (!meeting) {
      return;
    }

    if (
      !this.isMeetingInAccessWindow(
        meeting
      )
    ) {
      return;
    }

    if (!this.hasValidLink(meeting)) {
      return;
    }

    const finalUrl =
      this.getFormattedLink(
        meeting.link
      );

    if (!finalUrl) {
      return;
    }

    if (meeting.id) {
      this.bookingService
        .clickAssistanceByStudent(
          meeting.id
        )
        .subscribe({
          next: () => {
            this.openClassLink(
              finalUrl
            );
          },

          error: () => {
            /*
             * Aunque falle el registro,
             * permitimos ingresar a la clase.
             */
            this.openClassLink(
              finalUrl
            );
          },
        });

      return;
    }

    this.openClassLink(
      finalUrl
    );
  }


  private openClassLink(
    url: string
  ): void {
    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }


  private hasValidLink(
    meeting: MeetingDTO
  ): boolean {
    const link =
      meeting.link?.trim();

    if (!link) {
      return false;
    }

    const formattedLink =
      link.startsWith('http')
        ? link
        : `https://${link}`;

    try {
      new URL(formattedLink);
      return true;
    } catch (_) {
      return false;
    }
  }


  private getFormattedLink(
    link: string | undefined
  ): string {
    if (!link) {
      return '';
    }

    const formattedLink =
      link.startsWith('http')
        ? link
        : `https://${link}`;

    try {
      new URL(formattedLink);
      return formattedLink;
    } catch (_) {
      return '';
    }
  }


  /* =========================
     TOTAL CLASSES
  ========================= */

  get totalClasses(): number {
    return this.meetings.filter(
      (meeting) =>
        meeting.present === true
    ).length;
  }


  /* =========================
     PROGRESS
  ========================= */

  get progressPercentage(): number {
    if (this.totalClasses === 0) {
      return 0;
    }

    /*
     * Progreso visual provisional.
     * Después podemos reemplazarlo
     * por el progreso real del nivel.
     */
    return Math.min(
      this.totalClasses * 4,
      100
    );
  }


  get progressMessage(): string {
    if (this.totalClasses === 0) {
      return (
        'Agenda tu primera clase ' +
        'y comienza a avanzar.'
      );
    }

    if (
      this.progressPercentage < 40
    ) {
      return (
        'Cada clase te acerca más ' +
        'a tu objetivo.'
      );
    }

    if (
      this.progressPercentage < 80
    ) {
      return (
        'Completa más clases y actividades ' +
        'para seguir avanzando.'
      );
    }

    return (
      'Cada clase completada ' +
      'fortalece tu aprendizaje.'
    );
  }


  /* =========================
     STUDY STREAK
  ========================= */

  get studyStreak(): number {
    const classDates =
      this.getUniqueClassDates();

    if (
      classDates.length === 0
    ) {
      return 0;
    }

    const availableDates =
      new Set(classDates);

    let streak = 0;

    let currentDate =
      this.startOfDay(
        new Date()
      );

    /*
     * Si hoy todavía no tiene clase,
     * comenzamos a revisar desde ayer.
     */
    if (
      !availableDates.has(
        this.toDateKey(
          currentDate
        )
      )
    ) {
      currentDate.setDate(
        currentDate.getDate() - 1
      );
    }

    while (
      availableDates.has(
        this.toDateKey(
          currentDate
        )
      )
    ) {
      streak++;

      currentDate.setDate(
        currentDate.getDate() - 1
      );
    }

    return streak;
  }


  get streakMessage(): string {
    if (
      this.studyStreak === 0
    ) {
      return '¡Empieza hoy!';
    }

    if (
      this.studyStreak === 1
    ) {
      return '¡Buen comienzo!';
    }

    if (
      this.studyStreak < 7
    ) {
      return '¡Sigue así!';
    }

    if (
      this.studyStreak < 15
    ) {
      return '¡Excelente!';
    }

    return '¡Imparable!';
  }


  /* =========================
     ACCESS WINDOW
  ========================= */

  private isMeetingInAccessWindow(
    meeting: MeetingDTO
  ): boolean {
    const meetingStart =
      this.getMeetingTimestamp(
        meeting
      );

    if (!meetingStart) {
      return false;
    }

    const now =
      Date.now();

    const availableFrom =
      meetingStart -
      this.CLASS_ACCESS_BEFORE_MS;

    const availableUntil =
      meetingStart +
      this.CLASS_ACCESS_AFTER_MS;

    return (
      now >= availableFrom &&
      now <= availableUntil
    );
  }


  /* =========================
     MEETING TIMESTAMP
  ========================= */

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
      String(rawDate).slice(
        0,
        10
      );

    const [
      year,
      month,
      day,
    ] = datePart
      .split('-')
      .map(Number);

    const hour =
      Number(rawHour);

    if (
      !year ||
      !month ||
      !day ||
      Number.isNaN(hour)
    ) {
      return 0;
    }

    /*
     * Mantiene exactamente la lógica
     * utilizada actualmente en
     * StudentLiveClassesComponent
     * para Ecuador.
     */
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


  /* =========================
     ATTENDANCE DATES
  ========================= */

  private getUniqueClassDates(): string[] {
    const today =
      this.startOfDay(
        new Date()
      );

    return [
      ...new Set(
        this.meetings
          .filter(
            (meeting) =>
              this.hasStudentAttendance(
                meeting
              )
          )
          .map(
            (meeting) =>
              this.getAttendanceDate(
                meeting
              )
          )
          .filter(
            (
              date
            ): date is Date => {
              return (
                date instanceof Date &&
                !Number.isNaN(
                  date.getTime()
                )
              );
            }
          )
          .map(
            (date) =>
              this.startOfDay(
                date
              )
          )
          .filter(
            (date) =>
              date.getTime() <=
              today.getTime()
          )
          .map(
            (date) =>
              this.toDateKey(
                date
              )
          )
      ),
    ].sort(
      (a, b) =>
        b.localeCompare(a)
    );
  }


  private hasStudentAttendance(
    meeting: MeetingDTO
  ): boolean {
    return (
      meeting.present === true
    );
  }


  private getAttendanceDate(
    meeting: MeetingDTO
  ): Date | null {
    const rawDate =
      meeting.localdate ??
      meeting.date;

    if (!rawDate) {
      return null;
    }

    const parsedDate =
      new Date(rawDate);

    return Number.isNaN(
      parsedDate.getTime()
    )
      ? null
      : parsedDate;
  }


  /* =========================
     DATE HELPERS
  ========================= */

  private startOfDay(
    date: Date
  ): Date {
    const normalizedDate =
      new Date(date);

    normalizedDate.setHours(
      0,
      0,
      0,
      0
    );

    return normalizedDate;
  }


  private toDateKey(
    date: Date
  ): string {
    const year =
      date.getFullYear();

    const month =
      `${date.getMonth() + 1}`
        .padStart(
          2,
          '0'
        );

    const day =
      `${date.getDate()}`
        .padStart(
          2,
          '0'
        );

    return (
      `${year}-` +
      `${month}-` +
      `${day}`
    );
  }


  private formatHour(
    hour: number
  ): string {
    const normalizedHour =
      ((hour % 24) + 24) % 24;

    const period =
      normalizedHour >= 12
        ? 'PM'
        : 'AM';

    const twelveHour =
      normalizedHour % 12 ||
      12;

    return (
      `${twelveHour
        .toString()
        .padStart(
          2,
          '0'
        )}:00 ${period}`
    );
  }


  private formatTimeFromDate(
    date: Date
  ): string {
    return date
      .toLocaleTimeString(
        'es-EC',
        {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Guayaquil',
        }
      );
  }

}