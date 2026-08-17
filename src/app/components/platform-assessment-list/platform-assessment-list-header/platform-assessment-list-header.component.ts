import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-assessment-list-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './platform-assessment-list-header.component.html',
  styleUrl: './platform-assessment-list-header.component.scss',
})
export class PlatformAssessmentListHeaderComponent {

  @Output()
  helpRequested =
    new EventEmitter<void>();

  @Output()
  newAssignmentRequested =
    new EventEmitter<void>();


  onHelp(): void {
    this.helpRequested.emit();
  }

  onNewAssignment(): void {
    this.newAssignmentRequested.emit();
  }
}