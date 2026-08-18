import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer
} from '../../../components/modal/modal.dto';

import { AssessmentTypesService } from '../../../services/assessment-types.service';
import { AssessmentTypeI } from '../../../services/dtos/assessment-type.dto';

import {
  AssessmentsTypeHeaderComponent
} from '../../../components/assessments-type/assessments-type-header/assessments-type-header.component';

import {
  AssessmentsTypeFiltersComponent
} from '../../../components/assessments-type/assessments-type-filters/assessments-type-filters.component';

import {
  AssessmentsTypeTableComponent
} from '../../../components/assessments-type/assessments-type-table/assessments-type-table.component';

import {
  AssessmentsTypeSummaryComponent
} from '../../../components/assessments-type/assessments-type-summary/assessments-type-summary.component';

import {
  AssessmentTypeFormModalComponent
} from '../../../components/assessments-type/assessment-type-form-modal/assessment-type-form-modal.component';

import {
  AssessmentTypeDetailModalComponent
} from '../../../components/assessments-type/assessment-type-detail-modal/assessment-type-detail-modal.component';


@Component({
  selector: 'app-assessment-types',
  standalone: true,
  imports: [
    CommonModule,

    AssessmentsTypeHeaderComponent,
    AssessmentsTypeFiltersComponent,
    AssessmentsTypeTableComponent,
    AssessmentsTypeSummaryComponent,

    AssessmentTypeFormModalComponent,
    AssessmentTypeDetailModalComponent,

    ModalComponent
  ],
  templateUrl: './assessment-types.component.html',
  styleUrl: './assessment-types.component.scss'
})
export class AssessmentTypesComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  assessmentTypes: AssessmentTypeI[] = [];

  filteredAssessmentTypes: AssessmentTypeI[] = [];

  selectedAssessmentType: AssessmentTypeI | null = null;


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

  showAssessmentTypeFormModal = false;

  showAssessmentTypeDetailModal = false;

  assessmentTypeFormMode: 'create' | 'edit' = 'create';


  constructor(
    private assessmentTypesService: AssessmentTypesService
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadAssessmentTypes();
  }


  /* =========================
     LOAD
  ========================= */

  loadAssessmentTypes(): void {

    this.isLoading = true;

    this.assessmentTypesService
      .getAll()
      .subscribe({

        next: (types) => {

          this.assessmentTypes = types;

          this.applyFilters();

          this.isLoading = false;
        },

        error: () => {

          this.isLoading = false;

          this.showNotification(
            'Error al cargar los tipos de evaluación',
            true
          );
        }
      });
  }


  /* =========================
     FILTERS
  ========================= */

  handleSearchTermChange(
    searchTerm: string
  ): void {

    this.searchTerm = searchTerm;
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

    this.searchTerm = '';

    this.selectedStatus = 'all';

    this.applyFilters();
  }


  private applyFilters(): void {

    const normalizedSearch =
      this.searchTerm
        .trim()
        .toLowerCase();

    this.filteredAssessmentTypes =
      this.assessmentTypes.filter(
        type => {

          const matchesSearch =
            !normalizedSearch ||
            type.name
              ?.toLowerCase()
              .includes(normalizedSearch);


          /*
           * Dejamos el filtro de estado preparado.
           * Si AssessmentTypeI tiene una propiedad
           * active, se aplicará directamente.
           */
          const typeWithStatus =
            type as AssessmentTypeI & {
              active?: boolean;
            };


          const matchesStatus =
            this.selectedStatus === 'all'
              ? true
              : this.selectedStatus === 'active'
                ? typeWithStatus.active !== false
                : typeWithStatus.active === false;


          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
  }


  /* =========================
     CREATE
  ========================= */

  openCreateAssessmentTypeModal(): void {

    this.selectedAssessmentType = null;

    this.assessmentTypeFormMode = 'create';

    this.showAssessmentTypeFormModal = true;
  }


  handleCreateAssessmentType(
    type: {
      name: string;
      description?: string;
    }
  ): void {

    this.assessmentTypesService
      .create(type)
      .subscribe({

        next: () => {

          this.showAssessmentTypeFormModal = false;

          this.showNotification(
            'Tipo de evaluación creado correctamente',
            false,
            true
          );

          this.loadAssessmentTypes();
        },

        error: () => {

          this.showNotification(
            'Error al crear el tipo de evaluación',
            true
          );
        }
      });
  }


  /* =========================
     EDIT
  ========================= */

  openEditAssessmentTypeModal(
    type: AssessmentTypeI
  ): void {

    this.selectedAssessmentType = type;

    this.assessmentTypeFormMode = 'edit';

    this.showAssessmentTypeFormModal = true;
  }


  handleUpdateAssessmentType(
    updatedData: {
      name: string;
      description?: string;
    }
  ): void {

    if (
      !this.selectedAssessmentType?.id
    ) {
      return;
    }

    this.assessmentTypesService
      .update(
        this.selectedAssessmentType.id,
        updatedData
      )
      .subscribe({

        next: () => {

          this.showAssessmentTypeFormModal = false;

          this.selectedAssessmentType = null;

          this.showNotification(
            'Tipo de evaluación actualizado correctamente',
            false,
            true
          );

          this.loadAssessmentTypes();
        },

        error: () => {

          this.showNotification(
            'Error al actualizar el tipo de evaluación',
            true
          );
        }
      });
  }


  /* =========================
     FORM MODAL
  ========================= */

  closeAssessmentTypeFormModal(): void {

    this.showAssessmentTypeFormModal = false;

    this.selectedAssessmentType = null;
  }


  /* =========================
     DETAIL MODAL
  ========================= */

  openAssessmentTypeDetail(
    type: AssessmentTypeI
  ): void {

    this.selectedAssessmentType = type;

    this.showAssessmentTypeDetailModal = true;
  }


  closeAssessmentTypeDetailModal(): void {

    this.showAssessmentTypeDetailModal = false;

    this.selectedAssessmentType = null;
  }


  /* =========================
     DELETE
  ========================= */

  confirmDeleteType(
    type: AssessmentTypeI
  ): void {

    if (!type.id) {
      return;
    }

    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        '¿Estás seguro de eliminar el tipo de evaluación?',

      isInfo: true,

      showButtons: true,

      close: () => {
        this.modal.show = false;
      },

      confirm: () => {
        this.deleteAssessmentType(type.id!);
      }
    };
  }


  deleteAssessmentType(
    id: number
  ): void {

    this.assessmentTypesService
      .delete(id)
      .subscribe({

        next: () => {

          this.modal.show = false;

          this.showNotification(
            'Tipo de evaluación eliminado correctamente',
            false,
            true
          );

          this.loadAssessmentTypes();
        },

        error: () => {

          this.modal.show = false;

          this.showNotification(
            'Error al eliminar el tipo de evaluación',
            true
          );
        }
      });
  }


  /* =========================
     SUMMARY
  ========================= */

  get totalAssessmentTypes(): number {
    return this.assessmentTypes.length;
  }


  get activeAssessmentTypes(): number {

    return this.assessmentTypes.filter(
      type => {

        const typeWithStatus =
          type as AssessmentTypeI & {
            active?: boolean;
          };

        return typeWithStatus.active !== false;
      }
    ).length;
  }


  get assessmentTypesInUse(): number {

    /*
     * Queda preparado hasta conocer
     * el campo real que indique si el
     * tipo está siendo usado.
     */
    return this.assessmentTypes.length;
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
    }, 2500);
  }

}