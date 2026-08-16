import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StageProgressByStage } from '../../../services/dtos/stage-progress.dto';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';


type StageProgressItem = StageProgressByStage[number];

type StageAssessmentStudentRow = StageProgressItem & {
  resourcesCount?: number;
};


@Component({
  selector: 'app-stage-assessment-student-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './stage-assessment-student-list.component.html',
  styleUrl: './stage-assessment-student-list.component.scss',
})
export class StageAssessmentStudentListComponent implements OnInit {

  /* =========================
     INPUTS
  ========================= */

  @Input() students: StageAssessmentStudentRow[] = [];
  @Input() totalStudents = 0;
  @Input() selectedStudentIds: number[] = [];
  @Input() resetSelection = false;
  @Input() searchTerm = '';
  @Input() limit = 20;
  @Input() limitOptions: number[] = [10, 20, 50, 100];
  @Input() hasStageSelected = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() limitChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<number[]>();
  @Output() selectAllRequested = new EventEmitter<void>();
  @Output() clearSelectionRequested = new EventEmitter<void>();
  @Output() assignRequested = new EventEmitter<void>();

  @Output()
  activeAssessmentDetailRequested =
    new EventEmitter<StageAssessmentStudentRow>();


  /* =========================
     ASSESSMENT CONFIG
  ========================= */

  minPointsAssessment = 0;
  maxPointsAssessment = 0;
  isLoadingAssessmentConfig = false;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private assessmentPointsConfigService: AssessmentPointsConfigService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadAssessmentPointsConfig();
  }


  /* =========================
     LOAD ASSESSMENT CONFIG
  ========================= */

  private loadAssessmentPointsConfig(): void {
    this.isLoadingAssessmentConfig = true;

    this.assessmentPointsConfigService
      .getById()
      .subscribe({
        next: (config) => {
          this.minPointsAssessment =
            Number(config.minPointsAssessment) || 0;

          this.maxPointsAssessment =
            Number(config.maxPointsAssessment) || 0;

          this.isLoadingAssessmentConfig = false;
        },

        error: (err) => {
          console.error(
            'Error obteniendo configuración de evaluaciones:',
            err,
          );

          this.minPointsAssessment = 0;
          this.maxPointsAssessment = 0;
          this.isLoadingAssessmentConfig = false;
        },
      });
  }


  /* =========================
     ASSESSMENT TYPES
  ========================= */

  hasAssessmentType(
    item: StageAssessmentStudentRow,
    type: string,
  ): boolean {
    if (!item.assessments?.length) {
      return false;
    }

    const normalizedType =
      type.trim().toLowerCase();

    return item.assessments.some(
      assessment =>
        (
          assessment.assessmentType?.name ||
          assessment.type ||
          ''
        )
          .trim()
          .toLowerCase() === normalizedType,
    );
  }


  /* =========================
     ASSESSMENT APPROVED
  ========================= */

  isAssessmentTypeApproved(
    item: StageAssessmentStudentRow,
    type: string,
  ): boolean {
    if (
      !item.assessments?.length ||
      !this.minPointsAssessment
    ) {
      return false;
    }

    const normalizedType =
      type.trim().toLowerCase();

    return item.assessments.some(
      assessment => {
        const assessmentType =
          (
            assessment.assessmentType?.name ||
            assessment.type ||
            ''
          )
            .trim()
            .toLowerCase();

        return (
          assessmentType === normalizedType &&
          Number(assessment.points || 0) >=
            this.minPointsAssessment
        );
      },
    );
  }


  /* =========================
     ASSESSMENT STATUS
  ========================= */

  getAssessmentTypeStatus(
    item: StageAssessmentStudentRow,
    type: string,
  ): 'approved' | 'failed' | 'pending' {
    if (!this.hasAssessmentType(item, type)) {
      return 'pending';
    }

    return this.isAssessmentTypeApproved(item, type)
      ? 'approved'
      : 'failed';
  }


  /* =========================
     ACTIVE RESOURCES
  ========================= */

  getActiveAssessmentResources(
    item: StageAssessmentStudentRow,
  ): string[] {
    return (
      item.activeAssessments
        ?.map(
          assessment =>
            assessment.stageAssessmentResource?.description,
        )
        .filter(
          (description): description is string =>
            !!description,
        ) || []
    );
  }


  /* =========================
     ACTIVE ASSESSMENT
  ========================= */

  hasActiveAssessment(
    item: StageAssessmentStudentRow,
  ): boolean {
    return !!item.activeAssessments?.length;
  }


  /* =========================
     STUDENT SELECTION
  ========================= */

  toggleStudent(
    studentId: number,
  ): void {
    const student =
      this.students.find(
        item =>
          item.studentId === studentId,
      );

    if (
      student &&
      this.hasActiveAssessment(student)
    ) {
      return;
    }

    const isSelected =
      this.selectedStudentIds.includes(studentId);

    const updatedSelection =
      isSelected
        ? this.selectedStudentIds.filter(
            id =>
              id !== studentId,
          )
        : [
            ...this.selectedStudentIds,
            studentId,
          ];

    this.selectionChange.emit(
      updatedSelection,
    );
  }


  isStudentSelected(
    studentId: number,
  ): boolean {
    return this.selectedStudentIds.includes(
      studentId,
    );
  }


  /* =========================
     SELECT ALL STATE
  ========================= */

  get allStudentsSelected(): boolean {
    const selectableStudents =
      this.students.filter(
        item =>
          !this.hasActiveAssessment(item),
      );

    if (!selectableStudents.length) {
      return false;
    }

    return selectableStudents.every(
      item =>
        this.selectedStudentIds.includes(
          item.studentId,
        ),
    );
  }


  /* =========================
     SEARCH
  ========================= */

  onSearchChange(
    value: string,
  ): void {
    this.searchTermChange.emit(
      value || '',
    );
  }


  /* =========================
     LIMIT
  ========================= */

  onLimitChange(
    value: number | string,
  ): void {
    const parsedValue =
      Number(value);

    if (
      !Number.isFinite(parsedValue) ||
      parsedValue <= 0
    ) {
      return;
    }

    this.limitChange.emit(
      parsedValue,
    );
  }


  /* =========================
     SELECT ALL
  ========================= */

  onSelectAll(): void {
    this.selectAllRequested.emit();
  }


  /* =========================
     CLEAR SELECTION
  ========================= */

  onClearSelection(): void {
    if (!this.selectedStudentIds.length) {
      return;
    }

    this.clearSelectionRequested.emit();
  }


  /* =========================
     ASSIGN
  ========================= */

  onAssignAssessment(): void {
    if (!this.selectedStudentIds.length) {
      return;
    }

    this.assignRequested.emit();
  }


  /* =========================
     ACTIVE ASSESSMENT DETAIL
  ========================= */

  onViewActiveAssessment(
    item: StageAssessmentStudentRow,
  ): void {
    if (!this.hasActiveAssessment(item)) {
      return;
    }

    this.activeAssessmentDetailRequested.emit(
      item,
    );
  }


  /* =========================
     SELECTION STATE
  ========================= */

  get selectedCount(): number {
    return this.selectedStudentIds.length;
  }

  get hasSelectedStudents(): boolean {
    return this.selectedStudentIds.length > 0;
  }
}