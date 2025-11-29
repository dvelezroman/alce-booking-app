import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentFiltersComponent } from '../../../components/stage-assessment-list/assessment-filters/assessment-filters.component';
import { StageAssessmentFilters, StageAssessment } from '../../../services/dtos/stage-assessment.dto';
import { StageAssessmentService } from '../../../services/stage-assessment.service';
import { AssessmentTableComponent } from "../../../components/stage-assessment-list/assessment-table/assessment-table.component";
import { AssessmentModalComponent } from '../../../components/stage-assessment-list/assessment-modal/assessment-modal.component';

@Component({
  selector: 'app-stage-assessment-list',
  standalone: true,
  imports: [
    CommonModule,
    AssessmentFiltersComponent,
    AssessmentTableComponent,
    AssessmentModalComponent
  ],
  templateUrl: './stage-assessment-list.component.html',
  styleUrls: ['./stage-assessment-list.component.scss'],
})
export class StageAssessmentListComponent implements OnInit {

  assessments: StageAssessment[] = [];
  loading = false;

  filters: StageAssessmentFilters = {};
  showFilters = false;

  // === Modal ===
  showModal = false;
  modalTitle = '';
  modalUsers: number[] = [];

  constructor(private stageAssessmentService: StageAssessmentService) {}

  ngOnInit(): void {
    this.fetchAssessments();
  }

  // ========================
  // FETCH PRINCIPAL
  // ========================
  fetchAssessments(filters: StageAssessmentFilters = {}) {
    this.loading = true;

    this.stageAssessmentService.getAll(filters).subscribe({
      next: (res) => {
        this.assessments = res;
        this.loading = false;
      },
      error: () => {
        this.assessments = [];
        this.loading = false;
      }
    });
  }

  // ========================
  // RECIBIR FILTROS DEL HIJO
  // ========================
  onFiltersChanged(f: StageAssessmentFilters) {
    this.filters = f;
    this.fetchAssessments(f);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // ========================
  // CLICK EN ASIGNADOS
  // ========================
  onAssigned(a: StageAssessment) {
    this.modalTitle = 'Estudiantes asignados';
    this.modalUsers = a.studentIds ?? [];
    this.showModal = true;
  }

  // ========================
  // CLICK EN FINALIZADOS
  // ========================
  onFinished(a: StageAssessment) {
    this.modalTitle = 'Estudiantes que finalizaron';
    this.modalUsers = a.finished ?? [];
    this.showModal = true;
  }

  // ========================
  // Cerrar modal
  // ========================
  closeModal() {
    this.showModal = false;
  }
}