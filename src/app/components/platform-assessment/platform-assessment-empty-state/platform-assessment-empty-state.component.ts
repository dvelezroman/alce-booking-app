import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type PlatformAssessmentTab =
  | 'pending'
  | 'expired'
  | 'completed';

@Component({
  selector: 'app-platform-assessment-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './platform-assessment-empty-state.component.html',
  styleUrl:
    './platform-assessment-empty-state.component.scss',
})
export class PlatformAssessmentEmptyStateComponent {
  @Input()
  selectedTab: PlatformAssessmentTab =
    'pending';

  @Output()
  action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }

  get title(): string {
    switch (this.selectedTab) {
      case 'expired':
        return '¡Todo al día!';

      case 'completed':
        return 'Aún no tienes evaluaciones completadas';

      case 'pending':
      default:
        return '¡Excelente!';
    }
  }

  get description(): string {
    switch (this.selectedTab) {
      case 'expired':
        return 'No tienes evaluaciones vencidas en este momento.';

      case 'completed':
        return 'Cuando completes una evaluación, aparecerá aquí para que puedas consultar tu historial.';

      case 'pending':
      default:
        return 'No tienes evaluaciones pendientes en este momento. Las nuevas evaluaciones aparecerán aquí cuando estén disponibles.';
    }
  }

  get buttonLabel(): string {
    switch (this.selectedTab) {
      case 'expired':
      case 'completed':
        return 'Ver pendientes';

      case 'pending':
      default:
        return 'Actualizar evaluaciones';
    }
  }
}