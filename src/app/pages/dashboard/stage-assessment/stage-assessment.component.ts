import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StageAssessmentFilterComponent } from '../../../components/stage-assessment/stage-assessment-filter/stage-assessment-filter.component';
import { StageAssessmentResultsComponent } from "../../../components/stage-assessment/stage-assessment-results/stage-assessment-results.component";

import { StageProgressService } from '../../../services/stage-progress';
import { StageProgressByStage } from '../../../services/dtos/stage-progress.dto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stage-assessment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StageAssessmentFilterComponent,
    StageAssessmentResultsComponent
  ],
  templateUrl: './stage-assessment.component.html',
  styleUrl: './stage-assessment.component.scss',
})
export class StageAssessmentComponent implements OnInit {

  selectedStageId?: number;

  // --- LISTAS ---
  stageProgressList: StageProgressByStage = [];
  filteredList: StageProgressByStage = [];
  pagedList: StageProgressByStage = [];

  // --- PAGINACIÓN ---
  page = 1;
  limit = 20;
  total = 0;

  // --- BUSCADOR ---
  searchTerm: string = "";

  constructor(private stageProgressService: StageProgressService) {}

  ngOnInit() {}

  // Cuando selecciona un stage
  onStageSelected(stageId: number) {
    this.selectedStageId = stageId;
    if (!stageId) return;
    this.fetchProgressForStage(stageId);
  }

  // Fetch principal
  private fetchProgressForStage(stageId: number) {
    this.stageProgressService.getProgressForStage(stageId).subscribe({
      next: (data) => {
        this.stageProgressList = data || [];

        // inicializar el filtrado con toda la data
        this.filteredList = [...this.stageProgressList];

        this.total = this.filteredList.length;
        this.page = 1;
        this.updatePagedList();
      },
      error: (err) => {
        console.error('Error al obtener progreso por stage:', err);
        this.stageProgressList = [];
        this.filteredList = [];
        this.pagedList = [];
        this.total = 0;
      },
    });
  }

  // ==== BUSCADOR ====
  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      // restaurar toda la lista
      this.filteredList = [...this.stageProgressList];
    } else {
      this.filteredList = this.stageProgressList.filter(item => {
        const first = item.student.user?.firstName?.toLowerCase() || "";
        const last  = item.student.user?.lastName?.toLowerCase() || "";
        return first.includes(term) || last.includes(term);
      });
    }

    this.total = this.filteredList.length;
    this.page = 1;
    this.updatePagedList();
  }

  // ==== PAGINACIÓN ====
  updatePagedList() {
    const start = (this.page - 1) * this.limit;
    const end   = start + this.limit;

    this.pagedList = this.filteredList.slice(start, end);
  }

  onPrev() {
    if (this.page > 1) {
      this.page--;
      this.updatePagedList();
    }
  }

  onNext() {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.updatePagedList();
    }
  }

  // Helpers
  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    const end = this.page * this.limit;
    return end > this.total ? this.total : end;
  }
}