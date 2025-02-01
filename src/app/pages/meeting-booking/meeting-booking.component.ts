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
import {Router, RouterModule} from '@angular/router';
import {Store} from "@ngrx/store";
import {selectUserData} from "../../store/user.selector";
import {Observable, Subject, takeUntil} from "rxjs";
import {UserDto} from "../../services/dtos/user.dto";
import {BookingService} from "../../services/booking.service";
import {CreateMeetingDto, MeetingDTO, MeetingStatusEnum} from "../../services/dtos/booking.dto";
import {Mode} from '../../services/dtos/student.dto';
import {FeatureFlagService} from "../../services/feature-flag.service";
import {FeatureFlagDto} from "../../services/dtos/feature-flag.dto";
import { MonthKey } from '../../services/dtos/meeting-theme.dto';
import {
  convertEcuadorDateToLocal,
  convertEcuadorHourToLocal,
  getTimezoneOffsetHours
} from "../../shared/utils/dates.util";


@Component({
  selector: 'app-meeting-booking',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    CommonModule,
    RouterModule
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
  canScrollUp = false;
  canScrollDown = false;
  canGoBack: boolean = false;
  canGoForward: boolean = true;

  meetingType: Mode = Mode.ONLINE;
  mode = Mode;
  selectedDate: string = '';
  selectedTimeSlot: {label: string, value: number} = { label: "8:00", value: 8 };
  hoverIndex: number | null = null;
  timeSlots: {label: string, value: number }[] = [];
  today: string = '';
  maxDate: string = '';
  selectedMonth!: string;
  selectedYear!: number;
  currentMonthDays: any[] = [];
  selectedDay: number | null = null;
  selectedDayFormatted!: string;
  showModal = false;
  showSuccessModal = false;
  showInfoModal = false;
  showModalBookingError = false;
  showModalStageError = false;
  showModalScheduleError = false;
  todayMonth!: string;
  todayYear!: number;
  nextMonth_!: string;
  nextYear!: number;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;
  meetings: MeetingDTO[] = [];
  showTimeSlotsModal = false;
  isDeleteModalActive = false;
  meetingToDelete: MeetingDTO | null = null;
  selectedMeeting: MeetingDTO | null = null;
  isMeetingDetailModalActive = false;
  selectedMeetingIndex: number = 0;
  linkStatus: string = 'not-clickable';
  ffs: FeatureFlagDto[] = [];


  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private store: Store,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private ffService: FeatureFlagService,
  ) {
    this.initializeTimeSlots();
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit() {
    this.ffService.getAll().subscribe(ffs => {
      this.ffs = ffs;
    });
    this.userData$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
      this.userData = state;
      if (state?.student?.id) {
        this.initializeMeetings();
      }
    });
    this.today = this.getTodayDate();
    this.maxDate = this.getMaxDate();
    this.selectedDate = this.today; // Set the default selected date to today
    const todayDate = new Date();
    this.selectedMonth = todayDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = todayDate.getFullYear();
    this.todayMonth = this.selectedMonth;
    this.todayYear = this.selectedYear;
    const nextDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 1);
    this.nextMonth_ = nextDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.nextYear = nextDate.getFullYear();
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
    setTimeout(() => {
      this.checkScroll();
    }, 100);
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
      this.checkScroll();
      this.cdr.detectChanges();
    }, 300);

    setTimeout(() => {
      this.checkScrollY();
    }, 0);
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

  initializeTimeSlots() {
    const startHour = 8; // 8 AM
    const endHour = 20; // 8 PM
    this.timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return { label: `${hour}:00`, value: hour };
    });
  }

