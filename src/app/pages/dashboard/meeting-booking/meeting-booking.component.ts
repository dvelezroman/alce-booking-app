import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonModule, isPlatformBrowser, NgForOf} from "@angular/common";
import {RouterModule} from '@angular/router';
import {Store} from "@ngrx/store";
import {Observable, Subject, takeUntil, tap} from "rxjs";
import { DateTime} from "luxon";
import { MeetingCalendarComponent } from '../../../components/meeting-calendar/meeting-calendar.component';
import { MeetingScheduleComponent } from '../../../components/meeting-list/meeting-schedule.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { MeetingTimeSlotsComponent } from '../../../components/time-slots/meeting-time-slots.component';
import { BookingService } from '../../../services/booking.service';
import { MeetingDTO, MeetingStatusEnum, CreateMeetingDto } from '../../../services/dtos/booking.dto';
import { FeatureFlagDto } from '../../../services/dtos/feature-flag.dto';
import { DisabledDatesAndHours, DisabledDays } from '../../../services/dtos/handle-date.dto';
import { Mode } from '../../../services/dtos/student.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { FeatureFlagService } from '../../../services/feature-flag.service';
import { HandleDatesService } from '../../../services/handle-dates.service';
import { convertEcuadorHourToLocal, getTimezoneOffsetHours, convertEcuadorDateToLocal } from '../../../shared/utils/dates.util';
import { selectUserData } from '../../../store/user.selector';


@Component({
  selector: 'app-meeting-booking',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    ModalComponent,
    MeetingCalendarComponent,
    MeetingTimeSlotsComponent,
    MeetingScheduleComponent
  ],
  templateUrl: './meeting-booking.component.html',
  styleUrl: './meeting-booking.component.scss'
})
export class MeetingBookingComponent implements OnInit, AfterViewInit {
  @ViewChild('scheduleList') scheduleList!: ElementRef;
  @ViewChild('timeSlotList') timeSlotList!: ElementRef;
  @ViewChild('calendarRef') calendarRef!: ElementRef;
  @ViewChild('timeSlotsRef') timeSlotsRef!: ElementRef;
  private linkInterval: any;
  private unsubscribe$ = new Subject<void>();
  canScrollLeft = false;
  canScrollRight = false;
  isDesktop = false;

  meetingType: Mode = Mode.ONLINE;
  mode = Mode;
  selectedDate: string = '';
  selectedTimeSlot: { label: string; value: number; isDisabled: boolean; localhour: string } = {
    label: '8:00',
    value: 8,
    isDisabled: false,
    localhour: convertEcuadorHourToLocal(8) + ':00'
  };

  today: string = '';
  selectedMonth!: string;
  selectedYear!: number;
  selectedDay: number | null = null;
  selectedDayFormatted!: string;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;
  meetings: MeetingDTO[] = [];
  meetingToDelete: MeetingDTO | null = null;
  selectedMeeting: MeetingDTO | null = null;
  selectedMeetingIndex: number = 0;
  linkStatus: string = 'not-clickable';
  ffs: FeatureFlagDto[] = [];
  isScheduleEnabled: boolean = true;
  disabledDates: Record<string, number[]> = {};
  disabledDatesAndHours: DisabledDatesAndHours = {};
  calendarAnimationClass: string = '';
  ecuadorTimeInterval!: any;
  ecuadorTime: string = '';
  ecuadorDate: string = '';
  localdateSelected: string = '';
  resetCalendarSelectionTrigger = false;

