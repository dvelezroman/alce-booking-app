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

  getColor(progress: number): string {
    // HUE va de 280° (púrpura) → 210° (azul)
    const hue = 280 - (progress * 0.9);
    return `hsl(${hue}, 75%, 65%)`;
  }
  
}