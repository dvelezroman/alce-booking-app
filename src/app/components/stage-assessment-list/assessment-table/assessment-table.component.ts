import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';

@Component({
  selector: 'app-assessment-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-table.component.html',
  styleUrls: ['./assessment-table.component.scss'],
})
export class AssessmentTableComponent {

  @Input() assessments: StageAssessment[] = [];
  @Input() loading: boolean = false;

}