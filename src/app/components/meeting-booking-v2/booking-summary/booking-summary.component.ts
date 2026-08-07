import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { Mode } from '../../../services/dtos/student.dto';


@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-summary.component.html',
  styleUrl: './booking-summary.component.scss',
})
export class BookingSummaryComponent {
  @Input() dateLabel = '';
  @Input() timeLabel = '';
  @Input() selectedMode: Mode | null = null;
  @Input() studentName = '';
  @Input() stageName = '';
  @Input() isLoading = false;

  get modeLabel(): string {
    if (this.selectedMode === Mode.ONLINE) {
      return 'Online';
    }

    if (this.selectedMode === Mode.PRESENCIAL) {
      return 'Presencial';
    }

    return 'Por seleccionar';
  }

  get displayedDate(): string {
    return this.dateLabel || 'Por seleccionar';
  }

  get displayedTime(): string {
    return this.timeLabel || 'Por seleccionar';
  }

  get displayedStudentName(): string {
    return this.studentName || 'No disponible';
  }

  get displayedStageName(): string {
    return this.stageName || 'No asignado';
  }
}