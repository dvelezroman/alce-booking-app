import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  Stage,
} from '../../../services/dtos/student.dto';


@Component({
  selector: 'app-report-progress-info',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-progress-info.component.html',
  styleUrl: './report-progress-info.component.scss',
})
export class ReportProgressInfoComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() currentStage: Stage | null = null;

  @Input() studentCurrentStageProgress: number = 0;


  /* =========================
     STAGE
  ========================= */

  get stageNumber(): string {
    return (
      this.currentStage?.number ??
      ''
    );
  }


  get stageDescription(): string {
    return (
      this.currentStage
        ?.description
        ?.trim() ??
      ''
    );
  }


  get stageLabel(): string {

    if (!this.currentStage) {
      return 'el stage seleccionado';
    }

    const normalizedNumber =
      this.normalizeStageNumber(
        this.stageNumber,
      );

    if (normalizedNumber) {
      return `Stage ${normalizedNumber}`;
    }

    if (this.stageDescription) {
      return this.stageDescription;
    }

    return 'el stage seleccionado';
  }


  /* =========================
     PROGRESS
  ========================= */

  get progressValue(): number {

    const value =
      Number(
        this.studentCurrentStageProgress ??
        0,
      );

    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        value,
      ),
    );
  }


  get formattedProgress(): string {
    return `${Math.round(this.progressValue)}%`;
  }


  /* =========================
     MESSAGE
  ========================= */

  get infoMessage(): string {

    if (!this.currentStage) {
      return 'El progreso corresponde al avance del estudiante en el stage seleccionado según las actividades registradas.';
    }

    return (
      `El progreso corresponde al avance del estudiante en ${this.stageLabel} ` +
      'según las actividades registradas para ese stage.'
    );
  }


  /* =========================
     HELPERS
  ========================= */

  private normalizeStageNumber(
    value: string,
  ): string {

    if (!value) {
      return '';
    }

    return value
      .replace(/[^0-9.]/g, '')
      .trim();
  }

}