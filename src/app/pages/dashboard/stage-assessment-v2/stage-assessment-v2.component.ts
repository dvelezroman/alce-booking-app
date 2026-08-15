import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { StageProgressService } from '../../../services/stage-progress';

import {
  StageProgressByStage,
} from '../../../services/dtos/stage-progress.dto';

import {
  StageAssessmentResource,
} from '../../../services/dtos/stage-resources.dto';

import { StageAssessmentResourcesService } from '../../../services/stage-assessment-resources.service';
import { StageAssessmentService } from '../../../services/stage-assessment.service';

import { ModalComponent } from '../../../components/modal/modal.component';

import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

/* =========================
   CHILD COMPONENTS
========================= */

import { StageAssessmentHeaderComponent } from '../../../components/stage-assessments-v2/stage-assessment-header/stage-assessment-header.component';

import { StageAssessmentStageSelectorComponent } from '../../../components/stage-assessments-v2/stage-assessment-stage-selector/stage-assessment-stage-selector.component';

import { StageAssessmentSummaryComponent } from '../../../components/stage-assessments-v2/stage-assessment-summary/stage-assessment-summary.component';

import { StageAssessmentStudentListComponent } from '../../../components/stage-assessments-v2/stage-assessment-student-list/stage-assessment-student-list.component';

import { StageAssessmentPaginationComponent } from '../../../components/stage-assessments-v2/stage-assessment-pagination/stage-assessment-pagination.component';

import { StageAssessmentCreatePanelComponent } from '../../../components/stage-assessments-v2/stage-assessment-create-panel/stage-assessment-create-panel.component';
import { StageAssessmentActiveDetailModalComponent } from "../../../components/stage-assessments-v2/stage-assessment-active-detail-modal/stage-assessment-active-detail-modal.component";

type StageProgressItem =
  StageProgressByStage[number];

type StageAssessmentStudentRow =
  StageProgressItem & {
    resourcesCount?: number;
  };


@Component({
  selector: 'app-stage-assessment-v2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    StageAssessmentHeaderComponent,
    StageAssessmentStageSelectorComponent,
    StageAssessmentSummaryComponent,
    StageAssessmentStudentListComponent,
    StageAssessmentPaginationComponent,
    StageAssessmentCreatePanelComponent,
    StageAssessmentActiveDetailModalComponent
],
  templateUrl: './stage-assessment-v2.component.html',
  styleUrl: './stage-assessment-v2.component.scss',
})
export class StageAssessmentV2Component implements OnInit {

  /* =========================
     STAGE
  ========================= */

  selectedStageId?: number;

  selectedStudentIds: number[] = [];


  /* =========================
     CREATE PANEL
  ========================= */

  isCreatePanelOpen = false;


  /* =========================
     RESOURCES
  ========================= */

  resourcesList: StageAssessmentResource[] = [];


  /* =========================
     SELECTION
  ========================= */

  resetSelectionFlag = false;


  /* =========================
     LISTS
  ========================= */

  stageProgressList: StageProgressByStage = [];

  filteredList: StageProgressByStage = [];

  pagedList: StageProgressByStage = [];


  /* =========================
     PAGINATION
  ========================= */

  page = 1;

  limit = 20;

  total = 0;

  readonly limitOptions = [
    10,
    20,
    50,
    100,
  ];


  /* =========================
     SEARCH
  ========================= */

  searchTerm = '';


  /* =========================
     RECALCULATE
  ========================= */

  isRecalculating = false;


  /* =========================
     MODAL
  ========================= */

  @Input()
  show = false;

  modal: ModalDto =
    modalInitializer();

  /* =========================
    ACTIVE ASSESSMENT DETAIL
  ========================= */

  selectedAssessmentStudent:
    StageAssessmentStudentRow | null =
      null;

  isAssessmentDetailModalOpen =
    false;  


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private stageProgressService: StageProgressService,
    private stageAssessmentService: StageAssessmentService,
    private stageAssessmentResourcesService: StageAssessmentResourcesService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {}


