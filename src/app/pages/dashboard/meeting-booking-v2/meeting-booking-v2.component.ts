import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { DateTime } from 'luxon';

import { MeetingBookingHeaderComponent } from '../../../components/meeting-booking-v2/meeting-booking-header/meeting-booking-header.component';
import { BookingStepsComponent } from '../../../components/meeting-booking-v2/booking-steps/booking-steps.component';
import {
  BookingDateStepComponent,
  BookingMonthChange,
  BookingSelectedDay,
} from '../../../components/meeting-booking-v2/booking-date-step/booking-date-step.component';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

import { StudentSuspensionModalComponent } from '../../../components/home/student-suspension-modal/student-suspension-modal.component';

import { FeatureFlagService } from '../../../services/feature-flag.service';
import { HandleDatesService } from '../../../services/handle-dates.service';
import { NotificationService } from '../../../services/notification.service';

import { FeatureFlagDto } from '../../../services/dtos/feature-flag.dto';
import {
  DisabledDatesAndHours,
  DisabledDays,
} from '../../../services/dtos/handle-date.dto';
import { SuspensionInfo, UserDto } from '../../../services/dtos/user.dto';

import { selectUserData } from '../../../store/user.selector';
import { BookingTimeStepComponent } from "../../../components/meeting-booking-v2/booking-time-step/booking-time-step.component";
import { TimeService } from '../../../services/time.service';
import { BookingTimeSlot } from '../../../components/meeting-booking-v2/booking-time-list/booking-time-list.component';
import { BookingConfirmationStepComponent } from "../../../components/meeting-booking-v2/booking-confirmation-step/booking-confirmation-step.component";
import { Mode } from '../../../services/dtos/student.dto';
import { BookingService } from '../../../services/booking.service';
import { CreateMeetingDto } from '../../../services/dtos/booking.dto';
import { convertEcuadorDateToLocal, convertEcuadorHourToLocal, getTimezoneOffsetHours } from '../../../shared/utils/dates.util';
import { getHttpErrorMessage } from '../../../shared/utils/http-error-message.util';
import { BookingHelpBannerComponent } from "../../../components/meeting-booking-v2/booking-help-banner/booking-help-banner.component";

