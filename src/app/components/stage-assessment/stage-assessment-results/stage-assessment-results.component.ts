import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageProgressByStage } from '../../../services/dtos/stage-progress.dto';

@Component({
  selector: 'app-stage-assessment-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-assessment-results.component.html',
  styleUrls: ['./stage-assessment-results.component.scss']
})
export class StageAssessmentResultsComponent {
  @Input() progressList: StageProgressByStage = [];
  
}