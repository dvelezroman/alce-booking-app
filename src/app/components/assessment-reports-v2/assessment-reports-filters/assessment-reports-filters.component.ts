import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AssessmentType,
} from '../../../services/dtos/assessment.dto';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-assessment-reports-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-reports-filters.component.html',
  styleUrl: './assessment-reports-filters.component.scss',
})
export class AssessmentReportsFiltersComponent implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input() stages: Stage[] = [];

  @Input() selectedStageId: number | null = null;

  @Input() selectedStudentId: number | null = null;

  @Input() filteredStudents: UserDto[] = [];

  @Input() showStudentDropdown = false;

  @Input() isStudentFieldInvalid = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() stageSelected =
    new EventEmitter<string>();

  @Output() searchRequested =
    new EventEmitter<{
      studentId: number | null;
      stageId?: number;
      type: AssessmentType | null;
    }>();

  @Output() studentInputChange =
    new EventEmitter<string>();

  @Output() studentSelected =
    new EventEmitter<UserDto>();

  @Output() studentDropdownHidden =
    new EventEmitter<void>();


  /* =========================
     FILTER STATE
  ========================= */

  studentId: number | null = null;

  stageId: number | null = null;

  assessmentType: AssessmentType | null = null;

  studentSearch = '';

  from = '';

  to = '';


  /* =========================
     TYPES
  ========================= */

  readonly assessmentTypes = [
    {
      value: AssessmentType.Speaking,
      label: 'Speaking',
    },
    {
      value: AssessmentType.Grammar,
      label: 'Grammar',
    },
  ];


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['selectedStageId']
    ) {
      this.stageId =
        this.selectedStageId;
    }

    if (
      changes['selectedStudentId']
    ) {
      this.studentId =
        this.selectedStudentId;
    }
  }


  /* =========================
     STUDENT SEARCH
  ========================= */

  onStudentInputChange(
    term: string,
  ): void {

    this.studentSearch =
      term;

    this.studentId =
      null;

    this.studentInputChange.emit(
      term,
    );
  }


  onSelectStudent(
    user: UserDto,
  ): void {

    this.studentSearch =
      this.getStudentFullName(
        user,
      );

    this.studentId =
      this.getStudentIdValue(
        user,
      );

    this.studentSelected.emit(
      user,
    );
  }


  onStudentInputBlur(): void {

    setTimeout(() => {
      this.studentDropdownHidden.emit();
    }, 150);
  }


  clearStudent(): void {

    this.studentId =
      null;

    this.studentSearch =
      '';

    this.studentInputChange.emit(
      '',
    );
  }


  /* =========================
     STAGE
  ========================= */

  onStageChange(
    value: number | null,
  ): void {

    this.stageId =
      value != null
        ? Number(value)
        : null;

    if (
      this.stageId === null
    ) {
      this.stageSelected.emit(
        '',
      );

      return;
    }

    const stage =
      this.stages.find(
        item =>
          Number(item.id) ===
          Number(this.stageId),
      );

    this.stageSelected.emit(
      stage?.number || '',
    );
  }


  /* =========================
     ASSESSMENT TYPE
  ========================= */

  onAssessmentTypeChange(
    value: AssessmentType | null,
  ): void {

    this.assessmentType =
      value || null;
  }


  /* =========================
     SEARCH
  ========================= */

  onSearch(): void {

    this.searchRequested.emit({
      studentId:
        this.studentId,

      stageId:
        this.stageId ??
        undefined,

      type:
        this.assessmentType,
    });
  }


  /* =========================
     CLEAR
  ========================= */

  onClear(): void {

    this.studentId =
      null;

    this.studentSearch =
      '';

    this.stageId =
      null;

    this.assessmentType =
      null;

    this.from =
      '';

    this.to =
      '';

    this.studentInputChange.emit(
      '',
    );

    this.stageSelected.emit(
      '',
    );

    this.searchRequested.emit({
      studentId:
        null,

      type:
        null,
    });
  }


  /* =========================
     STUDENT HELPERS
  ========================= */

  getStudentFullName(
    user: UserDto,
  ): string {

    return [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      'Sin nombre';
  }


  getStudentInitials(
    user: UserDto,
  ): string {

    const firstName =
      user.firstName
        ?.trim()
        ?.charAt(0) || '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) || '';

    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'E'
    );
  }


  getStudentIdentification(
    user: UserDto,
  ): string {

    return (
      user.idNumber ||
      String(user.id)
    );
  }


  private getStudentIdValue(
    user: UserDto,
  ): number {

    if (
      user.student?.id
    ) {
      return Number(
        user.student.id,
      );
    }

    return Number(
      user.id,
    );
  }


  /* =========================
     STAGE HELPERS
  ========================= */

  getStageLabel(
    stage: Stage,
  ): string {

    return (
      stage.number ||
      `Stage ${stage.id}`
    );
  }


  trackStage(
    index: number,
    stage: Stage,
  ): number {

    return stage.id;
  }
}