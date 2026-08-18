import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  StageAssessmentResource
} from '../../../services/dtos/stage-resources.dto';


@Component({
  selector: 'app-stage-resource-detail-modal',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './stage-resource-detail-modal.component.html',
  styleUrl: './stage-resource-detail-modal.component.scss'
})
export class StageResourceDetailModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() show = false;

  @Input() resource: StageAssessmentResource | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() close =
    new EventEmitter<void>();


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {
    this.close.emit();
  }


  onBackdropClick(): void {
    this.onClose();
  }


  stopPropagation(
    event: MouseEvent
  ): void {
    event.stopPropagation();
  }


  /* =========================
     HELPERS
  ========================= */

  get stageLabel(): string {

    if (!this.resource) {
      return '-';
    }

    const value =
      this.resource as StageAssessmentResource & {
        stage?: {
          number?: number;
          stageNumber?: number;
        };
      };

    const stageNumber =
      value.stage?.number ??
      value.stage?.stageNumber ??
      this.resource.stageId;

    return `Stage ${stageNumber}`;
  }


  get statusLabel(): string {

    if (!this.resource) {
      return '-';
    }

    return this.resource.active
      ? 'Activo'
      : 'Inactivo';
  }


  getCreatedAt(): string | Date | null {

    if (!this.resource) {
      return null;
    }

    const value =
      this.resource as StageAssessmentResource & {
        createdAt?: string | Date;
        created?: string | Date;
      };

    return (
      value.createdAt ??
      value.created ??
      null
    );
  }


  getUpdatedAt(): string | Date | null {

    if (!this.resource) {
      return null;
    }

    const value =
      this.resource as StageAssessmentResource & {
        updatedAt?: string | Date;
        updated?: string | Date;
      };

    return (
      value.updatedAt ??
      value.updated ??
      null
    );
  }


  formatDateTime(
    value: string | Date | null
  ): string {

    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '-';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    ).format(date);
  }

}