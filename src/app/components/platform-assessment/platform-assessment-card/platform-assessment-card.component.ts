import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  PlatformAssessmentAssignment,
} from '../../../services/dtos/platform-assessment.dto';

@Component({
  selector: 'app-platform-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './platform-assessment-card.component.html',
  styleUrls: [
    './platform-assessment-card.component.scss',
  ],
})
export class PlatformAssessmentCardComponent {
  @Input({ required: true })
  assessment!: PlatformAssessmentAssignment;

  get actionUrl(): string | null {
    if (this.assessment.status === 'pending') {
      return this.assessment.directAccessUrl?.trim() || null;
    }

    if (
      this.assessment.status === 'completed' ||
      this.assessment.status === 'focus_guard'
    ) {
      return this.assessment.resultsUrl?.trim() || null;
    }

    return null;
  }

  openUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  get statusLabel(): string {
    switch (this.assessment.status) {
      case 'pending':
        return 'Pendiente';

      case 'expired':
        return 'Expirada';

      case 'focus_guard':
        return 'Cambio de pestaña';

      case 'completed':
        return this.assessment.outcome ===
          'PASSED'
          ? 'Aprobado'
          : this.assessment.outcome ===
              'FAILED'
            ? 'No aprobado'
            : 'Realizada';
    }
  }

  get actionLabel(): string {
    switch (this.assessment.status) {
      case 'pending':
        return 'Abrir examen';

      case 'expired':
        return 'Evaluación expirada';

      case 'focus_guard':
      case 'completed':
        return 'Ver resultados';
    }
  }

  get canAct(): boolean {
    return !!this.actionUrl;
  }

  onAction(event?: Event): void {
    event?.stopPropagation();
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }

    const url = this.actionUrl;
    if (!url) {
      return;
    }

    this.openUrl(url);
  }
}