import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  AssessmentTypeI
} from '../../../services/dtos/assessment-type.dto';

@Component({
  selector: 'app-assessment-type-detail-modal',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './assessment-type-detail-modal.component.html',
  styleUrl: './assessment-type-detail-modal.component.scss'
})
export class AssessmentTypeDetailModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() show = false;

  @Input() assessmentType: AssessmentTypeI | null = null;


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

  get description(): string {

    return (
      this.assessmentType?.description?.trim() ||
      'Sin descripción registrada'
    );
  }


  get isActive(): boolean {

    if (!this.assessmentType) {
      return false;
    }

    const value =
      this.assessmentType as AssessmentTypeI & {
        active?: boolean;
      };

    return value.active !== false;
  }


  get statusLabel(): string {

    return this.isActive
      ? 'Activo'
      : 'Inactivo';
  }


  getCreatedAt(): string | Date | null {

    if (!this.assessmentType) {
      return null;
    }

    const value =
      this.assessmentType as AssessmentTypeI & {
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

    if (!this.assessmentType) {
      return null;
    }

    const value =
      this.assessmentType as AssessmentTypeI & {
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

    const date =
      new Date(value);

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