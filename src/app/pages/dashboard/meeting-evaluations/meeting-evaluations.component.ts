import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstructorEvaluationService } from '../../../services/instructor-evaluation.service';
import { FilterEvaluationsDto, InstructorEvaluation } from '../../../services/dtos/instructor-evaluation.dto';

import { MeetingEvaluationsFiltersComponent } from '../../../components/meeting-evaluations/meeting-evaluations-filters/meeting-evaluations-filters.component';
import { MeetingEvaluationsTableComponent } from '../../../components/meeting-evaluations/meeting-evaluations-table/meeting-evaluations-table.component';
import { MeetingEvaluationDetailModalComponent } from '../../../components/meeting-evaluations/meeting-evaluation-detail-modal/meeting-evaluation-detail-modal.component';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-meeting-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    MeetingEvaluationsFiltersComponent,
    MeetingEvaluationsTableComponent,
    MeetingEvaluationDetailModalComponent,
    ModalComponent
  ],
  templateUrl: './meeting-evaluations.component.html',
  styleUrl: './meeting-evaluations.component.scss'
})
export class MeetingEvaluationsComponent implements OnInit {

  evaluations: InstructorEvaluation[] = [];
  selectedEvaluation: InstructorEvaluation | null = null;
  updatingEvaluationId: number | null = null;

  showInstructorColumn = true;
  showStudentColumn = true;

  searchAttempted = false;
  showEvaluationModal = false;

  modal: ModalDto = modalInitializer();

  // SORT
  sortBy: 'rating' | 'createdAt' = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  private lastFilters?: FilterEvaluationsDto;

  constructor(
    private evaluationService: InstructorEvaluationService
  ) {}

  ngOnInit(): void {
    const { from, to } = this.getDefaultDateRange();

    const initialFilters: FilterEvaluationsDto = {
      from,
      to,
      accepted: true,
      limit: 100,
      offset: 0,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.lastFilters = initialFilters;
    this.fetchEvaluations(initialFilters);
  }

  private getDefaultDateRange(): { from: string; to: string } {
    const today = new Date();
    const to = today.toISOString().split('T')[0];

    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 20);
    const from = fromDate.toISOString().split('T')[0];

    return { from, to };
  }

  // ===========================
  // FILTROS DESDE HIJO
  // ===========================
  onFiltersSubmitted(filters: FilterEvaluationsDto): void {

    if (!filters.from || !filters.to) {
      this.showAutoCloseModal(
        { isInfo: true, message: 'Debes seleccionar un rango de fechas' },
        3000
      );
      return;
    }

    this.showInstructorColumn = !filters.instructorId;
    this.showStudentColumn = !filters.studentId;

    this.lastFilters = {
      ...filters,
      accepted: true,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.fetchEvaluations(this.lastFilters);
  }

  // ===========================
  // SORT BUTTONS
  // ===========================
  changeSort(field: 'rating' | 'createdAt'): void {

    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
    }

    if (!this.lastFilters) return;

    const updatedFilters: FilterEvaluationsDto = {
      ...this.lastFilters,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.lastFilters = updatedFilters;
    this.fetchEvaluations(updatedFilters);
  }

  // ===========================
  // FETCH
  // ===========================
  private fetchEvaluations(filters: FilterEvaluationsDto): void {
    this.searchAttempted = true;
    this.evaluations = [];
    this.selectedEvaluation = null;

    this.evaluationService.getEvaluations(filters).subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
      },
      error: () => {
        this.evaluations = [];
      }
    });
  }

  // ===========================
  // ACCEPTANCE
  // ===========================
  onAcceptanceToggled(event: { id: number; accepted: boolean }): void {
    this.updatingEvaluationId = event.id;

    this.evaluationService.updateEvaluationAcceptance(event.id, {accepted: event.accepted})
      .subscribe({
        next: (updatedEvaluation) => {

          const index = this.evaluations.findIndex(
            e => e.id === updatedEvaluation.id
          );

          if (index !== -1) {
            this.evaluations[index] = updatedEvaluation;
          }

          this.updatingEvaluationId = null;
        },
        error: () => {
          this.showAutoCloseModal(
            {
              isError: true,
              message: 'No se pudo actualizar la validación de la evaluación'
            },
            3000
          );

          this.updatingEvaluationId = null;
        }
      });
  }

  // ===========================
  // MODAL
  // ===========================
  onEvaluationSelected(evaluation: InstructorEvaluation): void {
    this.selectedEvaluation = evaluation;
    this.showEvaluationModal = true;
  }

  closeEvaluationModal(): void {
    this.showEvaluationModal = false;
    this.selectedEvaluation = null;
  }

  private showAutoCloseModal(
    config: Partial<ModalDto>,
    duration = 3000
  ) {
    this.modal = {
      ...modalInitializer(),
      ...config,
      show: true,
      close: () => {
        this.modal.show = false;
      }
    };

    setTimeout(() => {
      this.modal.show = false;
    }, duration);
  }
}