//referencias calendario
 scrollToCalendar() {
  if (this.calendarRef && this.calendarRef.nativeElement) {
    this.calendarRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
  //referencia a time
  scrollToTimeSlots() {
    if (this.timeSlotsRef && this.timeSlotsRef.nativeElement) {
      this.timeSlotsRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  updateNavigationButtons() {
    const today = new Date();
    const currentMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const currentYear = today.getFullYear();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonth = nextMonthDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const nextYear = nextMonthDate.getFullYear();

    this.canGoBack = !(this.selectedMonth === currentMonth && this.selectedYear === currentYear);
    this.canGoForward = !(this.selectedMonth === nextMonth && this.selectedYear === nextYear);
  }

  prevMonth() {
    const today = new Date();
    const monthMap: Record<MonthKey, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };

    const currentMonthIndex = monthMap[this.selectedMonth as MonthKey];

    if (currentMonthIndex === undefined) {
      console.error('Mes inválido en prevMonth:', this.selectedMonth);
      return;
    }
    // Calcula el mes anterior
    const currentDate = new Date(this.selectedYear, currentMonthIndex, 1);
    currentDate.setMonth(currentDate.getMonth() - 1);

    const isCurrentMonth =
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth();

    if (isCurrentMonth) {
      this.selectedMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
      this.selectedYear = today.getFullYear();
    } else {
      this.selectedMonth = currentDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
      this.selectedYear = currentDate.getFullYear();
    }

    this.selectedDay = null;
    this.selectedDayFormatted = '';

    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  generateCurrentMonthDays() {
    const monthMap: Record<MonthKey, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };

    const monthIndex = monthMap[this.selectedMonth as MonthKey];
    if (monthIndex === undefined) {
      console.error(`Mes inválido: ${this.selectedMonth}`);
      this.currentMonthDays = [];
      return;
    }

    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();

    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '', dayOfWeek: '' }));
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(this.selectedYear, monthIndex, i + 1);
        const dayOfWeek = date.toLocaleString('es-ES', { weekday: 'long' }).toUpperCase();
        return {
          day: i + 1,
          dayOfWeek,
          date: date.toLocaleString().split('T')[0] // Formato ISO para consistencia
        };
      })
    );

    // console.log(this.currentMonthDays);
  }

  nextMonth() {
    // const today = new Date();

    const monthMap: Record<MonthKey, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };

    const currentMonthIndex = monthMap[this.selectedMonth as MonthKey];
    if (currentMonthIndex === undefined) {
      return;
    }

    const currentDate = new Date(this.selectedYear, currentMonthIndex, 1);
    currentDate.setMonth(currentDate.getMonth() + 1);

    this.selectedMonth = currentDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    this.selectedYear = currentDate.getFullYear();

    this.selectedDay = null;
    this.selectedDayFormatted = '';

    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  isDaySelectable(day: any): boolean {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };
    const monthIndex = monthMap[this.selectedMonth];
    const currentDate = new Date(this.selectedYear, monthIndex, day.day);

    if (currentDate.getMonth() === 11 && (currentDate.getDate() === 21 || currentDate.getDate() === 25 || currentDate.getDate() === 31)) {
      return false;
    }
    if (currentDate.getMonth() === 0 && currentDate.getDate() === 1) {
      return false;
    }

    const startDate = new Date(this.today);
    const maxDate = new Date(startDate);
    maxDate.setDate(startDate.getDate() + 8);

    const isSunday = currentDate.getDay() === 0;
    return !isSunday && currentDate >= startDate && currentDate <= maxDate;
  }

  selectDay(day: any) {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };
    const monthIndex = monthMap[this.selectedMonth]; // Índice del mes actual
    const selectedDate = `${this.selectedYear}-${(monthIndex + 1).toString().padStart(2,'0')}-${day.day.toString().padStart(2,'0')}`;
    if (this.isDaySelectable(day)) {
      // console.log(selectedDate);
      this.selectedDate = selectedDate;
      this.selectedDay = day.day;
      this.selectedDayFormatted = `${day.dayOfWeek}, ${this.selectedMonth} ${day.day}`;
      this.recalculateTimeSlots(day);
      this.showTimeSlotsModal = true;
    }
  }

  recalculateTimeSlots(day: any) {
    // console.log('Recalculate Time Slots');
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };
// console.log(day);
    const monthIndex = monthMap[this.selectedMonth]; // Índice del mes actual
    const selectedDate = new Date(this.selectedYear, monthIndex, day.day);
    // const selectedDate = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth(), day.day);
    const currentDate = new Date();
    // const currentDay = currentDate.getDay();
    const currentHour = currentDate.getHours();