  /* =========================
     STAGE SELECTED
  ========================= */

  onStageSelected(
    stageId: number,
  ): void {
    this.selectedStageId =
      stageId;

    this.selectedStudentIds = [];

    this.resetSelectionFlag = true;

    this.isCreatePanelOpen = false;

    this.searchTerm = '';

    this.page = 1;

    if (!stageId) {
      this.clearStageData();
      return;
    }

    /*
     * Primero obtenemos recursos para poder
     * adjuntar correctamente stageEntryDate.
     */
    this.stageAssessmentResourcesService
      .getAll({
        stageId,
      })
      .subscribe({
        next: (data) => {
          this.resourcesList =
            data || [];

          this.fetchProgressForStage(
            stageId,
          );
        },

        error: (err) => {
          console.error(
            'Error obteniendo recursos:',
            err,
          );

          this.resourcesList = [];

          this.fetchProgressForStage(
            stageId,
          );
        },
      });
  }


  /* =========================
     CLEAR STAGE DATA
  ========================= */

  private clearStageData(): void {
    this.resourcesList = [];

    this.stageProgressList = [];

    this.filteredList = [];

    this.pagedList = [];

    this.total = 0;

    this.page = 1;
  }


  /* =========================
     ATTACH STAGE ENTRY DATE
  ========================= */

  private attachStageEntryDate(): void {
    if (
      !this.resourcesList ||
      this.resourcesList.length === 0
    ) {
      return;
    }

    const allStudentsFromResources =
      this.resourcesList.flatMap(
        resource =>
          resource.students || [],
      );

    this.stageProgressList =
      this.stageProgressList.map(
        progress => {
          const match =
            allStudentsFromResources.find(
              student =>
                student.studentId ===
                progress.studentId,
            );

          return {
            ...progress,

            stageEntryDate:
              match?.stageEntryDate,
          };
        },
      );
  }


  /* =========================
     FETCH PROGRESS
  ========================= */

  private fetchProgressForStage(
    stageId: number,
  ): void {
    this.stageProgressService
      .getProgressForStage(
        stageId,
      )
      .subscribe({
        next: (data) => {
          this.stageProgressList =
            data || [];

          this.attachStageEntryDate();

          this.filteredList = [
            ...this.stageProgressList,
          ];

          this.total =
            this.filteredList.length;

          this.page = 1;

          this.updatePagedList();
        },

        error: (err) => {
          console.error(
            'Error al obtener progreso por stage:',
            err,
          );

          this.stageProgressList = [];

          this.filteredList = [];

          this.pagedList = [];

          this.total = 0;
        },
      });
  }


  /* =========================
     CREATE PANEL
  ========================= */

  openCreateAssessmentPanel(): void {
    if (
      !this.selectedStageId ||
      this.selectedStudentIds.length === 0
    ) {
      return;
    }

    this.isCreatePanelOpen = true;
  }


  closeCreateAssessmentPanel(): void {
    this.isCreatePanelOpen = false;
  }


  /* =========================
     CREATE ASSESSMENT
  ========================= */

  onCreateAssessment(
    payload: any,
  ): void {
    this.stageAssessmentService
      .create(
        payload,
      )
      .subscribe({
        next: () => {
          this.showNotification(
            'Evaluación creada correctamente',
            false,
            true,
          );

          if (
            this.selectedStageId
          ) {
            this.fetchProgressForStage(
              this.selectedStageId,
            );
          }

          this.selectedStudentIds = [];

          this.triggerSelectionReset();

          this.isCreatePanelOpen = false;
        },

        error: () => {
          this.showNotification(
            'Error al crear evaluación',
            true,
          );
        },
      });
  }


  /* =========================
     SEARCH
  ========================= */

