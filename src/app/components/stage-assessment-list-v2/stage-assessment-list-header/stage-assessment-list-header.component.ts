import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-stage-assessment-list-header',
  standalone: true,
  imports: [],
  templateUrl: './stage-assessment-list-header.component.html',
  styleUrl: './stage-assessment-list-header.component.scss',
})
export class StageAssessmentListHeaderComponent {

  @Output()
  newAssessmentRequested =
    new EventEmitter<void>();


  onNewAssessment(): void {
    this.newAssessmentRequested.emit();
  }
}