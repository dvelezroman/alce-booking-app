import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-meeting-evaluations-summary',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './meeting-evaluations-summary.component.html',
  styleUrl: './meeting-evaluations-summary.component.scss'
})
export class MeetingEvaluationsSummaryComponent {

  @Input() totalEvaluations = 0;
  @Input() averageRating = 0;
  @Input() acceptedEvaluations = 0;
  @Input() acceptedPercentage = 0;
  @Input() evaluationsWithObservation = 0;
  @Input() observationPercentage = 0;
  @Input() rejectedEvaluations = 0;
  @Input() rejectedPercentage = 0;

}