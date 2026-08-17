import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Stage,
  CreateStageDto,
} from '../../../services/dtos/student.dto';

import { StagesService } from '../../../services/stages.service';

/* =========================
   MODAL
========================= */

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

/* =========================
   CHILD COMPONENTS
========================= */

import { StagesHeaderComponent } from '../../../components/stages/stages-header/stages-header.component';
import { StagesSummaryComponent } from '../../../components/stages/stages-summary/stages-summary.component';
import { StagesFiltersComponent } from '../../../components/stages/stages-filters/stages-filters.component';
import { StagesTableComponent } from '../../../components/stages/stages-table/stages-table.component';
import { StagesPaginationComponent } from '../../../components/stages/stages-pagination/stages-pagination.component';
import { StagesFormModalComponent } from '../../../components/stages/stages-form-modal/stages-form-modal.component';


@Component({
  selector: 'app-stage-list',
  templateUrl: './stage.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    ModalComponent,

    StagesHeaderComponent,
    StagesSummaryComponent,
    StagesFiltersComponent,
    StagesTableComponent,
    StagesPaginationComponent,
    StagesFormModalComponent,
  ],
  styleUrls: ['./stage.component.scss'],
})
export class StageComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  stages: Stage[] = [];

  newStage: CreateStageDto = {
    number: '',
    description: '',
  };

  selectedStage: Stage | null = null;


  /* =========================
     FILTERS
  ========================= */

  searchTerm = '';


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


  /* =========================
     MODALS
  ========================= */

  isCreateModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  modal: ModalDto =
    modalInitializer();


  /* =========================
     NOTIFICATION
  ========================= */

  isNotificationModalOpen = false;

  notificationMessage = '';

  notificationType:
    'success' | 'error' =
    'success';


  constructor(
    private stagesService: StagesService,
  ) {}


  ngOnInit(): void {
    this.loadStages();
  }


  /* =========================
     LOAD
  ========================= */

  loadStages(): void {
    this.stagesService
      .getAll()
      .subscribe({
        next: (data) => {
          this.stages = data;

          if (
            this.page >
            this.totalPages
          ) {
            this.page =
              this.totalPages;
          }
        },

        error: (error) => {
          console.error(
            'Error fetching stages:',
            error,
          );

          this.showNotification(
            'Error al cargar los stages',
            'error',
          );
        },
      });
  }


  /* =========================
     FILTERED STAGES
  ========================= */

  get filteredStages(): Stage[] {
    const term =
      this.searchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return this.stages;
    }

    return this.stages.filter(
      stage => {
        const number =
          stage.number
            ?.toLowerCase() ||
          '';

        const description =
          stage.description
            ?.toLowerCase() ||
          '';

        const id =
          String(stage.id);

        return (
          number.includes(term) ||
          description.includes(term) ||
          id.includes(term)
        );
      },
    );
  }


  /* =========================
     PAGED STAGES
  ========================= */

  get pagedStages(): Stage[] {
    const start =
      (this.page - 1) *
      this.limit;

    return this.filteredStages.slice(
      start,
      start + this.limit,
    );
  }


  /* =========================
     SEARCH
  ========================= */

  onSearchChange(
    value: string,
  ): void {
    this.searchTerm =
      value || '';

    this.page = 1;
  }


  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
  }


  /* =========================
     CREATE
  ========================= */

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }


  closeCreateModal(): void {
    this.isCreateModalOpen = false;

    this.newStage = {
      number: '0',
      description: '',
    };
  }


  createStage(): void {
    this.stagesService
      .create(this.newStage)
      .subscribe(
        () => {
          this.loadStages();

          this.showNotification(
            'Stage creado exitosamente',
            'success',
          );

          this.closeCreateModal();
        },

        error => {
          console.error(
            'Error creating stage:',
            error,
          );

          this.showNotification(
            'No se pudo crear el stage',
            'error',
          );
        },
      );
  }


  /* =========================
     CREATE CONFIRMATION
  ========================= */

  confirmCreateStage(): void {
    if (
      !this.newStage.number ||
      !this.newStage.description
    ) {
      return;
    }

    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        `¿Deseas crear el Stage ${this.newStage.number}?`,

      isError: false,
      isSuccess: false,
      isInfo: true,

      showButtons: true,

      confirm: () => {
        this.modal.show = false;
        this.createStage();
      },

      close: () => {
        this.modal.show = false;
      },
    };
  }


  /* =========================
     EDIT
  ========================= */

  openEditModal(
    stage: Stage,
  ): void {
    this.selectedStage = {
      ...stage,
    };

    this.isEditModalOpen = true;
  }


  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedStage = null;
  }


  updateStage(): void {
    if (this.selectedStage) {
      this.stagesService
        .update(
          this.selectedStage.id,
          this.selectedStage,
        )
        .subscribe(
          () => {
            this.loadStages();

            this.showNotification(
              'Stage actualizado exitosamente',
              'success',
            );

            this.closeEditModal();
          },

          error => {
            console.error(
              'Error updating stage:',
              error,
            );

            this.showNotification(
              'No se pudo actualizar el stage',
              'error',
            );
          },
        );
    }
  }


  /* =========================
     EDIT CONFIRMATION
  ========================= */

  confirmUpdateStage(): void {
    if (!this.selectedStage) {
      return;
    }

    const stageNumber =
      this.selectedStage.number;

    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        `¿Deseas guardar los cambios del Stage ${stageNumber}?`,

      isError: false,
      isSuccess: false,
      isInfo: true,

      showButtons: true,

      confirm: () => {
        this.modal.show = false;
        this.updateStage();
      },

      close: () => {
        this.modal.show = false;
      },
    };
  }


  /* =========================
     DELETE
  ========================= */

  openDeleteModal(
    stage: Stage,
  ): void {
    this.selectedStage = stage;

    /*
     * Se conserva el estado original.
     */
    this.isDeleteModalOpen = true;

    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        `¿Deseas eliminar el Stage ${stage.number}?`,

      isError: false,
      isSuccess: false,
      isInfo: true,

      showButtons: true,

      confirm: () => {
        this.modal.show = false;
        this.deleteStage();
      },

      close: () => {
        this.closeDeleteModal();
      },
    };
  }


  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;

    this.modal.show = false;

    this.selectedStage = null;
  }


  deleteStage(): void {
    if (this.selectedStage) {
      this.stagesService
        .delete(
          this.selectedStage.id,
        )
        .subscribe(
          () => {
            this.loadStages();

            this.showNotification(
              'Stage eliminado exitosamente',
              'success',
            );

            this.closeDeleteModal();
          },

          error => {
            console.error(
              'Error deleting stage:',
              error,
            );

            this.showNotification(
              'No se pudo eliminar el stage',
              'error',
            );
          },
        );
    }
  }


  /* =========================
     NOTIFICATION
  ========================= */

  showNotification(
    message: string,
    type: 'success' | 'error',
  ): void {
    this.notificationMessage =
      message;

    this.notificationType =
      type;

    this.isNotificationModalOpen =
      true;

    /*
     * También utilizamos el modal
     * global para el resultado.
     */

    this.modal = {
      ...modalInitializer(),

      show: true,

      message,

      isSuccess:
        type === 'success',

      isError:
        type === 'error',

      isInfo: false,

      showButtons: false,

      close: () => {
        this.modal.show = false;

        this.isNotificationModalOpen =
          false;
      },
    };

    setTimeout(() => {
      this.isNotificationModalOpen =
        false;

      this.modal.show = false;
    }, 2000);
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
    return this.filteredStages.length;
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
      return '0 stages';
    }

    return (
      `Página ${this.page} de ${this.totalPages} ` +
      `(${this.total} stages)`
    );
  }
}