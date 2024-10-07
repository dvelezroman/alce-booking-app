import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonModule, isPlatformBrowser, NgForOf} from "@angular/common";
import { Router } from '@angular/router';
import {Store} from "@ngrx/store";
import {selectUserData} from "../../store/user.selector";
import {Observable, Subject, takeUntil} from "rxjs";
import {UserDto} from "../../services/dtos/user.dto";
import {BookingService} from "../../services/booking.service";
import {CreateMeetingDto, MeetingDTO} from "../../services/dtos/booking.dto";

@Component({
  selector: 'app-meeting-booking',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    CommonModule
  ],
  templateUrl: './meeting-booking.component.html',
  styleUrl: './meeting-booking.component.scss'
})
export class MeetingBookingComponent implements OnInit, AfterViewInit {
  @ViewChild('scheduleList') scheduleList!: ElementRef;
  @ViewChild('timeSlotList') timeSlotList!: ElementRef;
  canScrollLeft = false;
  canScrollRight = false;
  canScrollUp = false;
  canScrollDown = false;
  canGoBack: boolean = false;
  canGoForward: boolean = true;

  selectedDate: string = '';
  selectedTimeSlot: {label: string, value: number} = { label: "9:00", value: 9 };
  hoverIndex: number | null = null;
  timeSlots: {label: string, value: number }[] = [];
  today: string = '';
  maxDate: string = '';
  selectedMonth!: string;
  selectedYear!: number;
  currentMonthDays: any[] = [];
  selectedDay: number | null = null;
  selectedDayFormatted!: string;
  showConfirm: string | null = null;
  showModal = false;
  showSuccessModal = false;
  showInfoModal = false;
  showModalBookingError = false;
  todayMonth!: string;
  todayYear!: number;
  nextMonth_!: string;
  nextYear!: number;
  userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;
  meetings: MeetingDTO[] = [];
  private unsubscribe$ = new Subject<void>();
  showTimeSlotsModal = false;
  isDeleteModalActive = false;
  meetingToDelete: MeetingDTO | null = null;
  selectedMeeting: MeetingDTO | null = null;
  isMeetingDetailModalActive = false;
  selectedMeetingIndex: number = 0;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private store: Store,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeTimeSlots();
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit() {
    this.userData$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
      this.userData = state;
      if (state?.student?.id) {
        this.initializeMeetings();
      }
    });
    /**
     * Represents the current date.
     *
     * @returns {Date} The current date.
     */
    this.today = this.getTodayDate();
    /**
     * Retrieves the maximum date available.
     *
     * @returns {Date} The maximum date.
     */
    this.maxDate = this.getMaxDate();
    /**
     * Represents the selected date.
     * @type {Date}
     */
    this.selectedDate = this.today; // Set the default selected date to today

    const todayDate = new Date();
    /**
     * Represents the selected month.
     *
     * @type {string}
     */
    this.selectedMonth = todayDate.toLocaleString('default', { month: 'long' });
    /**
     * The selectedYear variable represents the currently selected year.
     *
     * @type {number}
     */
    this.selectedYear = todayDate.getFullYear();

    /**
     * Get the current month.
     *
     * @returns {number} The current month represented as a number.
     */
    this.todayMonth = this.selectedMonth;
    /**
     * Returns the current year.
     *
     * @returns {number} The current year.
     */
    this.todayYear = this.selectedYear;

    const nextDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 1);
    /**
     * Function to get the next month.
     *
     * @private
     * @returns {Date} The next month.
     */
    this.nextMonth_ = nextDate.toLocaleString('default', { month: 'long' });
    /**
     * Calculates the next year based on the current year.
     *
     * @param {number} currentYear - The current year.
     * @returns {number} The next year.
     */
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
    this.loadMeetings(this.getTodayDate(), formattedToDate, undefined, this.userData?.student?.id);
  }

  userName() {
    if (this.userData) {
      const { firstName, lastName } = this.userData;
      return `${firstName} ${lastName}`
    }
    return 'Nombre de Usuario';
  }



  initializeTimeSlots() {
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM
    this.timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return { label: `${hour}:00`, value: hour };
    });
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
    const maxDate = new Date(today.setDate(today.getDate() + 7)); // One week from today
    return this.formatDate(maxDate);
  }

  generateCurrentMonthDays() {
    const monthIndex = new Date(Date.parse(this.selectedMonth + ' 1,' + this.selectedYear)).getMonth();
    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.selectedYear, monthIndex, 1).getDay();

    this.currentMonthDays = Array.from({ length: firstDayOfWeek }, () => ({ day: '', dayOfWeek: '' }));
    this.currentMonthDays = this.currentMonthDays.concat(
      Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(this.selectedYear, monthIndex, i + 1);
        const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
        return {
          day: i + 1,
          dayOfWeek
        };
      })
    );
  }

  prevMonth() {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();

    if (this.selectedMonth === currentMonth && this.selectedYear === currentYear) {
      return;
    }
    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth() - 1, 1);
    this.selectedMonth = date.toLocaleString('default', {month: 'long'});
    this.selectedYear = date.getFullYear();

    this.selectedDay = null;
    this.selectedDayFormatted = '';
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  nextMonth() {
    // const today = new Date();
    // const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    // const maxMonth = nextMonthDate.toLocaleString('default', { month: 'long' });
    // const maxYear = nextMonthDate.getFullYear();


    if (this.selectedMonth === this.nextMonth_ && this.selectedYear === this.nextYear) {
      return;
    }
    const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth() + 1, 1);
    this.selectedMonth = date.toLocaleString('default', {month: 'long'});
    this.selectedYear = date.getFullYear();

    this.selectedDay = null;
    this.selectedDayFormatted = '';
    this.generateCurrentMonthDays();
    this.updateNavigationButtons();
  }

  isDaySelectable(day: any): boolean {
    const currentDate = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth(), day.day);
    const startDate = new Date(this.today);
    const maxDate = new Date(startDate);
    maxDate.setDate(startDate.getDate() + 7);

    return currentDate >= startDate && currentDate <= maxDate;
  }

  selectDay(day: any) {
    if (this.isDaySelectable(day)) {
      this.selectedDay = day.day;
      this.selectedDayFormatted = `${day.dayOfWeek}, ${this.selectedMonth} ${day.day}`;
      console.log('Día seleccionado:', day);
      this.recalculateTimeSlots(day); // Call the recalculation method
      this.showTimeSlotsModal = true; // Show the modal
    }
  }

  recalculateTimeSlots(day: any) {
    const selectedDate = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth(), day.day);
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    // Define the time slot range
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM

    if (selectedDate.toDateString() === currentDate.toDateString()) {
      // If the selected day is today
      if (currentHour >= endHour) {
        // If current time is later than 21:00, show time slots from tomorrow
        selectedDate.setDate(selectedDate.getDate() + 1);
      }

      // Generate time slots starting from the maximum of startHour or currentHour + 1
      const availableStartHour = Math.max(startHour, currentHour + 1);
      this.timeSlots = Array.from({ length: endHour - availableStartHour + 1 }, (_, i) => {
        const hour = availableStartHour + i;
        return { label: `${hour}:00`, value: hour };
      }).filter(slot => slot.value <= endHour); // Ensure the hour doesn't exceed 21
    } else {
      // If the selected day is not today, show all available hours
      this.timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
        const hour = startHour + i;
        return { label: `${hour}:00`, value: hour };
      });
    }
  }


  selectTimeSlot(time: {label: string, value: number}) {
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
    this.selectedTimeSlot = { label: "9:00", value: 9 };
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
      this.showModal = true;
      this.hideModalAfterDelay(2000);
    }
  }

  loadMeetings(from?: string, to?: string, hour?: string, studentId?: number): void {
    this.bookingService.searchMeetings({ from, to, hour, studentId, assigned: true }).subscribe({
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
    return {
      studentId: this.userData.student.id,
      instructorId: undefined,
      stageId: this.userData.stage?.id,
      date: new Date(`${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`).toISOString().split('T')[0],
      hour: this.selectedTimeSlot.value,
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

  closeTimeSlotsModal() {
    this.showTimeSlotsModal = false;
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
    console.log(meeting);
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

//scroll animación titulo componente
@HostListener('window:scroll', [])
onWindowScroll() {
  const header = document.querySelector('.class-booking-header') as HTMLElement;
  const scrollPosition = window.scrollY;
  const progress = Math.min(scrollPosition / 100, 1);

  // color de fondo en función del progreso
  const startColor = [255, 255, 255];
  const endColor = [226, 224, 235];
  const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * progress);
  const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * progress);
  const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * progress);

  // color de fondo progresivo
  header.style.background = `linear-gradient(rgb(${r}, ${g}, ${b}), #bcb4df8a)`;

  // sombra cuando hay scroll
  const boxShadowOpacity = 0.10 * progress;
  header.style.boxShadow = `0 2px 5px rgba(0, 0, 0, ${boxShadowOpacity})`;

  if (scrollPosition === 0) {
    header.style.background = 'linear-gradient(white, white)';
    header.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0)';
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

   // Método para actualizar los botones según el mes seleccionado
   updateNavigationButtons() {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();

    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonth = nextMonthDate.toLocaleString('default', { month: 'long' });
    const nextYear = nextMonthDate.getFullYear();

    // Puedes retroceder si no estás en el mes actual
    this.canGoBack = !(this.selectedMonth === currentMonth && this.selectedYear === currentYear);

    // Puedes avanzar si no estás ya en el mes siguiente
    this.canGoForward = !(this.selectedMonth === nextMonth && this.selectedYear === nextYear);
  }

  // método para seleccionar meetings, abrir y cerrar modal
  openMeetingDetailModal(meeting: MeetingDTO, index: number) {
    this.selectedMeeting = meeting;
    this.selectedMeetingIndex = index;
    this.isMeetingDetailModalActive = true;
  }

  closeMeetingDetailModal() {
    this.selectedMeeting = null;
    this.isMeetingDetailModalActive = false;
  }

  getFormattedLink(link: string | undefined): string {
    if (!link) {
      return ''
    }
    return link.startsWith('http://') || link.startsWith('https://') ? link : `http://${link}`;
  }
}
