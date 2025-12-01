import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assessment-announcement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-announcement.component.html',
  styleUrls: ['./assessment-announcement.component.scss'],
})
export class AssessmentAnnouncementComponent {
  
  @Input() show = false;
  @Input() count: number = 0;

  @Output() closed = new EventEmitter<void>();

  close() {
    localStorage.setItem('assessment_announced', 'true');
    this.closed.emit();
  }
}