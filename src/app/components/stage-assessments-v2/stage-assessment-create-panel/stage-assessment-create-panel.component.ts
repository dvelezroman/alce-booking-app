import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  StageAssessmentResource,
} from '../../../services/dtos/stage-resources.dto';

import {
  CreateStageAssessmentDto,
} from '../../../services/dtos/stage-assessment.dto';


@Component({
  selector: 'app-stage-assessment-create-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './stage-assessment-create-panel.component.html',
  styleUrl: './stage-assessment-create-panel.component.scss',
})
export class StageAssessmentCreatePanelComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  stageId?: number;

  @Input()
  stage: Stage | null = null;

  @Input()
  studentIds: number[] = [];

  @Input()
  resources: StageAssessmentResource[] = [];


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  closeRequested =
    new EventEmitter<void>();

  @Output()
  cancelRequested =
    new EventEmitter<void>();

  @Output()
  createRequested =
    new EventEmitter<CreateStageAssessmentDto>();


  /* =========================
     FORM
  ========================= */

  stageAssessmentResourceId: number | null = null;

  dueDate = '';


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {
    this.closeRequested.emit();
  }


  /* =========================
     CANCEL
  ========================= */

  onCancel(): void {
    this.cancelRequested.emit();
  }


  /* =========================
     CREATE
  ========================= */

  onCreate(): void {
    if (!this.isFormValid) {
      return;
    }

    const payload: CreateStageAssessmentDto = {
      stageId:
        this.stageId!,

      studentIds: [
        ...this.studentIds,
      ],

      stageAssessmentResourceId:
        this.stageAssessmentResourceId!,

      dueDate:
        this.dueDate,
    };

    this.createRequested.emit(
      payload,
    );
  }


  /* =========================
     VALIDATION
  ========================= */

  get isFormValid(): boolean {
    return (
      !!this.stageId &&
      this.studentIds.length > 0 &&
      !!this.stageAssessmentResourceId &&
      !!this.dueDate
    );
  }


  /* =========================
     STUDENTS
  ========================= */

  get selectedStudentsLabel(): string {
    const total =
      this.studentIds.length;

    if (total === 1) {
      return '1 estudiante';
    }

    return `${total} estudiantes`;
  }


  /* =========================
     STAGE
  ========================= */

  get stageLabel(): string {
    if (!this.stage) {
      return this.stageId
        ? `Stage ${this.stageId}`
        : 'Sin etapa';
    }

    const stage =
      this.stage as any;

    const number =
      stage.stageNumber ??
      stage.number ??
      stage.id ??
      this.stageId ??
      '';

    const description =
      stage.description ??
      stage.name ??
      '';

    if (
      number &&
      description
    ) {
      return `Stage ${number} - ${description}`;
    }

    if (description) {
      return description;
    }

    return `Stage ${number}`;
  }


  /* =========================
     RESOURCE HELPERS
  ========================= */

  getResourceId(
    resource: StageAssessmentResource,
  ): number {
    const data =
      resource as any;

    return Number(
      data.id ??
      data.resourceId ??
      data.stageAssessmentResourceId ??
      0,
    );
  }


  getResourceLabel(
    resource: StageAssessmentResource,
  ): string {
    const data =
      resource as any;

    return (
      data.name ??
      data.title ??
      data.resource?.name ??
      data.resource?.title ??
      data.description ??
      `Recurso ${this.getResourceId(resource)}`
    );
  }


  /* =========================
     RESOURCE SELECTED
  ========================= */

  get selectedResource(): StageAssessmentResource | null {
    if (!this.stageAssessmentResourceId) {
      return null;
    }

    return (
      this.resources.find(
        resource =>
          this.getResourceId(resource) ===
          this.stageAssessmentResourceId,
      ) ||
      null
    );
  }


  /* =========================
     DATE
  ========================= */

  get minDate(): string {
    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        today.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  }


  /* =========================
     RESET FORM
  ========================= */

  resetForm(): void {
    this.stageAssessmentResourceId = null;
    this.dueDate = '';
  }
}