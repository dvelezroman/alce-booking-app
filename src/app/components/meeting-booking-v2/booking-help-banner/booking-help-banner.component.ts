import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-booking-help-banner',
  standalone: true,
  templateUrl: './booking-help-banner.component.html',
  styleUrl: './booking-help-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingHelpBannerComponent {
  @Output() cancellationPolicies =
    new EventEmitter<void>();

  openCancellationPolicies(): void {
    this.cancellationPolicies.emit();
  }
}