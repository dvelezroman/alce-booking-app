import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StageAssessmentFilterComponent } from '../../../components/stage-assessment/stage-assessment-filter/stage-assessment-filter.component';
import { StageAssessmentResultsComponent } from "../../../components/stage-assessment/stage-assessment-results/stage-assessment-results.component";

import { StageProgressService } from '../../../services/stage-progress';
import { StageProgressByStage } from '../../../services/dtos/stage-progress.dto';

@Component({
  selector: 'app-stage-assessment',
  standalone: true,
  imports: [
    CommonModule,
    StageAssessmentFilterComponent,
    StageAssessmentResultsComponent
  ],
  templateUrl: './stage-assessment.component.html',
  styleUrl: './stage-assessment.component.scss',
})
export class StageAssessmentComponent implements OnInit {

  selectedStageId?: number;
  stageProgressList: StageProgressByStage = [];

  pagedList: StageProgressByStage = [];
  page = 1;
  limit = 15;
  total = 0;

  constructor(private stageProgressService: StageProgressService) {}

  ngOnInit() {}

  onStageSelected(stageId: number) {
    this.selectedStageId = stageId;

    if (!stageId) return;

    this.fetchProgressForStage(stageId);
  }

  private fetchProgressForStage(stageId: number) {
    this.stageProgressService.getProgressForStage(stageId).subscribe({
      next: (data) => {
        this.stageProgressList = data || [];
        this.total = this.stageProgressList.length;

        this.page = 1; 
        this.updatePagedList();
      },
      error: (err) => {
        console.error('Error al obtener progreso por stage:', err);
        this.stageProgressList = [];
        this.pagedList = [];
        this.total = 0;
      },
    });
  }

  // Cortar la lista según la página actual
  updatePagedList() {
    const start = (this.page - 1) * this.limit;
    const end = start + this.limit;

    this.pagedList = this.stageProgressList.slice(start, end);
  }

  // Prev
  onPrev() {
    if (this.page > 1) {
      this.page--;
      this.updatePagedList();
    }
  }

  // Next
  onNext() {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.updatePagedList();
    }
  }

  // Helpers para texto
  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    const end = this.page * this.limit;
    return end > this.total ? this.total : end;
  }

}