import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  RemotePlatformAssessmentFilters,
} from '../../../services/dtos/platform-assessment.dto';


@Component({
  selector: 'app-platform-assessment-list-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './platform-assessment-list-filters.component.html',
  styleUrl: './platform-assessment-list-filters.component.scss',
})
export class PlatformAssessmentListFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  draft: RemotePlatformAssessmentFilters = {};

  @Input()
  showFilters = true;

  @Input()
  statusOptions: string[] = [];

  @Input()
  outcomeOptions: Array<
    '' | 'PASSED' | 'FAILED' | 'NONE'
  > = [];


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  draftChange =
    new EventEmitter<RemotePlatformAssessmentFilters>();

  @Output()
  toggleRequested =
    new EventEmitter<void>();

  @Output()
  applyRequested =
    new EventEmitter<void>();

  @Output()
  clearRequested =
    new EventEmitter<void>();


  /* =========================
     DRAFT CHANGE
  ========================= */

  onDraftChange(): void {
    this.draftChange.emit({
      ...this.draft,
    });
  }


  /* =========================
     TOGGLE
  ========================= */

  onToggle(): void {
    this.toggleRequested.emit();
  }


  /* =========================
     APPLY
  ========================= */

  onApply(): void {
    this.draftChange.emit({
      ...this.draft,
    });

    this.applyRequested.emit();
  }


  /* =========================
     CLEAR
  ========================= */

  onClear(): void {
    this.clearRequested.emit();
  }


  /* =========================
     STATUS LABEL
  ========================= */

  getStatusLabel(
    status: string,
  ): string {
    switch (status) {
      case 'CREATED':
        return 'Creada';

      case 'ACTIVE':
        return 'Activa';

      case 'COMPLETED':
        return 'Completada';

      case 'REVOKED':
        return 'Revocada';

      case 'EXPIRED':
        return 'Expirada';

      default:
        return 'Todos los estados';
    }
  }


  /* =========================
     OUTCOME LABEL
  ========================= */

  getOutcomeLabel(
    outcome:
      '' | 'PASSED' | 'FAILED' | 'NONE',
  ): string {
    switch (outcome) {
      case 'PASSED':
        return 'Aprobado';

      case 'FAILED':
        return 'Reprobado';

      case 'NONE':
        return 'Sin resultado';

      default:
        return 'Todos los resultados';
    }
  }


  /* =========================
     STAGES
  ========================= */

  get stages(): number[] {
    return Array.from(
      {
        length: 15,
      },
      (_, index) =>
        index + 1,
    );
  }
}