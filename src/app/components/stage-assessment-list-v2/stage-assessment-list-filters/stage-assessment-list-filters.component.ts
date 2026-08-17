import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  StageAssessment,
  StageAssessmentFilters,
} from '../../../services/dtos/stage-assessment.dto';


@Component({
  selector: 'app-stage-assessment-list-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './stage-assessment-list-filters.component.html',
  styleUrl: './stage-assessment-list-filters.component.scss',
})
export class StageAssessmentListFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() filters: StageAssessmentFilters = {};
  @Input() showFilters = false;
  @Input() assessments: StageAssessment[] = [];


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  filtersChanged =
    new EventEmitter<StageAssessmentFilters>();

  @Output()
  toggleRequested =
    new EventEmitter<void>();


  /* =========================
     LOCAL FILTERS
  ========================= */

  selectedStageId: number | null = null;
  selectedResourceId: number | null = null;
  selectedCreatorId: number | null = null;
  selectedStudentId: number | null = null;


  /* =========================
     OPTIONS
  ========================= */

  get stages() {
    const map =
      new Map<number, any>();

    this.assessments.forEach(
      assessment => {
        if (
          assessment.stageId &&
          assessment.stage
        ) {
          map.set(
            assessment.stageId,
            assessment.stage,
          );
        }
      },
    );

    return Array.from(
      map.values(),
    );
  }


  get resources() {
    const map =
      new Map<number, any>();

    this.assessments.forEach(
      assessment => {
        const resource =
          assessment.stageAssessmentResource;

        if (
          assessment.stageAssessmentResourceId &&
          resource
        ) {
          map.set(
            assessment.stageAssessmentResourceId,
            resource,
          );
        }
      },
    );

    return Array.from(
      map.entries(),
    ).map(
      ([id, resource]) => ({
        id,
        resource,
      }),
    );
  }


  get creators() {
    const map =
      new Map<number, any>();

    this.assessments.forEach(
      assessment => {
        if (
          assessment.createdBy &&
          assessment.creator
        ) {
          map.set(
            assessment.createdBy,
            assessment.creator,
          );
        }
      },
    );

    return Array.from(
      map.values(),
    );
  }


  get students() {
    const map =
      new Map<number, any>();

    this.assessments.forEach(
      assessment => {
        assessment.students?.forEach(
          student => {
            map.set(
              student.studentId,
              student,
            );
          },
        );
      },
    );

    return Array.from(
      map.values(),
    );
  }


  /* =========================
     APPLY
  ========================= */

  applyFilters(): void {
    const filters: StageAssessmentFilters = {};

    if (this.selectedStageId) {
      filters.stageId =
        this.selectedStageId;
    }

    if (this.selectedResourceId) {
      filters.stageAssessmentResourceId =
        this.selectedResourceId;
    }

    if (this.selectedCreatorId) {
      filters.createdBy =
        this.selectedCreatorId;
    }

    if (this.selectedStudentId) {
      filters.studentId =
        this.selectedStudentId;
    }

    this.filtersChanged.emit(
      filters,
    );
  }


  /* =========================
     CLEAR
  ========================= */

  clearFilters(): void {
    this.selectedStageId = null;
    this.selectedResourceId = null;
    this.selectedCreatorId = null;
    this.selectedStudentId = null;

    this.filtersChanged.emit({});
  }


  /* =========================
     TOGGLE
  ========================= */

  toggleFilters(): void {
    this.toggleRequested.emit();
  }


  /* =========================
     LABELS
  ========================= */

  getStageLabel(
    stage: any,
  ): string {
    return (
      stage.description ||
      stage.number ||
      `Stage ${stage.id}`
    );
  }


  getResourceLabel(
    resource: any,
  ): string {
    return (
      resource?.description ||
      resource?.name ||
      resource?.title ||
      'Recurso'
    );
  }


  getCreatorLabel(
    creator: any,
  ): string {
    const name =
      `${creator.firstName || ''} ${creator.lastName || ''}`
        .trim();

    return (
      name ||
      creator.email ||
      'Usuario'
    );
  }


  getStudentLabel(
    student: any,
  ): string {
    const name =
      `${student.firstName || ''} ${student.lastName || ''}`
        .trim();

    return (
      name ||
      student.email ||
      `Estudiante ${student.studentId}`
    );
  }
}