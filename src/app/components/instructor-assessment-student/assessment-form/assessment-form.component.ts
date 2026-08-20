import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AssessmentType,
  CreateAssessmentI,
} from '../../../services/dtos/assessment.dto';

import { UserDto } from '../../../services/dtos/user.dto';

interface AssessmentFormResource {
  id: number;
  name: string;
  content: string;
}

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-form.component.html',
  styleUrl: './assessment-form.component.scss',
})
export class AssessmentFormComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() selectedStudent: UserDto | null = null;
  @Input() currentStageId: number | null = null;
  @Input() instructorId: number | null = null;
  @Input() minPointsAssessment: number | null = null;
  @Input() blockedTypes: AssessmentType[] = [];
  @Input() resources: AssessmentFormResource[] = [];

  /* =========================
     OUTPUT
  ========================= */

  @Output() assessmentCreated =
    new EventEmitter<CreateAssessmentI>();

  /* =========================
     FORM
  ========================= */

  selectedType: AssessmentType | null = null;
  points: number | null = null;
  notes: string = '';
  selectedResourceIds: number[] = [];

  /* =========================
     UI
  ========================= */

  showTypeDropdown: boolean = false;
  showResourcesDropdown: boolean = false;

  /* =========================
     TYPES
  ========================= */

  assessmentTypes: AssessmentType[] =
    Object.values(AssessmentType);

  get availableAssessmentTypes(): AssessmentType[] {
    return this.assessmentTypes.filter(
      type => !this.blockedTypes.includes(type)
    );
  }

  get selectedTypeLabel(): string {
    if (!this.selectedType) {
      return 'Selecciona el tipo';
    }

    return this.getTypeLabel(
      this.selectedType
    );
  }

  getTypeLabel(
    type: AssessmentType,
  ): string {
    const normalized =
      String(type)
        .trim()
        .toLowerCase();

    switch (normalized) {
      case 'speaking':
        return 'Speaking';

      case 'grammar':
        return 'Grammar';

      default:
        return this.formatLabel(
          String(type)
        );
    }
  }

  isTypeBlocked(
    type: AssessmentType,
  ): boolean {
    return this.blockedTypes.includes(
      type
    );
  }

  selectAssessmentType(
    type: AssessmentType,
  ): void {
    if (this.isTypeBlocked(type)) {
      return;
    }

    this.selectedType = type;
    this.showTypeDropdown = false;
  }

  toggleTypeDropdown(): void {
    if (!this.selectedStudent) {
      return;
    }

    this.showTypeDropdown =
      !this.showTypeDropdown;

    this.showResourcesDropdown = false;
  }

  /* =========================
     POINTS
  ========================= */

  decreasePoints(): void {
    const current =
      this.points ?? 0;

    this.points =
      Math.max(
        0,
        current - 1
      );
  }

  increasePoints(): void {
    const current =
      this.points ?? 0;

    this.points =
      Math.min(
        100,
        current + 1
      );
  }

  onPointsChange(
    value: number | null,
  ): void {
    if (value == null) {
      this.points = null;
      return;
    }

    this.points =
      Math.min(
        100,
        Math.max(
          0,
          Number(value)
        )
      );
  }

  get pointsValue(): number {
    return this.points ?? 0;
  }

  get isPassingScore(): boolean {
    if (
      this.points == null ||
      this.minPointsAssessment == null
    ) {
      return false;
    }

    return (
      this.points >=
      this.minPointsAssessment
    );
  }

  get requiresReinforcement(): boolean {
    if (
      this.points == null ||
      this.minPointsAssessment == null
    ) {
      return false;
    }

    return (
      this.points <
      this.minPointsAssessment
    );
  }

  get hasRequiredNotes(): boolean {
    return this.notes.trim().length > 0;
  }

  get hasRequiredResources(): boolean {
    return this.selectedResourceIds.length > 0;
  }

  /* =========================
     RESOURCES
  ========================= */

  toggleResourcesDropdown(): void {
    if (!this.selectedStudent) {
      return;
    }

    this.showResourcesDropdown =
      !this.showResourcesDropdown;

    this.showTypeDropdown = false;
  }

  toggleResource(
    resourceId: number,
  ): void {
    const exists =
      this.selectedResourceIds.includes(
        resourceId
      );

    if (exists) {
      this.selectedResourceIds =
        this.selectedResourceIds.filter(
          id => id !== resourceId
        );

      return;
    }

    this.selectedResourceIds = [
      ...this.selectedResourceIds,
      resourceId,
    ];
  }

  isResourceSelected(
    resourceId: number,
  ): boolean {
    return this.selectedResourceIds.includes(
      resourceId
    );
  }

  get selectedResourcesLabel(): string {
    if (
      this.selectedResourceIds.length === 0
    ) {
      return 'Selecciona uno o más recursos';
    }

    if (
      this.selectedResourceIds.length === 1
    ) {
      const selectedResource =
        this.resources.find(
          resource =>
            resource.id ===
            this.selectedResourceIds[0]
        );

      return (
        selectedResource?.name ??
        '1 recurso seleccionado'
      );
    }

    return (
      `${this.selectedResourceIds.length} recursos seleccionados`
    );
  }

  /* =========================
     STUDENT
  ========================= */

  get studentId(): number | null {
    return (
      this.selectedStudent
        ?.student
        ?.id ??
      null
    );
  }

  /* =========================
     VALIDATION
  ========================= */

  get canSubmit(): boolean {
    const assessmentTypeId =
      this.selectedType
        ? this.getAssessmentTypeId(
            this.selectedType,
          )
        : null;

    const baseValid =
      !!(
        this.studentId &&
        this.currentStageId &&
        this.instructorId &&
        this.selectedType &&
        assessmentTypeId &&
        this.points != null
      );

    if (!baseValid) {
      return false;
    }

    if (this.requiresReinforcement) {
      return (
        this.hasRequiredNotes &&
        this.hasRequiredResources
      );
    }

    return true;
  }

  get validationMessage(): string | null {
    if (!this.selectedStudent) {
      return 'Selecciona un estudiante.';
    }

    if (!this.currentStageId) {
      return 'No se pudo identificar la etapa actual.';
    }

    if (!this.instructorId) {
      return 'No se pudo identificar al instructor.';
    }

    if (!this.selectedType) {
      return 'Selecciona un tipo de evaluación.';
    }

    if (this.points == null) {
      return 'Ingresa el puntaje obtenido.';
    }

    if (
      this.requiresReinforcement &&
      !this.hasRequiredNotes
    ) {
      return 'Agrega una nota de refuerzo para el estudiante.';
    }

    if (
      this.requiresReinforcement &&
      !this.hasRequiredResources
    ) {
      return 'Selecciona al menos un recurso de refuerzo.';
    }

    return null;
  }

  /* =========================
     SUBMIT
  ========================= */

  submitAssessment(): void {
    if (!this.canSubmit) {
      return;
    }

    const assessmentTypeId =
      this.getAssessmentTypeId(
        this.selectedType!,
      );

    if (!assessmentTypeId) {
      return;
    }

    const payload: CreateAssessmentI = {
      type: this.selectedType!,
      points: this.points!,
      studentId: this.studentId!,
      stageId: this.currentStageId!,
      instructorId: this.instructorId!,
      assessmentTypeId,
      assessmentResourceIds: [
        ...this.selectedResourceIds,
      ],
      ...(this.notes.trim()
        ? {
            note: this.notes.trim(),
          }
        : {}),
    };

    console.log(
      'Payload evaluación:',
      payload,
    );

    this.assessmentCreated.emit(
      payload,
    );

    this.resetForm();
  }

  /* =========================
     RESET
  ========================= */

  resetForm(): void {
    this.selectedType = null;
    this.points = null;
    this.notes = '';
    this.selectedResourceIds = [];
    this.showTypeDropdown = false;
    this.showResourcesDropdown = false;
  }

  /* =========================
     TRACK BY
  ========================= */

  trackByAssessmentType(
    index: number,
    type: AssessmentType,
  ): string {
    return String(type);
  }

  trackByResourceId(
    index: number,
    resource: AssessmentFormResource,
  ): number {
    return resource.id;
  }

  /* =========================
     HELPERS
  ========================= */

  private formatLabel(
    value: string,
  ): string {
    if (!value) {
      return '';
    }

    const formatted =
      value
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .toLowerCase();

    return (
      formatted.charAt(0).toUpperCase() +
      formatted.slice(1)
    );
  }

  /* =========================
     ASSESSMENT TYPE ID
  ========================= */

  getAssessmentTypeId(
    type: AssessmentType,
  ): number | null {
    const normalized =
      String(type)
        .trim()
        .toLowerCase();

    switch (normalized) {
      case 'speaking':
        return 1;

      case 'grammar':
        return 2;

      default:
        return null;
    }
  }
}