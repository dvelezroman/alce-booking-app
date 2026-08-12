import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-stage-promotion-info',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stage-promotion-info.component.html',
  styleUrl: './stage-promotion-info.component.scss',
})
export class StagePromotionInfoComponent {

  @Input() selectedStudent: UserDto | null = null;

  @Input() minPointsAssessment: number | null = null;


  /* =========================
     STUDENT
  ========================= */

  get studentName(): string {
    if (!this.selectedStudent) {
      return '';
    }

    const firstName =
      this.selectedStudent.firstName ?? '';

    const lastName =
      this.selectedStudent.lastName ?? '';

    return `${firstName} ${lastName}`.trim();
  }


  /* =========================
     STAGE
  ========================= */

  get currentStageNumber(): number | null {
    const stageNumber =
      this.selectedStudent
        ?.student
        ?.stage
        ?.number;

    if (stageNumber == null) {
      return null;
    }

    const parsedStageNumber = Number(stageNumber);

    return Number.isNaN(parsedStageNumber)
      ? null
      : parsedStageNumber;
  }


  get nextStageNumber(): number | null {
    if (this.currentStageNumber == null) {
      return null;
    }

    return this.currentStageNumber + 1;
  }


  /* =========================
     MESSAGE
  ========================= */

  get promotionDescription(): string {
    if (!this.selectedStudent) {
      return 'Selecciona un estudiante para consultar las condiciones de promoción de etapa.';
    }

    if (this.minPointsAssessment == null) {
      return 'Cuando el estudiante apruebe las evaluaciones requeridas, será promovido automáticamente al siguiente stage.';
    }

    return `Cuando el estudiante apruebe las evaluaciones requeridas con un puntaje mínimo de ${this.minPointsAssessment} puntos, será promovido automáticamente al siguiente stage.`;
  }

}