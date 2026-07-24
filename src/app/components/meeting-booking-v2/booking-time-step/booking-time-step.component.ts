import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  BookingTimeListComponent,
  BookingTimeSlot,
} from '../booking-time-list/booking-time-list.component';

import { DisabledDatesAndHours } from '../../../services/dtos/handle-date.dto';

export interface BookingSelectedDayInfo {
  year: number;
  month: number;
  day: number;
}

@Component({
  selector: 'app-booking-time-step',
  standalone: true,
  imports: [
    CommonModule,
    BookingTimeListComponent,
  ],
  templateUrl: './booking-time-step.component.html',
  styleUrl: './booking-time-step.component.scss',
})
export class BookingTimeStepComponent {
  @Input() selectedDayInfo: BookingSelectedDayInfo | null = null;

  @Input() selectedDate = '';

  @Input() selectedDayFormatted = '';

  @Input() disabledDatesAndHours: DisabledDatesAndHours = {};

  @Input() ecuadorTime = '';

  @Input() minAllowedHour: number | null = null;

  @Input() userCity: string | null = null;

  @Input() userMode: string | null = null;

  @Input() userClassification: string | null = null;

  @Input() selectedTimeSlot: BookingTimeSlot | null = null;

  @Output() timeSlotSelected =
    new EventEmitter<BookingTimeSlot>();

  handleTimeSlotSelected(
    timeSlot: BookingTimeSlot
  ): void {
    this.timeSlotSelected.emit(timeSlot);
  }

  get selectedDateLabel(): string {
    if (this.selectedDayFormatted) {
      return this.selectedDayFormatted;
    }

    if (this.selectedDate) {
      return this.selectedDate;
    }

    return '';
  }
}