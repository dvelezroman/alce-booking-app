import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-instructor-meetings-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './instructor-meetings-header.component.html',
  styleUrl: './instructor-meetings-header.component.scss',
})
export class InstructorMeetingsHeaderComponent {

  @Input() isPreparationOpen: boolean = false;

  @Output() prepareAssistance = new EventEmitter<void>();

  @Output() createMeeting = new EventEmitter<void>();

  onPrepareAssistance(): void {
    this.prepareAssistance.emit();
  }

  onCreateMeeting(): void {
    this.createMeeting.emit();
  }
}