  modalConfig: ModalDto = modalInitializer();
  showTimeSlotsModal = false;
  isMeetingDetailModalActive = false;
  showSuccessModal = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private store: Store,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private ffService: FeatureFlagService,
    private handleDatesService: HandleDatesService
  ) {
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit() {

    this.ffService.getAll().subscribe(ffs => {
      this.ffs = ffs;
      const scheduleFlag = this.ffs.find(f => f.name === 'enable-schedule');
      this.isScheduleEnabled = scheduleFlag?.status ?? true;
    });

    this.getDisabledDates().subscribe();
    this.getDisabledDatesAndHours().subscribe();

    const nowInEcuador = DateTime.now().setZone('America/Guayaquil').setLocale('es');
    this.ecuadorTime = nowInEcuador.toFormat("HH:mm");
    this.ecuadorDate = nowInEcuador.toFormat("EEEE, dd 'de' LLLL");

    this.userData$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
      this.userData = state;
      if (state?.student?.id) {
        this.initializeMeetings();
      }
    });

    this.updateEcuadorTime();
      this.ecuadorTimeInterval = setInterval(() => {
      this.updateEcuadorTime();
      } , 60000);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      if (dateInput) {
        dateInput.addEventListener('click', () => {
          dateInput.showPicker();
        });
      }
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 300);
  }

  private updateEcuadorTime(): void {
    const nowInEcuador = DateTime.now().setZone('America/Guayaquil').setLocale('es');
    this.ecuadorTime = nowInEcuador.toFormat("HH:mm");
    this.ecuadorDate = nowInEcuador.toFormat("EEEE, dd 'de' LLLL");
    this.cdr.detectChanges(); // Para asegurarte de que actualiza el binding
  }

  initializeMeetings() {
    const currentDate = new Date();
    const toDate = new Date(currentDate);
    toDate.setDate(currentDate.getDate() + 10); // Add 10 days
    const formattedToDate = toDate.toISOString().split('T')[0];
    this.loadMeetings(this.getTodayDate(), formattedToDate, undefined, this.userData?.student?.id, MeetingStatusEnum.ACTIVE);
  }

  userName() {
    if (this.userData) {
      const { firstName, lastName } = this.userData;
      return `${firstName} ${lastName}`
    }
    return 'Usuario sin nombres';
  }

  onDaySelected(event: { date: string; label: string; day: number }) {
    const [year, month, day] = event.date.split('-').map(Number);

    this.selectedDate = event.date;
    this.selectedDay = day;
    this.selectedYear = year;
    this.selectedMonth = DateTime.fromObject({ month }).setLocale('es').toFormat('LLLL').toUpperCase();
    this.selectedDayFormatted = event.label;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodayDate(): string {
    return DateTime.now().setZone('America/Guayaquil').startOf('day').toISODate() ?? '';
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Increment the day by 1
    return this.formatDate(tomorrow);
  }

  getMaxDate(): string {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return this.formatDate(endOfMonth);
  }

  private resetCalendarSelection(): void {
    this.selectedDay = null;
    this.selectedDate = '';
    this.selectedDayFormatted = '';
    this.selectedTimeSlot = { label: "8:00", value: 8, isDisabled: false, localhour: convertEcuadorHourToLocal(8) + ':00' };
  }

  get monthNumber(): number {
    const monthMap: Record<string, number> = {
      ENERO: 1, FEBRERO: 2, MARZO: 3, ABRIL: 4, MAYO: 5, JUNIO: 6,
      JULIO: 7, AGOSTO: 8, SEPTIEMBRE: 9, OCTUBRE: 10, NOVIEMBRE: 11, DICIEMBRE: 12
    };
    return monthMap[this.selectedMonth] ?? 1;
  }

  selectTimeSlot(time: {label: string, value: number, isDisabled: boolean, localhour: string }) {
    if (!this.userData?.student?.stageId) {
      this.showModalMessage(
        "No puedes agendar clases, porque aún no tienes asignado un nivel 'Stage'. Comunícate con administración."
      );
      this.hideModalAfterDelay(2000);
      return;
    }

    if (this.selectedDay) {
      this.selectedTimeSlot = time;

      const [year, month, day] = this.selectedDate.split('-').map(Number);

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        this.showModalMessage("Debe seleccionar una fecha antes de escoger la hora.");
        this.hideModalAfterDelay(2000);
        return;
      }

      const ecuadorTime = DateTime.fromObject(
        { year, month, day, hour: time.value, minute: 0 },
        { zone: 'America/Guayaquil' }
      );

      this.localdateSelected = ecuadorTime.setZone(DateTime.local().zoneName).toISO() ?? '';

      this.showSuccessModal = true;
    } else {
      this.showModalMessage("Debe seleccionar una fecha antes de escoger la hora.");
      this.hideModalAfterDelay(2500);
    }
  }

  getFormattedLocalSelection(): string {
  if (!this.localdateSelected) return '';

  return DateTime.fromISO(this.localdateSelected)
    .setLocale('es')
    .toFormat("cccc, d 'de' LLLL 'a las' HH:mm");
}

  cancelSelection() {
    this.showSuccessModal = false;
    this.selectedTimeSlot = { label: "8:00", value: 8, isDisabled: false , localhour: convertEcuadorHourToLocal(8) + ':00' };
    this.localdateSelected = '';
     this.triggerCalendarReset();
  }


  bookMeeting() {
    //console.log("isMeetingDataValid:", this.isMeetingDataValid());

    if (this.isMeetingDataValid()) {
      const bookingData: CreateMeetingDto = this.createBookingData();
      this.bookingService.bookMeeting(bookingData).subscribe({
        next: () => {
          this.showModalMessage("Se agendó su clase!", false, false, true);
          this.showSuccessModal = false;
          this.hideModalAfterDelay(2000);
          this.initializeMeetings();
        },
        error: () => {
          this.showModalMessage("Ya tienes una meeting agendada en la fecha y hora seleccionada.");
          this.showSuccessModal = false;
          this.hideModalAfterDelay(2000);
        }
      });
    } else {
      this.showModalMessage("Debe seleccionar una fecha antes de escoger la hora.");
      this.showSuccessModal = false;
      this.hideModalAfterDelay(2000);
    }
  }


  loadMeetings(from?: string, to?: string, hour?: string, studentId?: number, status?: MeetingStatusEnum): void {
    this.bookingService.searchMeetings({ from, to, hour, studentId, assigned: true, status }).subscribe({
    next: (meetings: MeetingDTO[]) => {
      this.meetings = meetings;
      this.cdr.detectChanges();
      // setTimeout(() => this.checkScroll(), 300);
    }, error: (error) => {
        console.error('Error fetching meetings:', error);
      }
    });
  }

  isMeetingDataValid() {
    return this.selectedDate && this.selectedTimeSlot;
  }
  createBookingData(): CreateMeetingDto {
    if (!this.userData?.student) {
      throw new Error('Student data is required to create booking data.');
    }

    const date = this.selectedDate;
    const [year, month, day] = date.split('-').map(Number); // Assuming your format is "YYYY/MM/DD"

    // Ensure proper ISO 8601 format (zero-padding month & day)
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const formattedHour = this.selectedTimeSlot.value.toString().padStart(2, '0');
    // Create a valid ISO 8601 date string (Ecuador is UTC-5)
    const formattedDate = `${year}-${formattedMonth}-${formattedDay}T${formattedHour}:00:00-05:00`;
    const convertedDate = getTimezoneOffsetHours() !== 0 ? convertEcuadorDateToLocal(formattedDate) : formattedDate;

    return {
      studentId: this.userData.student.id,
      instructorId: undefined,
      stageId: this.userData.stage?.id,
      date: convertedDate,
      hour: getTimezoneOffsetHours() !== 0 ? convertEcuadorHourToLocal(this.selectedTimeSlot.value) : this.selectedTimeSlot.value,
      localdate: formattedDate,
      localhour: this.selectedTimeSlot.value,
      mode: this.meetingType,
      category: this.userData.student.studentClassification,
    };
  }

  hideModalAfterDelay(delay: number) {
    setTimeout(() => {
      this.modalConfig.show = false;
      this.triggerCalendarReset();
    }, delay);
  }

  private triggerCalendarReset() {
    this.resetCalendarSelectionTrigger = true;
    setTimeout(() => this.resetCalendarSelectionTrigger = false, 0);
    this.selectedDay = null;
    this.selectedDate = '';
    this.selectedDayFormatted = '';
    this.selectedTimeSlot = { label: "8:00", value: 8, isDisabled: false, localhour: convertEcuadorHourToLocal(8) + ':00' };
    this.localdateSelected = '';
  }

  deleteMeeting(meeting:MeetingDTO){
    if (meeting && meeting.id) {
      this.bookingService.deleteMeeting(meeting.id).subscribe({
        next: () => {
          this.initializeMeetings();
        },
        error: (e: Error) => {
          console.log(e);
        }
      });
    }
    return;
  }

  showModalMessage(message: string, isError: boolean = true, isInfo: boolean = false, isSuccess: boolean = false) {
    this.modalConfig = {
      show: true,
      message,
      isError,
      isSuccess,
      isInfo,
      close: () => {
        this.modalConfig.show = false;
      }
    };
  }

  openDeleteModal(meeting: MeetingDTO): void {
    this.meetingToDelete = meeting;
    this.modalConfig = {
      show: true,
      message: "¿Estás seguro de que deseas eliminar esta reunión?",
      isError: false,
      isSuccess: false,
      isInfo: true,
      showButtons: true,
      close: () => this.closeDeleteModal(),
      confirm: () => this.confirmDelete()
    };
  }

  confirmDelete(): void {
    if (this.meetingToDelete) {
      this.deleteMeeting(this.meetingToDelete);
      this.meetings = this.meetings.filter(m => m !== this.meetingToDelete);
    }
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.modalConfig = modalInitializer();
    this.meetingToDelete = null;
  }

  openMeetingDetailModal(meeting: MeetingDTO, index: number) {
    clearInterval(this.linkInterval);
    this.selectedMeeting = meeting;
    this.selectedMeetingIndex = index;
    this.updateLinkStatus();
    this.isMeetingDetailModalActive = true;
}

  closeMeetingDetailModal() {
    this.selectedMeeting = null;
    this.isMeetingDetailModalActive = false;
    clearInterval(this.linkInterval);
  }

  getFormattedLink(link: string | undefined): string {
    if (!link || !this.isValidUrl(link)) {
      return '';
    }
    return link.startsWith('http') ? link : `https://${link}`;
  }

  isValidUrl(link: string): boolean {
    try {
      new URL(link);
      return true;
    } catch (_) {
      return false;
    }
  }

  updateLinkStatus() {
    if (!this.selectedMeeting) return;

    this.calculateLinkStatus();

    const ONE_MINUTE = 60 * 1000;
    this.linkInterval = setInterval(() => {
      this.calculateLinkStatus();
    }, ONE_MINUTE);
  }

  calculateLinkStatus() {
    if (!this.selectedMeeting) return;

    const LINK_ACTIVE_BUFFER_MINUTES_BEFORE = 5 * 60 * 1000;
    const LINK_ACTIVE_BUFFER_MINUTES_AFTER = 30 * 60 * 1000;
    const timeZoneOffset = new Date().getTimezoneOffset() / 60;
    const meetingStart = new Date(this.selectedMeeting.date).getTime() + (timeZoneOffset * 60 * 60 * 1000);

    const now = new Date().getTime();
    const start = meetingStart - LINK_ACTIVE_BUFFER_MINUTES_BEFORE;
    const end = meetingStart + LINK_ACTIVE_BUFFER_MINUTES_AFTER;

    if (now < start) {
      this.linkStatus = 'not-clickable';
    } else if (now >= start && now <= end) {
      this.linkStatus = 'clickable';
    } else {
      this.linkStatus = 'not-available';
    }
  }

  getMeetingLinkMessage(): string {
    const hasInstructor = !!this.selectedMeeting?.instructor;
    const hasLink = !!this.selectedMeeting?.link?.trim();

    if (!hasInstructor) return 'Enlace aún no asignado';
    if (!hasLink) return 'Instructor no tiene asignado enlace';

    return 'Enlace asignado';
  }

  handleMeetingAssistanceClick(meetingId?: number) {
    if (!meetingId) return;

    this.bookingService.clickAssistanceByStudent(meetingId).subscribe({
      next: () => {
        // console.log("asistencia registrada");
      },
      error: () => {
        // console.log("error al registrar la asistencia.");
      }
    });
  }

  private getDisabledDates(): Observable<DisabledDays> {
    const [firstDayOfYear, lastDayOfYear] = this.getFirstAndLastDayOfYear();

    return this.handleDatesService.getNotAvailableDates(firstDayOfYear, lastDayOfYear).pipe(
      tap(disabledDays => {
        this.disabledDates = this.removeDuplicateDays(disabledDays);
        //console.log('Fechas deshabilitadas:', this.disabledDates);
      })
    );
  }

  private getDisabledDatesAndHours(): Observable<DisabledDatesAndHours> {
    const [firstDayOfYear, lastDayOfYear] = this.getFirstAndLastDayOfYear();

    return this.handleDatesService.getNotAvailableDatesAndHours(firstDayOfYear, lastDayOfYear).pipe(
      tap(disabledData => {
        this.disabledDatesAndHours = disabledData;
        //console.log('Horas deshabilitadas:', this.disabledDatesAndHours);
      })
    );
  }

  private removeDuplicateDays(disabledDays: Record<string, number[]>): Record<string, number[]> {
    const cleanedDisabledDays: Record<string, number[]> = {};
    Object.keys(disabledDays).forEach(monthKey => {
      const days = disabledDays[monthKey];
      cleanedDisabledDays[monthKey] = Array.from(new Set(days));
    });

    return cleanedDisabledDays;
  }

  private getFirstAndLastDayOfYear(): [string, string] {
    const year = new Date().getFullYear();
    const firstDay = `${year}-01-01`;
    const lastDay = `${year}-12-31`;
    return [firstDay, lastDay];
  }


  canDeleteMeeting(meeting: MeetingDTO): boolean {
    const utcNow = new Date();
    const ecuadorNow = new Date(utcNow.getTime() - 5 * 60 * 60 * 1000); // subtract 5 hours
    const meetingDate = new Date(meeting.localdate); // assuming ISO string or Date

    if (
      meeting.linkOpened ||
      meeting.markAssistanceById ||
      ecuadorNow > meetingDate
    ) {
      return false;
    }

    return true;
  }
}


