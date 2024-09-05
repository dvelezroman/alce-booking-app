import {Component, EventEmitter, Output} from '@angular/core';
import {NgClass, NgForOf} from "@angular/common";

@Component({
  selector: 'booking-calendar',
  standalone: true,
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  @Output() dateSelected = new EventEmitter<Date>();

  currentYear: number;
  currentMonth: number;
  selectedDate: Date | null = null;

  daysOfWeek: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysInMonth: number[] = [];
  blanks: number[] = [];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  today: Date = new Date();
  maxDate: Date = new Date(new Date().setDate(new Date().getDate() + 7));

  constructor() {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.updateCalendar();
  }

  // ngOnInit() {
  //   const today = new Date();
  //   this.currentYear = today.getFullYear();
  //   this.currentMonth = today.getMonth();
  //   this.updateCalendar();
  // }

  updateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.blanks = Array(firstDay).fill(0);
    this.daysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.updateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.updateCalendar();
  }

  selectDate(day: number) {
    const selected = new Date(this.currentYear, this.currentMonth, day);

    if (selected >= this.today && selected <= this.maxDate) {
      this.selectedDate = selected;
      this.dateSelected.emit(this.selectedDate);
    }
  }

  isSelected(day: number): boolean {
    const result = this.selectedDate && this.selectedDate.getDate() === day &&
      this.selectedDate.getMonth() === this.currentMonth &&
      this.selectedDate.getFullYear() === this.currentYear;
    return !!result;
  }

  isDisabled(day: number): boolean {
    const date = new Date(this.currentYear, this.currentMonth, day);
    return date < this.today || date > this.maxDate;
  }
}
