import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonModule, isPlatformBrowser, NgForOf} from "@angular/common";
import { Router } from '@angular/router';
import {Store} from "@ngrx/store";
import {selectUserData} from "../../store/user.selector";
import {Observable} from "rxjs";
import {UserDto} from "../../services/dtos/user.dto";

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
  selectedTimeSlot: string = '';
  timeSlots: string[] = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00',
    '21:00'];
  today: string = '';
  maxDate: string = '';
  selectedMonth!: string;
  selectedYear!: number;
  currentMonthDays: any[] = [];
  selectedDay: number | null = null;
  selectedDayFormatted!: string;
  showConfirm: string | null = null;
  formattedDate: string = '';
  formattedTime: string = '';
  showModal = false;
  showSuccessModal = false;
  showInfoModal = false;
  studentDetails = 'Detalles del estudiante';
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
  ) {
    this.initializeTimeSlots();
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit() {
    this.userData$.subscribe(state => {
      this.userData = state;
    });
    this.today = this.getTodayDate();
    this.maxDate = this.getMaxDate();
    this.selectedDate = this.today; // Set the default selected date to today

    const todayDate = new Date();
    this.selectedMonth = todayDate.toLocaleString('default', { month: 'long' });
    this.selectedYear = todayDate.getFullYear();

    // current month and year
    this.todayMonth = this.selectedMonth;
    this.todayYear = this.selectedYear;

    // Next month and year
    const nextDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 1);
    this.nextMonth_ = nextDate.toLocaleString('default', { month: 'long' });
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
      return `${hour}:00`;
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

    // Solo retrocede si el mes actual no es el mes seleccionado
    if (!(this.selectedMonth === currentMonth && this.selectedYear === currentYear)) {
      const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth() - 1, 1);
      this.selectedMonth = date.toLocaleString('default', { month: 'long' });
      this.selectedYear = date.getFullYear();
      this.generateCurrentMonthDays();
    }
  }

  nextMonth() {
    const today = new Date();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const maxMonth = nextMonthDate.toLocaleString('default', { month: 'long' });
    const maxYear = nextMonthDate.getFullYear();

    // Solo avanza si el mes seleccionado no es el siguiente mes
    if (!(this.selectedMonth === this.nextMonth_ && this.selectedYear === this.nextYear)) {
      const date = new Date(this.selectedYear, new Date(Date.parse(this.selectedMonth + " 1," + this.selectedYear)).getMonth() + 1, 1);
      this.selectedMonth = date.toLocaleString('default', { month: 'long' });
      this.selectedYear = date.getFullYear();
      this.generateCurrentMonthDays();
    }
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

  selectTimeSlot(time: string) {
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

  confirmSelection() {
    this.showSuccessModal = false;
    this.showInfoModal = true;
    console.log(`Fecha confirmada: ${this.selectedDayFormatted} a las ${this.selectedTimeSlot}`);
    setTimeout(() => {
      this.showInfoModal = false;
      this.router.navigate(['/home']);
    }, 3000);
  }

  cancelSelection() {
    this.showSuccessModal = false;
    this.selectedTimeSlot = '';

  }


  bookMeeting() {
    if (this.selectedDate && this.selectedTimeSlot) {
      const dateObject = new Date(this.selectedDate);
      this.formattedDate = this.formatDate(dateObject);
      this.formattedTime = this.selectedTimeSlot;

      console.log(`Meeting booked on ${this.formattedDate} at ${this.formattedTime}`);

      this.showSuccessModal = true;

      setTimeout(() => {
        this.showSuccessModal = false;
      }, 4000);
    } else {
      this.showModal = true;

      setTimeout(() => {
        this.showModal = false;
      }, 2000);
    }
  }
}
