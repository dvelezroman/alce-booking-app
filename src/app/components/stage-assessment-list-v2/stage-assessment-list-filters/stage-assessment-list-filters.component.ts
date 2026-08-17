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

import {
  UserDto,
} from '../../../services/dtos/user.dto';


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

  @Input() searchTerm = '';
  @Input() filteredUsers: UserDto[] = [];
  @Input() showUserDropdown = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() filtersChanged =
    new EventEmitter<StageAssessmentFilters>();

  @Output() toggleRequested =
    new EventEmitter<void>();

  @Output() userInputChange =
    new EventEmitter<string>();

  @Output() userSelected =
    new EventEmitter<UserDto>();

  @Output() dropdownBlurred =
    new EventEmitter<void>();

  @Output() clearUserSearchRequested =
  new EventEmitter<void>();


  /* =========================
     LOCAL FILTERS
  ========================= */

  selectedStageId: number | null = null;
  selectedResourceId: number | null = null;
  selectedCreatorId: number | null = null;


  /* =========================
     OPTIONS
  ========================= */

  get stages() {
    const map = new Map<number, any>();

    this.assessments.forEach(assessment => {
      if (
        assessment.stageId &&
        assessment.stage
      ) {
        map.set(
          assessment.stageId,
          assessment.stage,
        );
      }
    });

    return Array.from(
      map.values(),
    );
  }


  get resources() {
    const map = new Map<number, any>();

    this.assessments.forEach(assessment => {
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
    });

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
    const map = new Map<number, any>();

    this.assessments.forEach(assessment => {
      if (
        assessment.createdBy &&
        assessment.creator
      ) {
        map.set(
          assessment.createdBy,
          assessment.creator,
        );
      }
    });

    return Array.from(
      map.values(),
    );
  }


  /* =========================
     USER SEARCH
  ========================= */

  onUserInput(
    value: string,
  ): void {
    this.userInputChange.emit(
      value || '',
    );
  }


  onSelectUser(
    user: UserDto,
  ): void {
    this.userSelected.emit(user);
  }


  onUserBlur(): void {
    this.dropdownBlurred.emit();
  }


  /* =========================
     APPLY
  ========================= */

  applyFilters(): void {
    const filters: StageAssessmentFilters = {
      ...(this.selectedStageId
        ? {
            stageId:
              this.selectedStageId,
          }
        : {}),

      ...(this.selectedResourceId
        ? {
            stageAssessmentResourceId:
              this.selectedResourceId,
          }
        : {}),

      ...(this.selectedCreatorId
        ? {
            createdBy:
              this.selectedCreatorId,
          }
        : {}),

      ...(this.filters.studentId
        ? {
            studentId:
              this.filters.studentId,
          }
        : {}),
    };

    this.filtersChanged.emit(filters);
  }


  /* =========================
     CLEAR
  ========================= */

  clearFilters(): void {
    this.selectedStageId = null;
    this.selectedResourceId = null;
    this.selectedCreatorId = null;

    this.clearUserSearchRequested.emit();
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


  /* =========================
     USER HELPERS
  ========================= */

  getUserName(
    user: UserDto,
  ): string {
    const name =
      `${user.firstName || ''} ${user.lastName || ''}`
        .trim();

    return (
      name ||
      user.email ||
      'Estudiante'
    );
  }


  getUserSecondaryText(
    user: UserDto,
  ): string {
    return (
      user.emailAddress ||
      user.email ||
      `ID ${user.student?.id || user.id}`
    );
  }


  getUserInitials(
    user: UserDto,
  ): string {
    const first =
      user.firstName
        ?.charAt(0) || '';

    const last =
      user.lastName
        ?.charAt(0) || '';

    return (
      `${first}${last}`
        .toUpperCase() ||
      'E'
    );
  }
}