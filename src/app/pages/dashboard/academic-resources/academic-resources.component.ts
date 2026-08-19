import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer
} from '../../../components/modal/modal.dto';

import { AssessmentResourceI } from '../../../services/dtos/assessment-resources.dto';
import { AssessmentResourcesService } from '../../../services/assessment-resources.service';

import { ResourcesHeaderComponent } from '../../../components/resources/resources-header/resources-header.component';
import { ResourcesFiltersComponent } from '../../../components/resources/resources-filters/resources-filters.component';
import { ResourcesTableComponent } from '../../../components/resources/resources-table/resources-table.component';
import { ResourcesSummaryComponent } from '../../../components/resources/resources-summary/resources-summary.component';
import { ResourceFormModalComponent } from '../../../components/resources/resource-form-modal/resource-form-modal.component';
import { ResourceDetailModalComponent } from '../../../components/resources/resource-detail-modal/resource-detail-modal.component';


@Component({
  selector: 'app-academic-resources',
  standalone: true,
  imports: [
    CommonModule,

    ResourcesHeaderComponent,
    ResourcesFiltersComponent,
    ResourcesTableComponent,
    ResourcesSummaryComponent,
    ResourceFormModalComponent,
    ResourceDetailModalComponent,

    ModalComponent
  ],
  templateUrl: './academic-resources.component.html',
  styleUrl: './academic-resources.component.scss'
})
export class AcademicResourcesComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  resources: AssessmentResourceI[] = [];
  filteredResources: AssessmentResourceI[] = [];

  selectedResource: AssessmentResourceI | null = null;


  /* =========================
     LOADING
  ========================= */

  isLoading = false;


  /* =========================
     FILTERS
  ========================= */

  searchTerm = '';
  selectedStatus = 'all';


  /* =========================
     MODALS
  ========================= */

  modal: ModalDto = modalInitializer();

  showResourceFormModal = false;
  showResourceDetailModal = false;

  resourceFormMode: 'create' | 'edit' = 'create';


  constructor(
    private assessmentResourcesService: AssessmentResourcesService
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadResources();
  }


  /* =========================
     LOAD RESOURCES
  ========================= */

  loadResources(): void {
    this.isLoading = true;

    this.assessmentResourcesService.getAll().subscribe({
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

  handleSearchTermChange(
    searchTerm: string,
  ): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }


  handleStatusChange(
    status: string,
  ): void {
    this.selectedStatus = status;
    this.applyFilters();
  }


  handleSearch(): void {
    this.applyFilters();
  }


  handleClearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';

    this.applyFilters();
  }


  private applyFilters(): void {
    const normalizedSearch = this.searchTerm
      .trim()
      .toLowerCase();

    this.filteredResources = this.resources.filter(
      (resource) => {

        const matchesSearch =
          !normalizedSearch ||
          resource.title
            ?.toLowerCase()
            .includes(normalizedSearch);

        /*
         * Por ahora dejamos el filtro de estado preparado.
         *
         * Cuando confirmemos cómo viene el estado
         * en AssessmentResourceI,
         * aquí colocamos la validación real.
         */
        const matchesStatus =
          this.selectedStatus === 'all'
            ? true
            : true;

        return matchesSearch && matchesStatus;
      }
    );
  }


  /* =========================
     CREATE RESOURCE
  ========================= */

  openCreateResourceModal(): void {
    this.selectedResource = null;
    this.resourceFormMode = 'create';
    this.showResourceFormModal = true;
  }


  handleCreateResource(
    resource: {
      title: string;
      link: string;
    }
  ): void {

    this.assessmentResourcesService
      .create(resource)
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
            'Error al crear el recurso',
            true
          );
        }
      });
  }


  /* =========================
     EDIT RESOURCE
  ========================= */

  openEditResourceModal(
    resource: AssessmentResourceI
  ): void {

    this.selectedResource = resource;
    this.resourceFormMode = 'edit';
    this.showResourceFormModal = true;
  }


  handleUpdateResource(
    resourceData: {
      title: string;
      link: string;
    }
  ): void {

    if (!this.selectedResource) {
      return;
    }

    this.assessmentResourcesService
      .update(
        this.selectedResource.id,
        resourceData
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
            'Error al actualizar el recurso',
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
    resource: AssessmentResourceI
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
    resource: AssessmentResourceI
  ): void {

    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        `¿Estás seguro de eliminar el recurso "${resource.title}"?`,

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


  deleteResource(id: number): void {

    this.assessmentResourcesService
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
            'Error al eliminar el recurso',
            true
          );
        }
      });
  }


  /* =========================
     NOTIFICATIONS
  ========================= */

  showNotification(
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
    }, 2500);
  }


  /* =========================
     SUMMARY
  ========================= */

  get totalResources(): number {
    return this.resources.length;
  }


  get activeResources(): number {
    /*
     * Por ahora retornamos el total.
     * Luego lo conectamos al estado real
     * cuando veamos AssessmentResourceI.
     */
    return this.resources.length;
  }


  get resourcesWithLink(): number {
    return this.resources.filter(
      resource => !!resource.link
    ).length;
  }

}