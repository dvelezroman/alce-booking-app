import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessementI } from '../../../services/dtos/assessment.dto';

@Component({
  selector: 'app-assessment-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-table.component.html',
  styleUrls: ['./assessment-table.component.scss']
})
export class AssessmentTableComponent {
  @Input() assessments: AssessementI[] = [];
  @Input() maxPointsAssessment: number | null = null;

  isMaxReached(points: number): boolean {
    return this.maxPointsAssessment !== null && points >= this.maxPointsAssessment;
  }

  isBelowMax(points: number): boolean {
    return this.maxPointsAssessment !== null && points < this.maxPointsAssessment;
  }
}
