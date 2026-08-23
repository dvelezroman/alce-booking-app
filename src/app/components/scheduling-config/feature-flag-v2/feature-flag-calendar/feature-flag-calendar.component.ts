import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  SelectedDay,
} from '../../../../services/dtos/handle-date.dto';


@Component({
  selector: 'app-feature-flag-calendar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './feature-flag-calendar.component.html',
  styleUrl: './feature-flag-calendar.component.scss',
})
export class FeatureFlagCalendarComponent {

  @Input()
  selectedMonth = '';

  @Input()
  selectedYear = 0;

  @Input()
  currentMonthDays: any[] = [];

  @Input()
  selectedDays: SelectedDay[] = [];

  @Input()
  canGoBack = false;

  @Input()
  canGoForward = false;

  @Output()
  previousRequested =
    new EventEmitter<void>();

  @Output()
  nextRequested =
    new EventEmitter<void>();

  @Output()
  daySelected =
    new EventEmitter<SelectedDay>();


  isDaySelected(
    day: any,
  ): boolean {

    return this.selectedDays
      .some(
        selected =>
          selected.day === day.day,
      );
  }


  onSelectDay(
    day: SelectedDay,
  ): void {

    this.daySelected.emit(
      day,
    );
  }
}