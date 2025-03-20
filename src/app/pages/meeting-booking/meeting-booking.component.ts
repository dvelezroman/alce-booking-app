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
import {selectUserData} from "../../store/user.selector";
import {Observable, Subject, takeUntil, tap} from "rxjs";
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
import { HandleDatesService } from '../../services/handle-dates.service';
import { DisabledDatesAndHours, DisabledDays } from '../../services/dtos/handle-date.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';


@Component({
  selector: 'app-meeting-booking',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    CommonModule,
    RouterModule,
    ModalComponent
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
  selectedTimeSlot: { label: string; value: number; isDisabled: boolean } = { label: '8:00', value: 8, isDisabled: false };
  hoverIndex: number | null = null;
  timeSlots: { label: string; value: number; isDisabled: boolean }[] = [];
  today: string = '';
  maxDate: string = '';
  selectedMonth!: string;
  selectedYear!: number;
  currentMonthDays: any[] = [];
  selectedDay: number | null = null;
  selectedDayFormatted!: string;
  todayMonth!: string;
  todayYear!: number;
  nextMonth_!: string;
  nextYear!: number;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;
  meetings: MeetingDTO[] = [];
  meetingToDelete: MeetingDTO | null = null;
  selectedMeeting: MeetingDTO | null = null;
  selectedMeetingIndex: number = 0;
  linkStatus: string = 'not-clickable';
  ffs: FeatureFlagDto[] = [];
  disabledDates: Record<string, number[]> = {};
  disabledDatesAndHours: DisabledDatesAndHours = {};
  calendarAnimationClass: string = '';
  
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

    this.getDisabledDates().subscribe(() => {
      this.getDisabledDatesAndHours().subscribe(() => {
        this.initializeCalendar();
      });
    });
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

  private initializeCalendar(): void {
    this.today = this.getTodayDate();
    this.maxDate = this.getMaxDate();
    this.selectedDate = this.today;

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
    const endHour = 20;  // 8 PM
    this.timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return { label: `${hour}:00`, value: hour, isDisabled: false };
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
    this.calendarAnimationClass = 'fade-out';

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
    this.filterDisabledTimeSlots();
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
    this.calendarAnimationClass = 'fade-in';
    this.resetCalendarAnimation();
  }

  private resetCalendarAnimation() {
    setTimeout(() => {
      this.calendarAnimationClass = '';
    }, 300);
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

  this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '', dayOfWeek: '', isDisabled: false }));
  this.currentMonthDays = this.currentMonthDays.concat(
    Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(this.selectedYear, monthIndex, day);
      const dayOfWeek = date.toLocaleString('es-ES', { weekday: 'long' }).toUpperCase();
      const dayData = this.disabledDatesAndHours[monthIndex.toString()]?.find(dateAndHour => dateAndHour.day === day);
      const isCompletelyDisabled = dayData ? dayData.hours.length === 0 : false;
      const isDisabled = isCompletelyDisabled;

      //console.log(`Día: ${day}, isDisabled: ${isDisabled}, Horas deshabilitadas:`, dayData?.hours);
      return {
        day,
        dayOfWeek,
        date: date.toLocaleString().split('T')[0],
        isDisabled
      };
    })
  );
}

  nextMonth() {
    this.calendarAnimationClass = 'fade-out';
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

    this.filterDisabledTimeSlots()
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
    this.calendarAnimationClass = 'fade-in';
    this.resetCalendarAnimation();
  }
  

  private filterDisabledTimeSlots(): void {
    this.timeSlots = this.timeSlots.filter(slot => !slot.isDisabled);
  }

  isDaySelectable(day: { day: number }): boolean {
    const monthMap: Record<string, number> = {
      ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
      JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11
    };

    if (!this.selectedMonth || !this.selectedYear || !(this.selectedMonth in monthMap)) {
      return false; // Ensure valid month and year
    }

    const monthIndex = monthMap[this.selectedMonth];
    const selectedDate = new Date(this.selectedYear, monthIndex, day.day);

    const today = new Date(this.today);
    if (isNaN(today.getTime())) return false; // Ensure today is a valid date
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    // Get the start of the current week (Monday)
    const weekStart = new Date(today);
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7
    weekStart.setDate(today.getDate() - dayOfWeek + 1);

    // Get the end of the current week (Saturday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 5);

    // Get the start of next week (Monday)
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(weekStart.getDate() + 7);

    // Get the end of next week (Saturday)
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 5);

    return (
      selectedDate.getDay() !== 0 && // Exclude Sundays
      selectedDate > today && // Allow today and future days
      (
        (selectedDate >= weekStart && selectedDate <= weekEnd) ||
        (selectedDate >= nextWeekStart && selectedDate <= nextWeekEnd)
      )
    );
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

  private resetCalendarSelection(): void {
    this.selectedDay = null;
    this.selectedDate = '';
    this.selectedDayFormatted = '';
    this.selectedTimeSlot = { label: "8:00", value: 8, isDisabled: false };
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
    // console.log(getTimezoneOffsetHours());
    const currentHour = currentDate.getHours() - getTimezoneOffsetHours();
// console.log(currentDate);
    // Define the time slot range
    const startHour = 8; // 8 AM
    const endHour = 20; // 8 PM
    const saturdayEndHour = 13; // For Saturdays, slots available until 13:00 (1 PM)

    // Check if the selected date is a Saturday (getDay() returns 6 for Saturday)
    const isSaturday = selectedDate.getDay() === 6;
    // console.log(selectedDate.getDay());
    const disabledHours = this.getDisabledHoursForDay(day.day, monthIndex);
    //console.log(`Horas deshabilitadas para el día ${day.day}:`, disabledHours);


    if (isSaturday) {
      // Only show time slots from 8:00 to 13:00 on Saturdays
      const availableStartHour = selectedDate.getDate() === currentDate.getDate() ? Math.max(startHour, currentHour + 3) : startHour;
      this.timeSlots = this.generateTimeSlots(availableStartHour, saturdayEndHour).map(slot => ({
        ...slot,
        isDisabled: disabledHours.includes(slot.value)
      }));
    } else if (selectedDate.toDateString() === currentDate.toDateString()) {
      if (currentHour >= endHour) {
        // If the current time is later than 21:00, return empty array
        this.timeSlots = [];
      } else {
        const availableStartHour = Math.max(startHour, currentHour + 2);
        this.timeSlots = this.generateTimeSlots(availableStartHour, endHour).map(slot => ({
          ...slot,
          isDisabled: disabledHours.includes(slot.value)
        }));
      }
    } else {
      this.timeSlots = this.generateTimeSlots(startHour, endHour).map(slot => ({
        ...slot,
        isDisabled: disabledHours.includes(slot.value)
      }));
    }
  }

  generateTimeSlots(startHour: number, endHour: number) {
    // Create time slots from startHour to endHour (inclusive)
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return { label: `${hour}:00`, value: hour };
    });
  }

  selectTimeSlot(time: {label: string, value: number, isDisabled: boolean}) {
    if (!this.userData?.student?.stageId) {
      this.showModalMessage(
        "No puedes agendar clases, porque aún no tienes asignado un nivel 'Stage'. Comunícate con administración."
      );
      this.hideModalAfterDelay(2000);
      return;
    }
    if (this.selectedDay) {
      this.selectedTimeSlot = time;
      this.showSuccessModal = true;
    } else {
      this.showModalMessage("Debe seleccionar una fecha antes de escoger la hora.");
      this.hideModalAfterDelay(3500);
    }
  }

  cancelSelection() {
    this.showSuccessModal = false;
    this.selectedTimeSlot = { label: "8:00", value: 8, isDisabled: false };
    this.selectedDate = '';
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
        error: (err) => {
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

  hideModalAfterDelay(delay: number) {
    setTimeout(() => {
      this.modalConfig.show = false;
      this.resetCalendarSelection();
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
    const LINK_ACTIVE_BUFFER_MINUTES_AFTER = 6 * 60 * 1000;
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

  private getDisabledHoursForDay(day: number, monthIndex: number): number[] {
    const monthData = this.disabledDatesAndHours[monthIndex.toString()];
    if (!monthData) return [];

    const dayData = monthData.find(d => d.day === day);
    return dayData ? dayData.hours : [];
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
}

