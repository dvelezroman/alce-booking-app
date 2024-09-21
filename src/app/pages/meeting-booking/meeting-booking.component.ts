import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonModule, isPlatformBrowser, NgForOf} from "@angular/common";
import { Router } from '@angular/router';
import {Store} from "@ngrx/store";
import {selectUserData} from "../../store/user.selector";
import {Observable} from "rxjs";
import {UserDto} from "../../services/dtos/user.dto";
import {BookingService} from "../../services/booking.service";

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

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private store: Store,
    private bookingService: BookingService,
  ) {
    this.initializeTimeSlots();
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit() {
    this.userData$.subscribe(state => {
      this.userData = state;
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
  }

  userName() {
    if (this.userData) {
      const { firstName, lastName } = this.userData;
      return `${firstName} ${lastName}`
    }
    return 'Nombre de Usuario';
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

  getMaxDate(): string {
    const today = new Date();
    const maxDate = new Date(today.setDate(today.getDate() + 7)); // One week from today
    return this.formatDate(maxDate);
  }

  generateCurrentMonthDays() {
    const monthIndex = new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth();
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
    this.generateCurrentMonthDays();
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
    this.generateCurrentMonthDays();
  }

  isDaySelectable(day: any): boolean {
    const currentDate = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth(), day.day);
    const todayDate = new Date(this.today);
    const maxDate = new Date(this.maxDate);


    const isSameMonth = currentDate.getMonth() === todayDate.getMonth() && currentDate.getFullYear() === todayDate.getFullYear();
    const isWithinRange = currentDate >= todayDate && currentDate <= maxDate;

    return isSameMonth && isWithinRange;
  }

  selectDay(day: any) {
    if (this.isDaySelectable(day)) {
      this.selectedDay = day.day;
      this.selectedDayFormatted = `${day.dayOfWeek}, ${this.selectedMonth} ${day.day}`;
      console.log('Día seleccionado:', this.selectedDayFormatted);
    }
  }

  selectTimeSlot(time: {label: string, value: number}) {
    if (this.selectedDayFormatted) {
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
    if (this.isMeetingDataValid()) {
      const bookingData = this.createBookingData();
      this.bookingService.bookMeeting(bookingData).subscribe(response => {
          console.log(response);
          this.showSuccessModal = false;
          this.showInfoModal = true;
          this.hideInfoModalAfterDelay(3000);
      },
          error => {
            this.showSuccessModal = false;
            this.showModalBookingError = true;
            this.hideBookingErrorModalAfterDelay(3000);
          });
    } else {
      this.showModal = true;
      this.hideModalAfterDelay(2000);
    }
  }

  isMeetingDataValid() {
    return this.selectedDate && this.selectedTimeSlot;
  }

  createBookingData() {
    return {
      studentId: this.userData?.student?.id as number,
      instructorId: null,
      stageId: this.userData?.stage?.id,
      date: new Date(this.selectedDate),
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
}
