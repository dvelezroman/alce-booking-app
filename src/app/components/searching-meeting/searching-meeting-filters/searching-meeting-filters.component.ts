import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  FilterMeetingsDto,
} from '../../../services/dtos/booking.dto';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  Instructor,
} from '../../../services/dtos/instructor.dto';

@Component({
  selector: 'app-searching-meeting-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './searching-meeting-filters.component.html',
  styleUrl: './searching-meeting-filters.component.scss',
})
export class SearchingMeetingFiltersComponent {

  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  instructorSearch: string = '';
  showInstructorDropdown: boolean = false;
  filteredInstructors: Instructor[] = [];

  /* =========================
     INPUTS
  ========================= */

  @Input()
  filter: FilterMeetingsDto = {
    from: '',
    to: '',
    hour: '',
    stageId: '',
    assigned: false,
    category: undefined,
    mode: undefined,
    instructorId: '',
  };

  @Input()
  availableHours: number[] = [];

  @Input()
  stages: Stage[] = [];

  @Input()
  ageGroupOptions: string[] = [];

  @Input()
  modeOptions: string[] = [];

  @Input()
  instructors: Instructor[] = [];

  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  filterChange = new EventEmitter<void>();

  @Output()
  clearFilters = new EventEmitter<void>();

  /* =========================
     ACTIONS
  ========================= */

  onApplyFilters(): void {
    this.filterChange.emit();
  }

  onClearFilters(): void {
    this.instructorSearch = '';
    this.showInstructorDropdown = false;
    this.filteredInstructors = [];

    this.clearFilters.emit();
  }

  /* =========================
     HOUR
  ========================= */

  formatHour(
    hour: number,
  ): string {
    const suffix =
      hour >= 12
        ? 'PM'
        : 'AM';

    const formattedHour =
      hour % 12 || 12;

    return `${formattedHour}:00 ${suffix}`;
  }

  /* =========================
     STAGE
  ========================= */

  getStageLabel(
    stage: Stage,
  ): string {
    return stage.number
      ? `Stage ${stage.number}`
      : stage.description || 'Stage';
  }

  /* =========================
     CATEGORY
  ========================= */

  getCategoryLabel(
    category: string,
  ): string {
    const labels:
      Record<string, string> = {
        KIDS: 'Kids',
        TEENS: 'Teens',
        ADULTS: 'Adults',
      };

    return labels[category] || category;
  }

  /* =========================
     MODE
  ========================= */

  getModeLabel(
    mode: string,
  ): string {
    const labels:
      Record<string, string> = {
        ONLINE: 'Online',
        PRESENCIAL: 'Presencial',
      };

    return labels[mode] || mode;
  }

  /* =========================
     INSTRUCTOR
  ========================= */

  getInstructorLabel(
    instructor: Instructor,
  ): string {
    const firstName =
      instructor.user?.firstName || '';

    const lastName =
      instructor.user?.lastName || '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    return fullName || 'Instructor';
  }

  getInstructorId(
    instructor: Instructor,
  ): string {
    return String(
      instructor.id,
    );
  }

  getInstructorInitials(
    instructor: Instructor,
  ): string {
    const firstName =
      instructor.user?.firstName?.trim() || '';

    const lastName =
      instructor.user?.lastName?.trim() || '';

    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`
        .toUpperCase();

    return initials || 'IN';
  }

  trackByInstructorId(
    index: number,
    instructor: Instructor,
  ): number {
    return instructor.id;
  }

  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  onInstructorInputFocus(): void {
    this.filteredInstructors = [
      ...this.instructors,
    ];

    this.showInstructorDropdown = true;
  }

  onInstructorInputChange(
    value: string,
  ): void {
    this.instructorSearch = value;

    const term =
      value
        .trim()
        .toLowerCase();

    /*
     * Si el usuario comienza a escribir nuevamente,
     * quitamos el instructor previamente seleccionado.
     */
    this.filter.instructorId = '';

    this.showInstructorDropdown = true;

    if (!term) {
      this.filteredInstructors = [
        ...this.instructors,
      ];

      return;
    }

    this.filteredInstructors =
      this.instructors.filter(
        instructor => {
          const fullName =
            this
              .getInstructorLabel(
                instructor,
              )
              .toLowerCase();

          return fullName.includes(
            term,
          );
        },
      );
  }

  onInstructorInputBlur(): void {
    setTimeout(() => {
      this.showInstructorDropdown =
        false;
    }, 150);
  }

  onSelectInstructor(
    instructor: Instructor,
  ): void {
    this.filter.instructorId =
      this.getInstructorId(
        instructor,
      );

    this.instructorSearch =
      this.getInstructorLabel(
        instructor,
      );

    /*
     * Si seleccionamos un instructor,
     * automáticamente buscamos reuniones
     * asignadas.
     */
    this.filter.assigned = true;

    this.showInstructorDropdown =
      false;
  }

  clearInstructor(): void {
    this.filter.instructorId = '';

    this.instructorSearch = '';

    this.filteredInstructors = [
      ...this.instructors,
    ];

    this.showInstructorDropdown =
      false;
  }
}