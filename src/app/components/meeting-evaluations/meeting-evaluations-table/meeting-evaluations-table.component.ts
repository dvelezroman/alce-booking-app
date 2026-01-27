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

  @Input() updatingEvaluationId: number | null = null;

  @Output() acceptanceToggled = new EventEmitter<{
    id: number;
    accepted: boolean;
  }>();

  @Output() evaluationSelected = new EventEmitter<InstructorEvaluation>();

  selectEvaluation(evaluation: InstructorEvaluation): void {
    this.evaluationSelected.emit(evaluation);
  }

  isUpdating(id: number): boolean {
    return this.updatingEvaluationId === id;
  }

  onToggleAccepted(
    evaluation: InstructorEvaluation,
    event: Event
  ): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.acceptanceToggled.emit({
      id: evaluation.id,
      accepted: checked
    });
  }
}