// console.log(currentDate);
    // Define the time slot range
    const startHour = 8; // 8 AM
    const endHour = 20; // 8 PM
    const saturdayEndHour = 13; // For Saturdays, slots available until 13:00 (1 PM)

    // Check if the selected date is a Saturday (getDay() returns 6 for Saturday)
    const isSaturday = selectedDate.getDay() === 6;
    // console.log(selectedDate.getDay());

    if (isSaturday) {
      // Only show time slots from 8:00 to 13:00 on Saturdays
      const availableStartHour = selectedDate.getDate() === currentDate.getDate() ? Math.max(startHour, currentHour + 2) : startHour;
      this.timeSlots = this.generateTimeSlots(availableStartHour, saturdayEndHour);
    } else if (selectedDate.toDateString() === currentDate.toDateString()) {
      // If the selected day is today
      // console.log('TODAY');
      // console.log(selectedDate, currentDate);
      // console.log(currentHour);
      if (currentHour >= endHour) {
        // console.log('TODAY MAS TARDE');
        // If the current time is later than 21:00, return empty array
        this.timeSlots = [];
      } else {
        // Generate time slots starting from the maximum of startHour or currentHour + 2
        const availableStartHour = Math.max(startHour, currentHour + 2);
        this.timeSlots = this.generateTimeSlots(availableStartHour, endHour);
      }
    } else {
      // If the selected day is not today, show all available hours
      this.timeSlots = this.generateTimeSlots(startHour, endHour);
    }
  }

  generateTimeSlots(startHour: number, endHour: number) {
    // Create time slots from startHour to endHour (inclusive)
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return { label: `${hour}:00`, value: hour };
    });
  }

  selectTimeSlot(time: {label: string, value: number}) {
    if (!this.userData?.student?.stageId) {
      this.showModalStageError = true;
      this.hideStageErrorModalAfterDelay(2000)
      return;
    }
    if (this.selectedDay) {
      this.selectedTimeSlot = time;
      this.showSuccessModal = true;
    } else {
      this.showModal = true;
      setTimeout(() => {
        this.showModal = false;
      }, 3500);
    }
  }

  cancelSelection() {
    this.showSuccessModal = false;
    this.selectedTimeSlot = { label: "8:00", value: 8 };
    this.selectedDate = '';
  }


  bookMeeting() {
    this.showTimeSlotsModal = false;
    if (this.isMeetingDataValid()) {
      const bookingData: CreateMeetingDto = this.createBookingData();
      this.bookingService.bookMeeting(bookingData).subscribe({
        next: () => {
          this.showSuccessModal = false;
          this.showInfoModal = true;
          this.hideInfoModalAfterDelay(2000);
          this.initializeMeetings();
        },
        error: () => {
          this.showSuccessModal = false;
          this.showModalBookingError = true;
          this.hideBookingErrorModalAfterDelay(2000);
        }
      });
    } else {
      this.showSuccessModal = false;
      this.showModal = true;
      this.hideModalAfterDelay(2000);
    }
  }

  loadMeetings(from?: string, to?: string, hour?: string, studentId?: number, status?: MeetingStatusEnum): void {
    this.bookingService.searchMeetings({ from, to, hour, studentId, assigned: true, status }).subscribe({
    next: (meetings: MeetingDTO[]) => {
      this.meetings = meetings;
      this.cdr.detectChanges();
      setTimeout(() => this.checkScroll(), 300);
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
      mode: this.meetingType,
      category: this.userData.student.studentClassification,
    };
  }

  hideInfoModalAfterDelay(delay: number) {
    setTimeout(() => {
      this.showInfoModal = false;
    }, delay);
  }

  hideModalAfterDelay(delay: number) {
    setTimeout(() => {
      this.showModal = false;
    }, delay);
  }

  hideBookingErrorModalAfterDelay(delay: number) {
    setTimeout(() => {
      this.showModalBookingError = false;
    }, delay);
  }

  hideStageErrorModalAfterDelay(delay: number) {
    setTimeout(() => {
      this.showModalStageError = false;
    }, delay);
  }

  hideScheduleErrorModalAfterDelay(delay: number) {
    setTimeout(() => {
      this.showModalScheduleError = false;
    }, delay);
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


  openDeleteModal(meeting: MeetingDTO): void {
    this.meetingToDelete = meeting;
    this.isDeleteModalActive = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalActive = false;
    this.meetingToDelete = null;
  }

  confirmDelete(): void {
    if (this.meetingToDelete) {
      this.deleteMeeting(this.meetingToDelete);
      this.meetings = this.meetings.filter(m => m !== this.meetingToDelete);
      this.closeDeleteModal();
    }
  }

//scroll flechas del contenedor de los meetings del estudiante y time slots
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScroll();
    this.checkScrollY();
  }

  checkScroll() {
    if (!this.scheduleList || !this.scheduleList.nativeElement) {
      return;
    }

    const el = this.scheduleList.nativeElement;
    this.canScrollLeft = el.scrollLeft > 0;
    this.canScrollRight = el.scrollWidth > el.clientWidth;
  }

  scrollLeft() {
    this.scheduleList.nativeElement.scrollBy({ left: -330, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300);
  }

  scrollRight() {
    this.scheduleList.nativeElement.scrollBy({ left: 330, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300);
  }

  scrollUp() {
    if (this.timeSlotList) {
      this.timeSlotList.nativeElement.scrollBy({ top: -400, behavior: 'smooth' });
      setTimeout(() => this.checkScrollY(), 300);
    }
  }

  scrollDown() {
    if (this.timeSlotList) {
      this.timeSlotList.nativeElement.scrollBy({ top: 400, behavior: 'smooth' });
      setTimeout(() => this.checkScrollY(), 300);
    }
  }

  checkScrollY() {
    if (!this.timeSlotList || !this.timeSlotList.nativeElement) {
      return;
    }
    const el = this.timeSlotList.nativeElement;
    this.canScrollUp = el.scrollTop > 0;
    const maxScrollTop = el.scrollHeight - el.clientHeight;
    this.canScrollDown = el.scrollTop < maxScrollTop;
  }


  // método para seleccionar meetings, abrir y cerrar modal
  openMeetingDetailModal(meeting: MeetingDTO, index: number) {
    this.selectedMeeting = meeting;
    this.selectedMeetingIndex = index;
    this.isMeetingDetailModalActive = true;
    this.updateLinkStatus();
  }

  closeMeetingDetailModal() {
    this.selectedMeeting = null;
    this.isMeetingDetailModalActive = false;
    clearInterval(this.linkInterval);

  }

  getFormattedLink(link: string | undefined): string {
    if (!link) {
      return 'El instructor no colocó enlace.'
    }
    return link.startsWith('http://') || link.startsWith('https://') ? link : `http://${link}`;
  }

  updateLinkStatus() {
    if (!this.selectedMeeting) return;

    const LINK_ACTIVE_BUFFER_MINUTES_BEFORE = 5 * 60 * 1000;
    const LINK_ACTIVE_BUFFER_MINUTES_AFTER = 55 * 60 * 1000;
    const ONE_SECOND = 1000;
    const timeZoneOffset = new Date().getTimezoneOffset() / 60;
    const meetingStart = new Date(this.selectedMeeting.date).getTime() + ((timeZoneOffset) * 60 * 60 * 1000 );
    // console.log(this.selectedMeeting.date);
    // console.log(new Date(meetingStart));
    this.linkInterval = setInterval(() => {
      const now = new Date().getTime();
      const start = meetingStart - LINK_ACTIVE_BUFFER_MINUTES_BEFORE;
      const end = meetingStart + LINK_ACTIVE_BUFFER_MINUTES_AFTER;
      if (now < start) {
        // The meeting is in the future, link is visible but not clickable
        this.linkStatus = 'not-clickable';
      } else if (now >= start && now <= end) {
        // The meeting is within the active window (5 minutes before start to 65 minutes after start), link is clickable
        this.linkStatus = 'clickable';
      } else {
        // The meeting has finished, link should not be clickable and show "Not available"
        this.linkStatus = 'not-available';
        clearInterval(this.linkInterval);
      }
    }, ONE_SECOND);
  }


  isCurrentWeek(date: Date): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

    // Calculate start of the current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0); // Set to start of the day

    // Calculate end of the current week (Saturday)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999); // Set to end of the day

    // Check if the given date is within the current week
    const formattedDate = new Date(date);
    return formattedDate >= startOfWeek && formattedDate <= endOfWeek;
  }

  capitalizeFirstLetter(value: string | null): string {
    if (value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return '';
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const formattedDate = new Date(date);

    return (
      formattedDate.getFullYear() === today.getFullYear() &&
      formattedDate.getMonth() === today.getMonth() &&
      formattedDate.getDate() === today.getDate()
    );
  }

  isTomorrow(date: Date): boolean {
    const formattedDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return (
      formattedDate.getFullYear() === tomorrow.getFullYear() &&
      formattedDate.getMonth() === tomorrow.getMonth() &&
      formattedDate.getDate() === tomorrow.getDate()
    );
  }
}

