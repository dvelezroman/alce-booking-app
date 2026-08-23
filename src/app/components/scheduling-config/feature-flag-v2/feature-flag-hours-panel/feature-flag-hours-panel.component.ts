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
  selector: 'app-feature-flag-hours-panel',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './feature-flag-hours-panel.component.html',
  styleUrl: './feature-flag-hours-panel.component.scss',
})
export class FeatureFlagHoursPanelComponent {

  @Input()
  timeSlots: {
    label: string;
    value: number;
    isDisabled?: boolean;
  }[] = [];

  @Input()
  selectedDays:
    SelectedDay[] = [];

  @Input()
  isDaySelectedForHours = false;

  @Input()
  hasSelectedEnabledHours = false;

  @Output()
  hourSelected =
    new EventEmitter<{
      hour: number;
      disabled: boolean;
    }>();

  @Output()
  disableHoursRequested =
    new EventEmitter<void>();


  isSelected(
    hour: number,
  ): boolean {

    return (
      this.selectedDays?.[0]
        ?.hours
        ?.includes(hour) ??
      false
    );
  }


  onHourSelected(
    hour: number,
    disabled: boolean,
  ): void {

    if (
      !this.isDaySelectedForHours ||
      disabled
    ) {
      return;
    }

    this.hourSelected.emit({
      hour,
      disabled,
    });
  }


  onDisableHours(): void {

    this.disableHoursRequested.emit();
  }
}