import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
export class BookingTimeStepComponent implements OnChanges {
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

  isTimeStepExpanded = false

  ngOnChanges( changes: SimpleChanges ): void {
    const selectedDateChange =
      changes['selectedDate'];

    if (
      selectedDateChange &&
      this.selectedDate
    ) {
      this.isTimeStepExpanded = true;
    }
  }

  handleTimeSlotSelected(
    timeSlot: BookingTimeSlot
  ): void {
    this.timeSlotSelected.emit(timeSlot);
    this.isTimeStepExpanded = false;
  }

  toggleTimeStep(): void {
    this.isTimeStepExpanded =
      !this.isTimeStepExpanded
  }

  get selectedDateTimeLabel(): string {
    const date =
      this.selectedDayFormatted ||
      this.selectedDate;

    const time =
      this.selectedTimeSlot?.localhour ||
      this.selectedTimeSlot?.label ||
      '';

    if (date && time) {
      return `${date} · ${time}`;
    }

    return date;
  }
}