import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';

@Component({
  selector: 'app-stage-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-assessment-card.component.html',
  styleUrls: ['./stage-assessment-card.component.scss']
})
export class StageAssessmentCardComponent {

  @Input() assessment!: StageAssessment;

  @Output() openAndFinish = new EventEmitter<number>();

  handleOpenAndFinish() {
    const url = this.assessment?.stageAssessmentResource?.url;
    if (url) {
      window.open(url, '_blank');
    }

    this.openAndFinish.emit(this.assessment.id);
  }
}