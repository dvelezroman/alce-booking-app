import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingTimeSlot } from '../booking-time-list/booking-time-list.component';
import { BookingModeSelectorComponent } from '../booking-mode-selector/booking-mode-selector.component';
import { BookingSummaryComponent } from '../booking-summary/booking-summary.component';
import { Mode } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-booking-confirmation-step',
  standalone: true,
  imports: [
    CommonModule,
    BookingModeSelectorComponent,
    BookingSummaryComponent,
  ],
  templateUrl: './booking-confirmation-step.component.html',
  styleUrl: './booking-confirmation-step.component.scss',
})
export class BookingConfirmationStepComponent {
  @Input() dateLabel = '';
  @Input() selectedTimeSlot: BookingTimeSlot | null = null;
  @Input() selectedMode: Mode | null = null;
  @Input() studentName = '';
  @Input() stageName = '';
  @Input() onlineDisabled = false;
  @Input() presencialDisabled = false;
  @Input() isSubmitting = false;

  @Output() meetingModeSelected =
    new EventEmitter<Mode>();

  @Output() confirmBooking =
    new EventEmitter<void>();

  @Output() clearSelection =
    new EventEmitter<void>();

  get timeLabel(): string {
    return (
      this.selectedTimeSlot?.localhour ||
      this.selectedTimeSlot?.label ||
      ''
    );
  }

  get canConfirm(): boolean {
    return (
      !!this.dateLabel &&
      !!this.selectedTimeSlot &&
      !!this.selectedMode &&
      !this.isSubmitting
    );
  }

  handleModeSelected(mode: Mode): void {
    this.meetingModeSelected.emit(mode);
  }

  handleConfirm(): void {
    if (!this.canConfirm) {
      return;
    }

    this.confirmBooking.emit();
  }

  handleClearSelection(): void {
    if (this.isSubmitting) {
      return;
    }

    this.clearSelection.emit();
  }
}