import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-meeting-booking',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './meeting-booking.component.html',
  styleUrl: './meeting-booking.component.scss'
})
export class MeetingBookingComponent implements OnInit {
  selectedDate: string = '';
  selectedTimeSlot: string = '';
  timeSlots: {label: string, value: number}[] = [];
  today: string = '';
  maxDate: string = '';

  constructor() {
    this.initializeTimeSlots();
  }

  ngOnInit() {
    this.today = this.getTodayDate();
    this.maxDate = this.getMaxDate();
    this.selectedDate = this.today; // Set the default selected date to today
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

  bookMeeting() {
    if (this.selectedDate && this.selectedTimeSlot) {
      console.log(`Meeting booked on ${this.selectedDate} at ${this.selectedTimeSlot}`);
      // Add your booking logic here, e.g., send the selected date and time to your backend API.
    } else {
      alert('Please select both a date and a time slot.');
    }
  }
}