  onSearch(): void {
    const term =
      this.searchTerm
        .toLowerCase()
        .trim();

    if (!term) {
      this.filteredList = [
        ...this.stageProgressList,
      ];
    } else {
      this.filteredList =
        this.stageProgressList.filter(
          item => {
            const first =
              item.student.user
                ?.firstName
                ?.toLowerCase() ||
              '';

            const last =
              item.student.user
                ?.lastName
                ?.toLowerCase() ||
              '';

            const email =
              item.student.user
                ?.email
                ?.toLowerCase() ||
              '';

            return (
              first.includes(term) ||
              last.includes(term) ||
              email.includes(term)
            );
          },
        );
    }

    this.total =
      this.filteredList.length;

    this.page = 1;

    this.updatePagedList();
  }


  onSearchTermChange(
    value: string,
  ): void {
    this.searchTerm =
      value || '';

    this.onSearch();
  }


  /* =========================
     STUDENT SELECTION
  ========================= */

  onStudentSelection(
    ids: number[],
  ): void {
    this.selectedStudentIds = [
      ...ids,
    ];

    if (
      this.selectedStudentIds.length === 0 &&
      this.isCreatePanelOpen
    ) {
      this.isCreatePanelOpen = false;
    }
  }


  /* =========================
     CLEAR SELECTION
  ========================= */

  clearStudentSelection(): void {
    this.selectedStudentIds = [];

    this.triggerSelectionReset();

    this.isCreatePanelOpen = false;
  }


  /* =========================
     RESET SELECTION
  ========================= */

  private triggerSelectionReset(): void {
    this.resetSelectionFlag = false;

    setTimeout(() => {
      this.resetSelectionFlag = true;
    });
  }


  /* =========================
     SELECT ALL
  ========================= */

  selectAllStudents(): void {
    this.selectedStudentIds =
      this.filteredList
        .filter(
          item =>
            this.canSelectStudent(item),
        )
        .map(
          item =>
            item.studentId,
        );
  }


  /* =========================
     RECALCULATE
  ========================= */

  private executeRecalculation(): void {
    if (
      !this.selectedStageId
    ) {
      return;
    }

    this.isRecalculating = true;

    this.stageProgressService
      .recalculateProgressForStage(
        this.selectedStageId,
      )
      .subscribe({
        next: () => {
          this.showNotification(
            'Progreso re-calculado correctamente',
            false,
            true,
          );

          if (
            this.selectedStageId
          ) {
            this.fetchProgressForStage(
              this.selectedStageId,
            );
          }

          this.isRecalculating = false;
        },

        error: () => {
          this.showNotification(
            'Error al re-calcular progreso',
            true,
          );

          this.isRecalculating = false;
        },
      });

    this.modal.show = false;
  }


  /* =========================
     PAGINATION
  ========================= */

  updatePagedList(): void {
    const start =
      (this.page - 1) *
      this.limit;

    const end =
      start +
      this.limit;

    this.pagedList =
      this.filteredList.slice(
        start,
        end,
      );
  }


  onPrev(): void {
    if (
      this.page <= 1
    ) {
      return;
    }

    this.page--;

    this.updatePagedList();
  }


  onNext(): void {
    if (
      this.page >=
      this.totalPages
    ) {
      return;
    }

    this.page++;

    this.updatePagedList();
  }


  onPageChange(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.page = page;

    this.updatePagedList();
  }


  onLimitChange(
    value: number,
  ): void {
    const limit =
      Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.limit = limit;

    this.page = 1;

    this.updatePagedList();
  }


