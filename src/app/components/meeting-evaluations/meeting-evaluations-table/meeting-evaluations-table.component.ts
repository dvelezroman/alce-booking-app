import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorEvaluation } from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-meeting-evaluations-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-evaluations-table.component.html',
  styleUrl: './meeting-evaluations-table.component.scss'
})
export class MeetingEvaluationsTableComponent {

  @Input() evaluations: InstructorEvaluation[] = [];
  @Input() searchAttempted = false;

  @Input() showInstructor = true;
  @Input() showStudent = true;

  @Output() evaluationSelected = new EventEmitter<InstructorEvaluation>();

  selectEvaluation(evaluation: InstructorEvaluation): void {
    this.evaluationSelected.emit(evaluation);
  }
  
}