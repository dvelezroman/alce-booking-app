import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';
import { AssessmentCardComponent } from '../assessment-card/assessment-card.component';

export type AssessmentSectionType =
  | 'active'
  | 'expired'
  | 'completed';

@Component({
  selector: 'app-assessment-section',
  standalone: true,
  imports: [
    CommonModule,
    AssessmentCardComponent,
  ],
  templateUrl: './assessment-section.component.html',
  styleUrls: ['./assessment-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentSectionComponent {

  /*
   * Inputs recibidos desde el componente padre.
   */

  @Input()
  sectionType: AssessmentSectionType = 'active';

  @Input()
  title = '';

  @Input()
  description = '';

  @Input()
  count = 0;

  @Input()
  assessments: StageAssessment[] = [];

  @Input()
  highlightId: number | null = null;

  /*
   * Eventos enviados nuevamente al componente padre.
   */

  @Output()
  openAssessment = new EventEmitter<StageAssessment>();

  @Output()
  viewAssessment = new EventEmitter<StageAssessment>();

  @Output()
  clearHighlight = new EventEmitter<void>();

  /*
   * Estados visuales de la sección.
   */

  get isActiveSection(): boolean {
    return this.sectionType === 'active';
  }

  get isExpiredSection(): boolean {
    return this.sectionType === 'expired';
  }

  get isCompletedSection(): boolean {
    return this.sectionType === 'completed';
  }

  /*
   * Clases de Font Awesome para el encabezado.
   */

  get sectionIcon(): string {
    switch (this.sectionType) {
      case 'expired':
        return 'fa-regular fa-clock';

      case 'completed':
        return 'fa-solid fa-check';

      case 'active':
      default:
        return 'fa-solid fa-person-running';
    }
  }

  /*
   * Recibe el evento desde assessment-card
   * y lo reenvía al componente padre.
   */

  onOpenAssessment(
    assessment: StageAssessment,
  ): void {
    if (!this.isActiveSection) {
      return;
    }

    this.openAssessment.emit(assessment);
  }

  onViewAssessment(
    assessment: StageAssessment,
  ): void {
    if (!this.isCompletedSection) {
      return;
    }

    this.viewAssessment.emit(assessment);
  }

  onClearHighlight(): void {
    this.clearHighlight.emit();
  }

  /*
   * Comprueba cuál tarjeta debe resaltarse
   * cuando llega el parámetro highlight.
   */

  isHighlighted(
    assessment: StageAssessment,
  ): boolean {
    return (
      this.highlightId !== null &&
      this.highlightId === assessment.id
    );
  }

  /*
   * TrackBy para evitar renderizados innecesarios.
   */

  trackByAssessmentId(
    _index: number,
    assessment: StageAssessment,
  ): number {
    return assessment.id;
  }
}