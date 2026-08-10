import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAssessmentAssignment } from '../../../services/dtos/platform-assessment.dto';

@Component({
  selector: 'app-platform-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-assessment-card.component.html',
  styleUrls: ['./platform-assessment-card.component.scss'],
})
export class PlatformAssessmentCardComponent {
  @Input({ required: true }) assessment!: PlatformAssessmentAssignment;

  openAssessment(): void {
    if (this.assessment.status !== 'pending') return;
    const url = this.assessment.directAccessUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  get statusLabel(): string {
    switch (this.assessment.status) {
      case 'pending':
        return 'Pendiente';
      case 'expired':
        return 'Expirada';
      case 'completed':
        return this.assessment.outcome === 'PASSED'
          ? 'Aprobado'
          : this.assessment.outcome === 'FAILED'
            ? 'No aprobado'
            : 'Realizada';
    }
  }

  get actionLabel(): string {
    switch (this.assessment.status) {
      case 'pending':
        return 'Abrir assessment';
      case 'expired':
        return 'Evaluación expirada';
      case 'completed':
        return this.assessment.outcome === 'PASSED'
          ? 'Aprobado'
          : this.assessment.outcome === 'FAILED'
            ? 'No aprobado'
            : 'Completada';
    }
  }

  get canAct(): boolean {
    if (this.assessment.status === 'pending') {
      return !!this.assessment.directAccessUrl;
    }
    // Completed: no action that reveals score.
    return false;
  }

  onAction(): void {
    if (this.assessment.status === 'pending') {
      this.openAssessment();
    }
  }
}
