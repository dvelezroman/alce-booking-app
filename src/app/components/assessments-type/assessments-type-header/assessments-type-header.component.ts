import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-assessments-type-header',
  standalone: true,
  imports: [],
  templateUrl: './assessments-type-header.component.html',
  styleUrl: './assessments-type-header.component.scss'
})
export class AssessmentsTypeHeaderComponent {

  @Output() createAssessmentType =
    new EventEmitter<void>();


  onCreateAssessmentType(): void {
    this.createAssessmentType.emit();
  }

}