@Component({
  selector: 'app-meeting-booking-v2',
  standalone: true,
  imports: [
    CommonModule,
    MeetingBookingHeaderComponent,
    BookingStepsComponent,
    BookingDateStepComponent,
    StudentSuspensionModalComponent,
    BookingTimeStepComponent,
    BookingConfirmationStepComponent,
    ModalComponent,
    BookingHelpBannerComponent
],
  templateUrl: './meeting-booking-v2.component.html',
  styleUrl: './meeting-booking-v2.component.scss',
})
export class MeetingBookingV2Component
  implements OnInit, OnDestroy
{
  private readonly unsubscribe$ =
    new Subject<void>();

  currentStep = 1;
  selectedDate = '';
  selectedDay: number | null = null;
  selectedDayFormatted = '';
  selectedMonth = '';

  selectedYear =
    DateTime.now()
      .setZone('America/Guayaquil')
      .year;

  get monthNumber(): number {
    if (!this.selectedDate) {
      return 0;
    }

    const [, month] = this.selectedDate
      .split('-')
      .map(Number);
    return month;

  }

  getFormattedLocalSelection(): string {
    if (!this.localdateSelected) {
      return '';
    }

    return DateTime
      .fromISO(this.localdateSelected)
      .setLocale('es')
      .toFormat(
        "cccc, d 'de' LLLL 'a las' HH:mm"
      );
  }

  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;
  disabledDates: Record<string, any[]> = {};
  disabledDatesAndHours: DisabledDatesAndHours = {};
  isScheduleEnabled = true;
  resetCalendarSelectionTrigger = false;
  isLoadingAvailability = false;
  featureFlags: FeatureFlagDto[] = [];
  showSuspensionModal = false;
  isSuspended = false;
  isBlocked = false;
  modalConfig: ModalDto = modalInitializer();

  ecuadorTime = '';
  serverMinAllowedHour: number | null = null;
  selectedTimeSlot: BookingTimeSlot | null = null;

  readonly mode = Mode;

  modalMeetingType: Mode | null = null;
  meetingType: Mode | null = null;
  localdateSelected = '';

  isBooking = false;

  suspensionInfo: SuspensionInfo | null = null;


  private ecuadorTimeInterval: ReturnType<typeof setInterval> | null = null;
  private serverTimeInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly store: Store,
    private readonly featureFlagService: FeatureFlagService,
    private readonly handleDatesService: HandleDatesService,
    private readonly notificationService: NotificationService,
    private readonly bookingService: BookingService,
    private readonly timeService: TimeService,
    private readonly router: Router
  ) {
    this.userData$ =
      this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.loadScheduleFeatureFlag();
    this.subscribeToUserData();

    this.updateEcuadorTime();
    this.loadServerTime();

    this.ecuadorTimeInterval = setInterval(() => {
      this.updateEcuadorTime();
    }, 60000);

    this.serverTimeInterval = setInterval(() => {
      this.loadServerTime();
    }, 60000);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.ecuadorTimeInterval) {
      clearInterval(this.ecuadorTimeInterval);
    }

    if (this.serverTimeInterval) {
      clearInterval(this.serverTimeInterval);
    }
  }

  get studentName(): string {
    const firstName =
      this.userData?.firstName?.trim() ?? '';

    const lastName =
      this.userData?.lastName?.trim() ?? '';

    return (
      `${firstName} ${lastName}`.trim() ||
      'Estudiante'
    );
  }

  get stageName(): string {
    const stage = this.userData?.stage;

    if (!stage) {
      return 'No asignado';
    }

    if (stage.number && stage.description) {
      return `Stage ${stage.number} - ${stage.description}`;
    }

    if (stage.number) {
      return `Stage ${stage.number}`;
    }

    return stage.description || 'No asignado';
  }

  private loadScheduleFeatureFlag(): void {
    this.featureFlagService
      .getAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (featureFlags) => {
          this.featureFlags = featureFlags;

          const scheduleFlag =
            featureFlags.find(
              (flag) =>
                flag.name === 'enable-schedule'
            );

          this.isScheduleEnabled =
            scheduleFlag?.status ?? true;
        },
        error: (error) => {
          console.error(
            '[Booking V2] Error cargando feature flags:',
            error
          );

          this.isScheduleEnabled = true;
        },
      });
  }

  private subscribeToUserData(): void {
    this.userData$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((userData) => {
        this.userData = userData;

        this.isBlocked =
          userData?.status === 'BLOCK';

        this.isSuspended =
          !!userData?.suspensionInfo
            ?.isSuspended;

        if (this.isSuspended) {
          this.showSuspensionModal = true;
          return;
        }

        if (!userData?.student) {
          return;
        }

        this.loadCalendarAvailability();
      });
  }

  private loadCalendarAvailability(): void {
    this.isLoadingAvailability = true;

    let pendingRequests = 2;

    const completeRequest = (): void => {
      pendingRequests -= 1;

      if (pendingRequests === 0) {
        this.isLoadingAvailability = false;
      }
    };

    this.getDisabledDates()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          completeRequest();
        },
        error: (error) => {
          console.error(
            '[Booking V2] Error cargando días no disponibles:',
            error
          );

          this.disabledDates = {};
          completeRequest();
        },
      });

    this.getDisabledDatesAndHours()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          completeRequest();
        },
        error: (error) => {
          console.error(
            '[Booking V2] Error cargando horas no disponibles:',
            error
          );

          this.disabledDatesAndHours = {};
          completeRequest();
        },
      });
  }

  onMonthChanged(
    event: BookingMonthChange
  ): void {
    this.selectedYear = event.year;

    this.selectedMonth = DateTime
      .fromObject({
        year: event.year,
        month: event.month,
        day: 1,
      })
      .setLocale('es')
      .toFormat('LLLL')
      .toUpperCase();

    this.resetSelectedDateState();

  }

  onDaySelected(
    event: BookingSelectedDay
  ): void {
    if (this.isBlocked) {
      this.showBlockedMessage();
      return;
    }

    if (
      this.userData?.suspensionInfo
        ?.isSuspended
    ) {
      this.isSuspended = true;
      this.showSuspensionModal = true;
      return;
    }

    this.notificationService
      .loadUnreadCount()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (count) => {
          if (count > 0) {
            this.handleUnreadNotifications();
            return;
          }

          this.applySelectedDay(event);
        },
        error: (error) => {
          console.error(
            '[Booking V2] Error verificando notificaciones:',
            error
          );

          /*
           * Se conserva el comportamiento anterior:
           * si falla la consulta de notificaciones,
           * se permite continuar.
           */
          this.applySelectedDay(event);
        },
      });
  }

  // onDaySelected(
  //   event: BookingSelectedDay
  // ): void {
  //   if (this.isBlocked) {
  //     this.showBlockedMessage();
  //     return;
  //   }

  //   if (
  //     this.userData?.suspensionInfo
  //       ?.isSuspended
  //   ) {
  //     this.isSuspended = true;
  //     this.showSuspensionModal = true;
  //     return;
  //   }

  //   this.applySelectedDay(event);
  // }

  private applySelectedDay( event: BookingSelectedDay ): void {
    const [year, month, day] =
      event.date.split('-').map(Number);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day)
    ) {
      this.showModalMessage(
        'La fecha seleccionada no es válida.'
      );

      return;
    }

    this.selectedDate = event.date;
    this.selectedDay = day;
    this.selectedYear = year;

    this.selectedMonth = DateTime
      .fromObject({
        year,
        month,
        day: 1,
      })
      .setLocale('es')
      .toFormat('LLLL')
      .toUpperCase();

    this.selectedDayFormatted = event.label;

    this.selectedTimeSlot = null;

    this.currentStep = 2;
  }

  private handleUnreadNotifications(): void {
    this.showModalMessage(
      'Tienes notificaciones pendientes por leer. Por favor, revísalas antes de agendar clases.',
      true,
      false,
      false,
      3000
    );

    setTimeout(() => {
      this.router.navigate([
        '/dashboard/notifications-inbox',
      ]);
    }, 3000);
  }

  private showBlockedMessage(): void {
    this.showModalMessage(
      this.getBlockedSchedulingMessage(),
      true,
      false,
      false,
      6000
    );
  }

  private getBlockedSchedulingMessage(): string {
    const reason = (this.userData?.schedulingBlockReason || '')
      .toLowerCase()
      .trim();

    if (
      reason.includes('invalid_email') ||
      reason.includes('banned_email')
    ) {
      return 'No puedes agendar porque tu correo está bloqueado (inválido o no recibe mensajes). Actualiza tu email en Perfil para reactivar el agendamiento.';
    }

    if (reason.includes('assessment')) {
      return 'No puedes agendar clases porque ya EXPIRARON TUS ASSESSMENTS. Para su activación, comunícate con administración.';
    }

    if (
      reason.includes('evaluacion') ||
      reason.includes('evaluaciones') ||
      reason.includes('evaluation')
    ) {
      return 'No puedes agendar clases porque tienes evaluaciones pendientes. Complétalas para poder agendar.';
    }

    return 'No puedes agendar clases porque ya EXPIRARON TUS ASSESSMENTS. Para su activación, comunícate con administración.';
  }

  private getDisabledDates(): Observable<DisabledDays> {
    const [from, to] =
      this.getFirstAndLastDayOfYear();

    return this.handleDatesService
      .getNotAvailableDates(from, to)
      .pipe(
        tap((disabledDates) => {
          this.disabledDates =
            disabledDates;
        })
      );
  }

  private getDisabledDatesAndHours():
    Observable<DisabledDatesAndHours> {
    const [from, to] =
      this.getFirstAndLastDayOfYear();

    return this.handleDatesService
      .getNotAvailableDatesAndHours(
        from,
        to
      )
      .pipe(
        tap((disabledData) => {
          this.disabledDatesAndHours =
            this.normalizeDisabledDatesAndHours(
              disabledData
            );
        })
      );
  }

  private normalizeDisabledDatesAndHours(
    data: DisabledDatesAndHours
  ): DisabledDatesAndHours {
    const normalizedResult:
      DisabledDatesAndHours = {};

    Object.entries(data).forEach(
      ([monthKey, entries]) => {
        const mergedEntries: any[] = [];

        entries.forEach((entry: any) => {
          const existingEntry =
            mergedEntries.find(
              (item: any) =>
                item.day === entry.day &&
                item.city === entry.city &&
                item.mode === entry.mode &&
                item.studentClassification ===
                  entry.studentClassification
            );

          if (existingEntry) {
            const combinedHours = [
              ...(existingEntry.hours ?? []),
              ...(entry.hours ?? []),
            ];

            existingEntry.hours =
              Array.from(
                new Set(combinedHours)
              );

            return;
          }

          mergedEntries.push({
            day: entry.day,
            hours: Array.from(
              new Set(entry.hours ?? [])
            ),
            city: entry.city ?? null,
            mode: entry.mode ?? null,
            studentClassification:
              entry.studentClassification ??
              null,
          });
        });

        normalizedResult[monthKey] =
          mergedEntries;
      }
    );

    return normalizedResult;
  }

  private getFirstAndLastDayOfYear():
    [string, string] {
    const year =
      this.selectedYear ||
      DateTime.now()
        .setZone(
          'America/Guayaquil'
        )
        .year;

    return [
      `${year}-01-01`,
      `${year}-12-31`,
    ];
  }

  resetBookingSelection(): void {
    this.resetSelectedDateState();
    this.triggerCalendarReset();
  }

  private resetSelectedDateState(): void {
    this.selectedDate = '';
    this.selectedDay = null;
    this.selectedDayFormatted = '';
    this.selectedTimeSlot = null;
    this.currentStep = 1;
  }

  private triggerCalendarReset(): void {
    this.resetCalendarSelectionTrigger =
      true;

    setTimeout(() => {
      this.resetCalendarSelectionTrigger =
        false;
    }, 0);
  }

  closeSuspensionModal(): void {
    this.showSuspensionModal = false;
  }

  showModalMessage(
    message: string,
    isError = true,
    isInfo = false,
    isSuccess = false,
    duration = 3000
  ): void {
    this.modalConfig = {
      show: true,
      message,
      isError,
      isInfo,
      isSuccess,
      close: () => {
        this.modalConfig.show = false;
      },
    };

    setTimeout(() => {
      this.modalConfig.close();
    }, duration);
  }

  private updateEcuadorTime(): void {
    this.ecuadorTime = DateTime
      .now()
      .setZone('America/Guayaquil')
      .toFormat('HH:mm');
  }

  private loadServerTime(): void {
    this.timeService
      .getCurrentEcuadorTime()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (time) => {
          this.serverMinAllowedHour =
            time.minute > 15
              ? time.hour + 3
              : time.hour + 2;
        },
        error: (error) => {
          console.error(
            '[Booking V2] Error obteniendo la hora del servidor:',
            error
          );

          this.serverMinAllowedHour = null;
        },
      });
  }

 selectTimeSlot(  timeSlot: BookingTimeSlot ): void {
    if (
      !this.selectedDay ||
      !this.selectedDate
    ) {
      this.showModalMessage(
        'Debe seleccionar una fecha antes de escoger la hora.'
      );

      return;
    }

    if (!this.userData?.student?.stageId) {
      this.showModalMessage(
        "No puedes agendar clases porque aún no tienes asignado un nivel 'Stage'. Comunícate con administración."
      );

      return;
    }

    this.selectedTimeSlot = timeSlot;

    this.localdateSelected =
      `${this.selectedDate}T${timeSlot.localhour}`;

    /*
    * Al cambiar la hora, se limpia la modalidad
    * seleccionada anteriormente.
    */
    this.modalMeetingType = null;
    this.meetingType = null;

    this.currentStep = 3;
  }

  cancelSelection(): void {
    this.modalMeetingType = null;
    this.meetingType = null;

    this.selectedTimeSlot = null;
    this.localdateSelected = '';

    this.currentStep =
      this.selectedDate ? 2 : 1;
  }

  isModeAllowedForSelectedDay(mode: Mode): boolean {
    if (!this.selectedDay) return false;

    const monthIndex = this.monthNumber - 1;
    const monthKey = String(monthIndex);

    const rules = this.disabledDatesAndHours?.[monthKey] ?? [];

    const normalize = (v: any) =>
      v === null || v === undefined ? null : v.toString().trim().toUpperCase();

    const userCity = normalize(this.userData?.city);
    const userClass = normalize(this.userData?.student?.studentClassification);
    const selectedMode = normalize(mode);

    const fullDayRulesForDay = rules.filter((rule: any) => {
      if (!rule) return false;
      if (Number(rule.day) !== Number(this.selectedDay)) return false;

      const hours = Array.isArray(rule.hours) ? rule.hours : [];

      // CLAVE:
      // Solo hours: [] significa bloqueo completo.
      // Si tiene horas, NO bloquea el modo completo.
      if (hours.length > 0) return false;

      const ruleCity = normalize(rule.city);
      const ruleClass = normalize(rule.studentClassification);
      const ruleMode = normalize(rule.mode);

      const cityMatch =
        ruleCity === null || ruleCity === userCity;

      const classMatch =
        ruleClass === null || ruleClass === userClass;

      const modeMatch =
        ruleMode === null || ruleMode === selectedMode;

      return cityMatch && classMatch && modeMatch;
    });

    return fullDayRulesForDay.length === 0;
  }

  isSelectedHourBlockedForMode(mode: Mode): boolean {
    if (!this.selectedDay || !this.selectedTimeSlot) return false;

    const monthIndex = this.monthNumber - 1;
    const monthKey = String(monthIndex);

    const rules = this.disabledDatesAndHours?.[monthKey] ?? [];

    const normalize = (v: any) =>
      v === null || v === undefined ? null : v.toString().trim().toUpperCase();

    const userCity = normalize(this.userData?.city);
    const userClass = normalize(this.userData?.student?.studentClassification);
    const selectedMode = normalize(mode);
    const selectedHour = Number(this.selectedTimeSlot.value);

    return rules.some((rule: any) => {
      if (!rule) return false;
      if (Number(rule.day) !== Number(this.selectedDay)) return false;

      const hours = Array.isArray(rule.hours) ? rule.hours : [];

      // Este método solo valida reglas por hora.
      if (hours.length === 0) return false;

      const ruleCity = normalize(rule.city);
      const ruleClass = normalize(rule.studentClassification);
      const ruleMode = normalize(rule.mode);

      const cityMatch =
        ruleCity === null || ruleCity === userCity;

      const classMatch =
        ruleClass === null || ruleClass === userClass;

      const modeMatch =
        ruleMode === null || ruleMode === selectedMode;

      const hourMatch = hours.includes(selectedHour);

      return cityMatch && classMatch && modeMatch && hourMatch;
    });
  }

  isModeDisabledForCurrentSelection( mode: Mode ): boolean {
    if (
      !this.selectedDay ||
      !this.selectedTimeSlot
    ) {
      return true;
    }

    if (
      !this.isModeAllowedForSelectedDay(mode)
    ) {
      return true;
    }

    if (
      this.isSelectedHourBlockedForMode(mode)
    ) {
      return true;
    }

    if (
      mode === Mode.PRESENCIAL &&
      this.userData?.student
        ?.studentClassification === 'KIDS' &&
      this.selectedTimeSlot.value === 20
    ) {
      return true;
    }

    return false;
  }

  setMeetingMode(mode: Mode): void {
    if (!this.selectedDay) {
      this.modalMeetingType = null;
      this.meetingType = null;

      this.showModalMessage(
        'Primero selecciona un día.'
      );

      return;
    }

    if (!this.selectedTimeSlot) {
      this.modalMeetingType = null;
      this.meetingType = null;

      this.showModalMessage(
        'Primero selecciona una hora.'
      );

      return;
    }

    if (
      !this.isModeAllowedForSelectedDay(mode)
    ) {
      this.modalMeetingType = null;
      this.meetingType = null;

      return;
    }

    if (
      this.isSelectedHourBlockedForMode(mode)
    ) {
      this.modalMeetingType = null;
      this.meetingType = null;

      this.showModalMessage(
        'Esta hora no está disponible para el modo seleccionado.',
        true
      );

      return;
    }

    this.modalMeetingType = mode;
    this.meetingType = mode;
  }

  private isMeetingDataValid(): boolean {
    return !!( this.selectedDate && this.selectedTimeSlot
    );
  }

  private hideModalAfterDelay(
    delay: number
  ): void {
    setTimeout(() => {
      this.modalConfig.show = false;

      this.resetSelectedDateState();
      this.triggerCalendarReset();
    }, delay);
  }

  private createBookingData(): CreateMeetingDto {
    const student = this.userData?.student;
    const selectedTimeSlot =
      this.selectedTimeSlot;

    if (!student) {
      throw new Error(
        'Student data is required to create booking data.'
      );
    }

    if (!selectedTimeSlot) {
      throw new Error(
        'A time slot is required to create booking data.'
      );
    }

    if (!this.selectedDate) {
      throw new Error(
        'A date is required to create booking data.'
      );
    }

    if (!this.meetingType) {
      throw new Error(
        'A meeting mode is required to create booking data.'
      );
    }

    const [year, month, day] =
      this.selectedDate
        .split('-')
        .map(Number);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day)
    ) {
      throw new Error(
        'The selected date is invalid.'
      );
    }

    const formattedMonth =
      month
        .toString()
        .padStart(2, '0');

    const formattedDay =
      day
        .toString()
        .padStart(2, '0');

    const formattedHour =
      selectedTimeSlot.value
        .toString()
        .padStart(2, '0');

    const formattedDate =
      `${year}-${formattedMonth}-${formattedDay}` +
      `T${formattedHour}:00:00-05:00`;

    const hasTimezoneOffset =
      getTimezoneOffsetHours() !== 0;

    const convertedDate =
      hasTimezoneOffset
        ? convertEcuadorDateToLocal(
            formattedDate
          )
        : formattedDate;

    const convertedHour =
      hasTimezoneOffset
        ? convertEcuadorHourToLocal(
            selectedTimeSlot.value
          )
        : selectedTimeSlot.value;

    return {
      studentId: student.id,
      instructorId: undefined,
      stageId: this.userData?.stage?.id,
      date: convertedDate,
      hour: convertedHour,
      localdate: formattedDate,
      localhour: selectedTimeSlot.value,
      mode: this.meetingType,
      category:
        student.studentClassification,
    };
  }

  bookMeeting(): void {
  if (this.isBooking) {
    return;
  }

  if (!this.meetingType) {
    this.showModalMessage(
      'Debes seleccionar el tipo de clase: Online o Presencial.'
    );

    return;
  }

  if (!this.isMeetingDataValid()) {
    this.showModalMessage(
      'Debe seleccionar una fecha antes de escoger la hora.'
    );

    this.hideModalAfterDelay(2000);

    return;
  }

  const bookingData: CreateMeetingDto =
    this.createBookingData();

  this.isBooking = true;

  this.bookingService
    .bookMeeting(bookingData)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: () => {
        this.isBooking = false;

        this.showModalMessage(
          'Se agendó su clase!',
          false,
          false,
          true,
          1500
        );

        this.resetSelectedDateState();
        this.triggerCalendarReset();
        this.loadCalendarAvailability();
      },

      error: (error) => {
        this.isBooking = false;

        const message =
          getHttpErrorMessage(
            error,
            'No se pudo agendar la clase. Intenta nuevamente.'
          );

        this.showModalMessage(
          message,
          true,
          false,
          false,
          message.length > 80
            ? 6000
            : 5000
        );
      },
    });
}

  openCancellationPolicies(): void {
    this.showModalMessage(
      'Puedes cancelar tu clase con anticipación.',
      false,
      true,
      false,
      4000
    );
  }
  
}