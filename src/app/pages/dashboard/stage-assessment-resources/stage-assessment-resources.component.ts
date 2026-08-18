import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer
} from '../../../components/modal/modal.dto';

import {
  StageAssessmentResource
} from '../../../services/dtos/stage-resources.dto';

import {
  StageAssessmentResourcesService
} from '../../../services/stage-assessment-resources.service';

import {
  StageResourcesHeaderComponent
} from '../../../components/stage-resources/stage-resources-header/stage-resources-header.component';

import {
  StageResourcesFiltersComponent
} from '../../../components/stage-resources/stage-resources-filters/stage-resources-filters.component';

import {
  StageResourcesTableComponent
} from '../../../components/stage-resources/stage-resources-table/stage-resources-table.component';

import {
  StageResourcesSummaryComponent
} from '../../../components/stage-resources/stage-resources-summary/stage-resources-summary.component';

import {
  StageResourceFormModalComponent
} from '../../../components/stage-resources/stage-resource-form-modal/stage-resource-form-modal.component';

import {
  StageResourceDetailModalComponent
} from '../../../components/stage-resources/stage-resource-detail-modal/stage-resource-detail-modal.component';


@Component({
  selector: 'app-stage-assessment-resources',
  standalone: true,
  imports: [
    CommonModule,

    StageResourcesHeaderComponent,
    StageResourcesFiltersComponent,
    StageResourcesTableComponent,
    StageResourcesSummaryComponent,

    StageResourceFormModalComponent,
    StageResourceDetailModalComponent,

    ModalComponent
  ],
  templateUrl: './stage-assessment-resources.component.html',
  styleUrl: './stage-assessment-resources.component.scss'
})
export class StageAssessmentResourcesComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  resources: StageAssessmentResource[] = [];

  filteredResources: StageAssessmentResource[] = [];

  selectedResource: StageAssessmentResource | null = null;


  /* =========================
     LOADING
  ========================= */

  isLoading = false;


  /* =========================
     FILTERS
  ========================= */

  selectedStageId: number | null = null;

  selectedStatus = 'all';


  /* =========================
     MODALS
  ========================= */

  modal: ModalDto = modalInitializer();

  showResourceFormModal = false;

  showResourceDetailModal = false;

  resourceFormMode: 'create' | 'edit' = 'create';


  constructor(
    private service: StageAssessmentResourcesService
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadResources();
  }


  /* =========================
     LOAD
  ========================= */

  loadResources(): void {

    this.isLoading = true;

    this.service.getAll().subscribe({
      next: (resources) => {

        this.resources = resources;

        this.applyFilters();

        this.isLoading = false;
      },

      error: () => {

        this.isLoading = false;

        this.showNotification(
          'Error al cargar los recursos',
          true
        );
      }
    });
  }


  /* =========================
     FILTERS
  ========================= */

  handleStageChange(
    stageId: number | null
  ): void {

    this.selectedStageId = stageId;
  }


  handleStatusChange(
    status: string
  ): void {

    this.selectedStatus = status;
  }


  handleSearch(): void {
    this.applyFilters();
  }


  handleClearFilters(): void {

    this.selectedStageId = null;

    this.selectedStatus = 'all';

    this.applyFilters();
  }


  private applyFilters(): void {

    this.filteredResources =
      this.resources.filter(
        resource => {

          const matchesStage =
            this.selectedStageId === null ||
            resource.stageId ===
              this.selectedStageId;


          const matchesStatus =
            this.selectedStatus === 'all'
              ? true
              : this.selectedStatus === 'active'
                ? resource.active === true
                : resource.active === false;


          return (
            matchesStage &&
            matchesStatus
          );
        }
      );
  }


  /* =========================
     CREATE
  ========================= */

  openCreateResourceModal(): void {

    this.selectedResource = null;

    this.resourceFormMode = 'create';

    this.showResourceFormModal = true;
  }


  handleCreateResource(
    data: {
      stageId: number;
      description: string;
      url: string;
      active: boolean;
    }
  ): void {

    this.service
      .create(data)
      .subscribe({

        next: () => {

          this.showResourceFormModal = false;

          this.showNotification(
            'Recurso creado correctamente',
            false,
            true
          );

          this.loadResources();
        },

        error: () => {

          this.showNotification(
            'Error al crear recurso',
            true
          );
        }
      });
  }


  /* =========================
     EDIT
  ========================= */

  openEditResourceModal(
    resource: StageAssessmentResource
  ): void {

    this.selectedResource = resource;

    this.resourceFormMode = 'edit';

    this.showResourceFormModal = true;
  }


  handleUpdateResource(
    updatedData: {
      stageId: number;
      description: string;
      url: string;
      active: boolean;
    }
  ): void {

    if (!this.selectedResource) {
      return;
    }

    this.service
      .update(
        this.selectedResource.id,
        updatedData
      )
      .subscribe({

        next: () => {

          this.showResourceFormModal = false;

          this.selectedResource = null;

          this.showNotification(
            'Recurso actualizado correctamente',
            false,
            true
          );

          this.loadResources();
        },

        error: () => {

          this.showNotification(
            'Error al actualizar recurso',
            true
          );
        }
      });
  }


  /* =========================
     FORM MODAL
  ========================= */

  closeResourceFormModal(): void {

    this.showResourceFormModal = false;

    this.selectedResource = null;
  }


  /* =========================
     DETAIL MODAL
  ========================= */

  openResourceDetail(
    resource: StageAssessmentResource
  ): void {

    this.selectedResource = resource;

    this.showResourceDetailModal = true;
  }


  closeResourceDetailModal(): void {

    this.showResourceDetailModal = false;

    this.selectedResource = null;
  }


  /* =========================
     DELETE
  ========================= */

  confirmDeleteResource(
    resource: StageAssessmentResource
  ): void {

    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        '¿Seguro que deseas eliminar este recurso del Stage?',

      isInfo: true,

      showButtons: true,

      close: () => {
        this.modal.show = false;
      },

      confirm: () => {
        this.deleteResource(resource.id);
      }
    };
  }


  deleteResource(
    id: number
  ): void {

    this.service
      .delete(id)
      .subscribe({

        next: () => {

          this.modal.show = false;

          this.showNotification(
            'Recurso eliminado correctamente',
            false,
            true
          );

          this.loadResources();
        },

        error: () => {

          this.modal.show = false;

          this.showNotification(
            'Error al eliminar recurso',
            true
          );
        }
      });
  }


  /* =========================
     SUMMARY
  ========================= */

  get totalResources(): number {
    return this.resources.length;
  }


  get activeResources(): number {

    return this.resources.filter(
      resource => resource.active
    ).length;
  }


  get resourcesWithLink(): number {

    return this.resources.filter(
      resource => !!resource.url
    ).length;
  }


  /* =========================
     NOTIFICATIONS
  ========================= */

  private showNotification(
    message: string,
    isError = false,
    isSuccess = false
  ): void {

    this.modal = {
      ...modalInitializer(),

      show: true,

      message,

      isError,

      isSuccess,

      close: () => {
        this.modal.show = false;
      }
    };


    setTimeout(() => {
      this.modal.show = false;
    }, 2000);
  }

}