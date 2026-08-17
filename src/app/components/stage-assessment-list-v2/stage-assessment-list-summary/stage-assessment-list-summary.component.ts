import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stage-assessment-list-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stage-assessment-list-summary.component.html',
  styleUrl: './stage-assessment-list-summary.component.scss',
})
export class StageAssessmentListSummaryComponent {

  @Input() totalAssessments = 0;
  @Input() totalAssignedStudents = 0;
  @Input() totalPastDueAssessments = 0;
  @Input() totalFinishedStudents = 0;
  @Input() loading = false;
}