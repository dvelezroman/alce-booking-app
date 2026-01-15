import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorEvaluation } from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-completed-evaluations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './completed-evaluations.component.html',
  styleUrl: './completed-evaluations.component.scss'
})
export class CompletedEvaluationsComponent {
  @Input() evaluations: InstructorEvaluation[] = [];

}