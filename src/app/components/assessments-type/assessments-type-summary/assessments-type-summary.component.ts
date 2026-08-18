import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-assessments-type-summary',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './assessments-type-summary.component.html',
  styleUrl: './assessments-type-summary.component.scss'
})
export class AssessmentsTypeSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() totalAssessmentTypes = 0;

  @Input() activeAssessmentTypes = 0;

  @Input() assessmentTypesInUse = 0;


  /* =========================
     HELPERS
  ========================= */

  get activePercentage(): number {

    if (this.totalAssessmentTypes === 0) {
      return 0;
    }

    return Math.round(
      (
        this.activeAssessmentTypes /
        this.totalAssessmentTypes
      ) * 100
    );
  }

}