import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageAssessmentFilterComponent } from '../../../components/stage-assessment/stage-assessment-filter/stage-assessment-filter.component';
import { StageProgressService } from '../../../services/stage-progress';
import { StageProgressByStage } from '../../../services/dtos/stage-progress.dto';
import { StageAssessmentResultsComponent } from "../../../components/stage-assessment/stage-assessment-results/stage-assessment-results.component";

@Component({
  selector: 'app-stage-assessment',
  standalone: true,
  imports: [CommonModule,
     StageAssessmentFilterComponent, 
     StageAssessmentResultsComponent],
  templateUrl: './stage-assessment.component.html',
  styleUrl: './stage-assessment.component.scss',
})
export class StageAssessmentComponent implements OnInit {
  selectedStageId?: number;
  stageProgressList: StageProgressByStage = [];

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
        this.stageProgressList = data;
      },
      error: (err) => {
        console.error('Error al obtener progreso por stage:', err);
        this.stageProgressList = [];
      },
    });
  }
}
