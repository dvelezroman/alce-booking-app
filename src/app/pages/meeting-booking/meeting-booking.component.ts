import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonModule, NgForOf} from "@angular/common";


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
  timeSlots: {label: string, value: number}[] = [];
  today: string = '';
  maxDate: string = '';

  formattedDate: string = '';
  formattedTime: string = '';

  showModal = false;
  showSuccessModal = false;

  constructor() {
    this.initializeTimeSlots();


  }

  ngOnInit() {
    this.today = this.getTodayDate();
    this.maxDate = this.getMaxDate();
    this.selectedDate = this.today; // Set the default selected date to today
  }

  ngAfterViewInit() {
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.addEventListener('click', () => {
        dateInput.showPicker();
      });
    }
  }

  initializeTimeSlots() {
    const startHour = 8; // 8 AM
    const endHour = 21; // 9 PM
    this.timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return { label: `${hour}:00 to ${hour + 1}:50`, value: hour };
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

  formatTime(timeSlot: string): string {
    const hour = parseInt(timeSlot, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  }

  bookMeeting() {
    if (this.selectedDate && this.selectedTimeSlot) {
      const dateObject = new Date(this.selectedDate);
      this.formattedDate = this.formatDate(dateObject);
      this.formattedTime = this.formatTime(this.selectedTimeSlot);

      console.log(`Meeting booked on ${this.formattedDate} at ${this.formattedTime}`);

      this.showSuccessModal = true;

      setTimeout(() => {
        this.showSuccessModal = false;
      }, 4000);
      // Add your booking logic here, e.g., send the selected date and time to your backend API.
    } else {
      this.showModal = true;

      setTimeout(() => {
        this.showModal = false;
      }, 2000);
    }
  }
}
