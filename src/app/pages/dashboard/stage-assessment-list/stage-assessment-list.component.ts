import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentFiltersComponent } from '../../../components/stage-assessment-list/assessment-filters/assessment-filters.component';
import { StageAssessmentFilters, StageAssessment } from '../../../services/dtos/stage-assessment.dto';
import { StageAssessmentService } from '../../../services/stage-assessment.service';
import { AssessmentTableComponent } from "../../../components/stage-assessment-list/assessment-table/assessment-table.component";

@Component({
  selector: 'app-stage-assessment-list',
  standalone: true,
  imports: [
    CommonModule,
    AssessmentFiltersComponent,
    AssessmentTableComponent,
],
  templateUrl: './stage-assessment-list.component.html',
  styleUrls: ['./stage-assessment-list.component.scss'],
})
export class StageAssessmentListComponent implements OnInit {

  assessments: StageAssessment[] = [];
  loading = false;

  filters: StageAssessmentFilters = {};
  showFilters = false;

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
}