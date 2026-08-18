import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

import { Stage } from '../../../services/dtos/student.dto';
import {
  StudyContentDto,
  StudyContentCreateDto,
  StudyContentUpdateDto,
} from '../../../services/dtos/study-content.dto';

import { StagesService } from '../../../services/stages.service';
import { StudyContentService } from '../../../services/study-content.service';

/* =========================
   CHILD COMPONENTS V2
========================= */

import { ContentHeaderComponent } from '../../../components/content-v2/content-header/content-header.component';
import { ContentFiltersComponent } from '../../../components/content-v2/content-filters/content-filters.component';
import { ContentTableComponent } from '../../../components/content-v2/content-table/content-table.component';
import { ContentPaginationComponent } from '../../../components/content-v2/content-pagination/content-pagination.component';
import { ContentFormModalComponent } from '../../../components/content-v2/content-form-modal/content-form-modal.component';
import { ContentDetailsModalComponent } from '../../../components/content-v2/content-details-modal/content-details-modal.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    ContentHeaderComponent,
    ContentFiltersComponent,
    ContentTableComponent,
    ContentPaginationComponent,
    ContentFormModalComponent,
    ContentDetailsModalComponent,
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  showModal = false;
  stages: Stage[] = [];
  filteredContents: StudyContentDto[] = [];
  contentToEdit: StudyContentDto | null = null;
  contentToView: StudyContentDto | null = null;
  modal: ModalDto = modalInitializer();

  filterForm: FormGroup;

  /* =========================
     PAGINATION
  ========================= */

  page = 1;
  limit = 10;

  readonly limitOptions = [
    10,
    20,
    50,
    100,
  ];

  constructor(
    private fb: FormBuilder,
    private stagesService: StagesService,
    private studyContentService: StudyContentService,
  ) {
    this.filterForm = this.fb.group({
      stageId: [
        undefined,
        [Validators.min(1)],
      ],
      unit: [
        undefined,
        [Validators.min(1)],
      ],
    });
  }

  ngOnInit(): void {
    this.stagesService
      .getAll()
      .subscribe(stages => {
        this.stages = stages;
      });
  }

  /* =========================
     CONTENT
  ========================= */

  parseContent(
    content: string | null | undefined,
  ): string {
    try {
      const parsed = JSON.parse(
        content ?? '""',
      );

      return typeof parsed === 'string'
        ? parsed
        : '';
    } catch {
      return content ?? '';
    }
  }

  /* =========================
     CREATE MODAL
  ========================= */

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  /* =========================
     STAGE ORDER
  ========================= */

  private getStageNumber(
    value: string,
  ): number {
    return Number(
      value.replace(/\D+/g, ''),
    );
  }

  /* =========================
     SEARCH
  ========================= */

  searchContent(): void {
    const {
      stageId,
      unit,
    } = this.filterForm.value;

    this.studyContentService
      .filterBy(
        stageId,
        unit,
      )
      .subscribe({
        next: (results) => {
          this.filteredContents =
            results.sort(
              (a, b) => {
                return (
                  this.getStageNumber(
                    a.stage.number,
                  ) -
                  this.getStageNumber(
                    b.stage.number,
                  )
                );
              },
            );

          this.page = 1;
        },

        error: (err) => {
          console.error(
            'Error al filtrar contenido:',
            err,
          );
        },
      });
  }

  /* =========================
     CLEAR FILTERS
  ========================= */

  clearFilters(): void {
    this.filterForm.reset({
      stageId: undefined,
      unit: undefined,
    });

    this.filteredContents = [];
    this.page = 1;
  }

  /* =========================
     CREATE
  ========================= */

  handleFormSubmit(
    data: StudyContentCreateDto,
  ): void {
    this.showModal = false;

    this.studyContentService
      .create(data)
      .subscribe({
        next: () => {
          this.showNotification(
            'Contenido creado correctamente',
            false,
            true,
          );

          this.searchContent();
        },

        error: (err) => {
          this.showNotification(
            'Error al crear el contenido',
            true,
          );

          console.error(err);
        },
      });
  }

  /* =========================
     EDIT
  ========================= */

  editContent(
    content: StudyContentDto,
  ): void {
    this.contentToEdit = content;
  }

  handleUpdateContent(
    updated: StudyContentUpdateDto,
  ): void {
    if (!this.contentToEdit) {
      return;
    }

    this.studyContentService
      .update(
        this.contentToEdit.id,
        updated,
      )
      .subscribe({
        next: () => {
          this.showNotification(
            'Contenido actualizado correctamente',
            false,
            true,
          );

          this.contentToEdit = null;

          this.searchContent();
        },

        error: (err) => {
          console.error(
            'Error al actualizar contenido:',
            err,
          );

          this.showNotification(
            'Error al actualizar el contenido',
            true,
          );
        },
      });
  }

  closeEditModal(): void {
    this.contentToEdit = null;
  }

  /* =========================
     DETAILS
  ========================= */

  viewContent(
    content: StudyContentDto,
  ): void {
    this.contentToView = content;
  }

  closeDetailsModal(): void {
    this.contentToView = null;
  }

  /* =========================
     DELETE
  ========================= */

  confirmDelete(
    id: number,
  ): void {
    this.studyContentService
      .delete(id)
      .subscribe({
        next: () => {
          this.showNotification(
            'Contenido eliminado correctamente',
            false,
            true,
          );

          this.searchContent();
        },

        error: (err) => {
          console.error(
            'Error al eliminar contenido:',
            err,
          );

          this.showNotification(
            'Error al eliminar el contenido',
            true,
          );
        },
      });

    this.modal.show = false;
  }

  deleteContent(
    id: number,
  ): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message:
        '¿Estás seguro de eliminar este contenido?',
      isInfo: true,
      showButtons: true,
      close: () =>
        this.modal.show = false,
      confirm: () =>
        this.confirmDelete(id),
    };
  }

  /* =========================
     NOTIFICATION
  ========================= */

  showNotification(
    message: string,
    isError: boolean = false,
    isSuccess: boolean = false,
  ): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () =>
        this.modal.show = false,
    };

    setTimeout(() => {
      this.modal.show = false;
    }, 2500);
  }

  /* =========================
     PAGED CONTENTS
  ========================= */

  get pagedContents():
    StudyContentDto[] {
    const start =
      (this.page - 1) *
      this.limit;

    return this.filteredContents.slice(
      start,
      start + this.limit,
    );
  }

  /* =========================
     PAGINATION
  ========================= */

  onPrev(): void {
    if (!this.canPrev) {
      return;
    }

    this.page--;
  }

  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.page++;
  }

  onPageChange(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;
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
  }

  /* =========================
     PAGINATION STATE
  ========================= */

  get total(): number {
    return this.filteredContents.length;
  }

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
    if (!this.total) {
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
    if (!this.total) {
      return '0 resultados';
    }

    return (
      `Mostrando ${this.startIndex} ` +
      `a ${this.endIndex} ` +
      `de ${this.total} resultados`
    );
  }

  protected readonly JSON = JSON;
}