import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  InstructorEvaluation
} from '../../../services/dtos/instructor-evaluation.dto';

import {
  CompletedEvaluationCardComponent
} from '../completed-evaluation-card/completed-evaluation-card.component';

@Component({
  selector: 'app-completed-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    CompletedEvaluationCardComponent
],
  templateUrl: './completed-evaluations.component.html',
  styleUrl: './completed-evaluations.component.scss'
})
export class CompletedEvaluationsComponent {

  @Input()
  evaluations: InstructorEvaluation[] = [];

  @Input()
  loading = false;

  @Output()
  viewEvaluation =
    new EventEmitter<InstructorEvaluation>();

  get hasEvaluations(): boolean {
    return this.evaluations.length > 0;
  }

  get evaluationsCount(): number {
    return this.evaluations.length;
  }

  trackByEvaluationId(
    index: number,
    evaluation: InstructorEvaluation
  ): number {
    return evaluation.id;
  }

  onViewEvaluation(
    evaluation: InstructorEvaluation
  ): void {
    this.viewEvaluation.emit(evaluation);
  }
}