  /* =========================
     PAGINATION STATE
  ========================= */

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.total /
        this.limit,
      ),
    );
  }


  get canPrev(): boolean {
    return this.page > 1;
  }


  get canNext(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }


  get startIndex(): number {
    if (
      this.total === 0
    ) {
      return 0;
    }

    return (
      (this.page - 1) *
      this.limit
    ) + 1;
  }


  get endIndex(): number {
    return Math.min(
      this.page *
      this.limit,
      this.total,
    );
  }


  get paginationLabel(): string {
    if (
      this.total === 0
    ) {
      return '0 estudiantes';
    }

    return (
      `Mostrando ${this.startIndex} ` +
      `a ${this.endIndex} ` +
      `de ${this.total} estudiantes`
    );
  }


  /* =========================
     SUMMARY
  ========================= */

  get averageProgress(): number {
    if (
      this.stageProgressList.length === 0
    ) {
      return 0;
    }

    const progress =
      this.stageProgressList.reduce(
        (
          total,
          item,
        ) =>
          total +
          Number(
            item.progress || 0,
          ),
        0,
      );

    return Math.round(
      progress /
      this.stageProgressList.length,
    );
  }


  get activeAssessmentsCount(): number {
    return this.stageProgressList.reduce(
      (
        total,
        item,
      ) =>
        total +
        (
          item.activeAssessments
            ?.length ||
          0
        ),
      0,
    );
  }


  get resourcesCount(): number {
    return this.resourcesList.length;
  }


  get stageEntryDate(): string | null {
    const dates =
      this.stageProgressList
        .map(
          item =>
            item.stageEntryDate,
        )
        .filter(
          (
            date,
          ): date is string =>
            !!date,
        )
        .sort(
          (
            a,
            b,
          ) =>
            new Date(a).getTime() -
            new Date(b).getTime(),
        );

    return (
      dates[0] ||
      null
    );
  }


  /* =========================
     SELECTED STAGE
  ========================= */

  get selectedStage() {
    if (
      !this.selectedStageId
    ) {
      return null;
    }

    const progressStage =
      this.stageProgressList.find(
        item =>
          item.stageId ===
          this.selectedStageId,
      )
        ?.stage;

    if (progressStage) {
      return progressStage;
    }

    return (
      this.resourcesList.find(
        resource =>
          resource.stageId ===
          this.selectedStageId,
      )
        ?.stage ||
      null
    );
  }


  /* =========================
     SELECTION STATE
  ========================= */

  get selectedStudentsCount(): number {
    return this.selectedStudentIds.length;
  }


  get hasSelectedStudents(): boolean {
    return (
      this.selectedStudentIds.length >
      0
    );
  }


  /* =========================
     CONFIRM RECALCULATE
  ========================= */

  confirmRecalculateProgress(): void {
    if (
      !this.selectedStageId
    ) {
      return;
    }

    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        '¿Deseas re-calcular el progreso de todos los estudiantes de este stage?',

      isInfo: true,

      showButtons: true,

      close: () => {
        this.modal.show = false;
      },

      confirm: () => {
        this.executeRecalculation();
      },
    };
  }


  /* =========================
     NOTIFICATION
  ========================= */

  private showNotification(
    message: string,
    isError = false,
    isSuccess = false,
  ): void {
    this.modal = {
      ...modalInitializer(),

      show: true,

      message,

      isError,

      isSuccess,

      isInfo: false,

      close: () => {
        this.modal.show = false;
      },
    };

    setTimeout(() => {
      this.modal.show = false;
    }, 2000);
  }

  /* =========================
    OPEN ASSESSMENT DETAIL
  ========================= */

  onActiveAssessmentDetailRequested(
    student: StageAssessmentStudentRow,
  ): void {
    if (
      !student.activeAssessments ||
      student.activeAssessments.length === 0
    ) {
      return;
    }

    this.selectedAssessmentStudent =
      student;

    this.isAssessmentDetailModalOpen =
      true;
  }


  /* =========================
    CLOSE ASSESSMENT DETAIL
  ========================= */

  closeAssessmentDetailModal(): void {
    this.isAssessmentDetailModalOpen =
      false;

    this.selectedAssessmentStudent =
      null;
  }

   /* =========================
    HELPER
    ========================= */

    private canSelectStudent(
    item: StageProgressByStage[number],
  ): boolean {
    return (
      !item.activeAssessments ||
      item.activeAssessments.length === 0
    );
  }
}