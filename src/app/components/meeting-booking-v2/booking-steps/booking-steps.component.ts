import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core'

@Component({
  selector: 'app-booking-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-steps.component.html',
  styleUrl: './booking-steps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingStepsComponent {
  @Input()
  currentStep = 1

  @Input()
  selectedDate: Date | string | null = null

  get selectedDateLabel(): string {
    if (!this.selectedDate) {
      return 'Selecciona primero una fecha'
    }

    const date =
      this.selectedDate instanceof Date
        ? this.selectedDate
        : new Date(this.selectedDate)

    if (Number.isNaN(date.getTime())) {
      return 'Selecciona primero una fecha'
    }

    return `Horarios disponibles para el ${new Intl.DateTimeFormat(
      'es-EC',
      {
        day: 'numeric',
        month: 'long',
      }
    ).format(date)}`
  }

  isStepActive(step: number): boolean {
    return this.currentStep === step
  }

  isStepCompleted(step: number): boolean {
    return this.currentStep > step
  }
}