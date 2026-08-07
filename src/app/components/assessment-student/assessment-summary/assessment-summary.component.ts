import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type AssessmentSummaryType =
  | 'active'
  | 'expired'
  | 'completed';

export interface AssessmentSummaryItem {
  type: AssessmentSummaryType;
  count: number;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-assessment-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-summary.component.html',
  styleUrls: ['./assessment-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentSummaryComponent {

  @Input()
  activeCount = 0;

  @Input()
  expiredCount = 0;

  @Input()
  completedCount = 0;

  get summaryItems(): AssessmentSummaryItem[] {
    return [
      {
        type: 'active',
        count: this.activeCount,
        title: 'Activas',
        description: 'Pendientes por completar',
        icon: 'fa-solid fa-circle-check',
      },
      {
        type: 'expired',
        count: this.expiredCount,
        title: 'Vencidas',
        description: 'Fecha límite expirada',
        icon: 'fa-regular fa-clock',
      },
      {
        type: 'completed',
        count: this.completedCount,
        title: 'Completadas',
        description: 'Evaluaciones finalizadas',
        icon: 'fa-solid fa-check',
      },
    ];
  }

  trackBySummaryType(
    _index: number,
    item: AssessmentSummaryItem,
  ): AssessmentSummaryType {
    return item.type;
  }
}