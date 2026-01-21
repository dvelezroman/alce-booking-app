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

  // --------------------
  // DATA
  // --------------------
  evaluations: InstructorEvaluation[] = [];
  selectedEvaluation: InstructorEvaluation | null = null;

  // --------------------
  // UI STATE
  // --------------------
  showInstructorColumn = true;
  showStudentColumn = true;

  searchAttempted = false;
  showEvaluationModal = false;

  modal: ModalDto = modalInitializer();

  constructor(
    private evaluationService: InstructorEvaluationService
  ) {}

  ngOnInit(): void {
    const { from, to } = this.getDefaultDateRange();

    this.fetchEvaluations({
      from,
      to,
      limit: 50,
      offset: 0
    });
  }

  private getDefaultDateRange(): { from: string; to: string } {
    const today = new Date();

    const to = today.toISOString().split('T')[0];

    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 20);
    const from = fromDate.toISOString().split('T')[0];

    return { from, to };
  }
  // ----------------------------------
  // FILTROS DESDE HIJO
  // ----------------------------------
  onFiltersSubmitted(filters: FilterEvaluationsDto): void {

    // Validación obligatoria
    if (!filters.instructorId && !filters.studentId) {
      this.showAutoCloseModal(
        {
          isInfo: true,
          message: 'Debes seleccionar un instructor o un estudiante'
        },
        3000
      );
      return;
    }

    this.showInstructorColumn = !filters.instructorId;
    this.showStudentColumn = !filters.studentId;

    this.fetchEvaluations(filters);
  }

  // ----------------------------------
  // FETCH EVALUATIONS (NUEVO FLUJO)
  // ----------------------------------
  private fetchEvaluations(filters: FilterEvaluationsDto): void {
    this.searchAttempted = true;
    this.evaluations = [];
    this.selectedEvaluation = null;

    this.evaluationService.getEvaluations(filters).subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      },
      error: () => {
        this.evaluations = [];
      }
    });
  }

  // ----------------------------------
  // CLICK EN FILA (YA NO HAY FETCH)
  // ----------------------------------
  onEvaluationSelected(evaluation: InstructorEvaluation): void {
    this.selectedEvaluation = evaluation;
    this.showEvaluationModal = true;
  }

  // ----------------------------------
  // CLOSE MODAL
  // ----------------------------------
  closeEvaluationModal(): void {
    this.showEvaluationModal = false;
    this.selectedEvaluation = null;
  }

  // ----------------------------------
  // MODAL AUXILIAR
  // ----------------------------------
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