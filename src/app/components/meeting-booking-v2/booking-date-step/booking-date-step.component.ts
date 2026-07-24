import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';

import { BookingCalendarComponent } from '../booking-calendar/booking-calendar.component';
import { DisabledDatesAndHours } from '../../../services/dtos/handle-date.dto';

export interface BookingSelectedDay {
  date: string;
  label: string;
  day: number;
}

export interface BookingMonthChange {
  year: number;
  month: number;
}

@Component({
  selector: 'app-booking-date-step',
  standalone: true,
  imports: [
    CommonModule,
    BookingCalendarComponent,
  ],
  templateUrl: './booking-date-step.component.html',
  styleUrl: './booking-date-step.component.scss',
})
export class BookingDateStepComponent {
  @Input() isScheduleEnabled = true;
  @Input() disabledDates: Record<string, any[]> = {};
  @Input() disabledDatesAndHours: DisabledDatesAndHours = {};
  @Input() resetSelectionTrigger = false;
  @Input() userCity: string | null = null;
  @Input() userMode: string | null = null;
  @Input() userClassification: string | null = null;
  @Input() selectedDate = '';
  @Input() selectedDayFormatted = '';
  @Input() isLoading = false;

  @Output() daySelected =
    new EventEmitter<BookingSelectedDay>();

  @Output() monthChanged =
    new EventEmitter<BookingMonthChange>();

  readonly ecuadorDate = DateTime
    .now()
    .setZone('America/Guayaquil')
    .setLocale('es')
    .toFormat("EEEE, dd 'de' LLLL");

  handleDaySelected(
    event: BookingSelectedDay
  ): void {
    this.daySelected.emit(event);
  }

  handleMonthChanged(
    event: BookingMonthChange
  ): void {
    this.monthChanged.emit(event);
  }
}